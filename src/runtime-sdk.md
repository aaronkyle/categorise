# Runtime SDK

Tools for observation and manipulation of the Observable Runtime.


    ```js
    import {runtime, thisModule, observe, variables, descendants, lookupVariable, toObject} from '@tomlarkworthy/runtime-sdk'
    ```

### viewof variables

the live view of variables in a runtime

```js echo
// live view of all the variables
const variables = function (runtime) {
  const view = Inputs.input(runtime._variables);
  observeSet(runtime._variables, () => {
    // There is a delay before the variable names are updated
    setTimeout(() => {
      view.value = runtime._variables;
      view.dispatchEvent(new Event("input", { bubbles: true }));
    }, 0);
  });
  return view;
}
```

```js echo
const runtime_variables = view(variables(runtime))
```

```js echo
runtime_variables
```

### descendants

live view of a variable (s) and all its dataflow successors

```js echo
const descendants = function (...variables) {
  const results = new Set(variables);
  const queue = variables;
  do {
    [...queue.pop()._outputs].forEach((v) => {
      if (!results.has(v)) {
        results.add(v);
        queue.push(v);
      }
    });
  } while (queue.length);
  return results;
}
```

```js echo
const decendants_example = [...descendants(lookupVariable("runtime", main))].map(
  toObject
)
```

### lookupVariable
lookup a variable by module

```js echo
const lookupVariable = (name, module) => module._scope.get(name)
```

### observe(variable)

This was monstrously difficult to develop. Taps a variable, intercepting all observer calls `["fulfilled", "rejected", "pending"]` whilst preserving the behaviour of the existing observer attached to the variable. If `detachNodes` is `true` and the the existing observer hosts a DOM node, the additional variable "steals" it for it's DOM tree. When the observer attaches, if the variable is already fulfilled, the observer is signalled.

Currently unobserved variables are marked as reachable and become active.

```js echo
const trace_variable = "---"
```

```js echo
const no_observer = () => {
  const variable = main.variable();
  const symbol = variable._observer;
  variable.delete();
  return symbol;
}
```

```js echo
function observe(v, observer, { invalidation, detachNodes = false } = {}) {
  const cancels = new Set();
  const onCancel = () => cancels.forEach((f) => f());
  if (invalidation) invalidation.then(onCancel);

  if (v?._name === trace_variable) {
    console.log("observe", trace_variable, v);
    debugger;
  }

  if (_.isEqual(v._observer, {}) || v._observer === no_observer) {
    // No existing observer, so we install one
    if (!v._reachable) {
      // the the variable is not reachable, we mark it as reachable
      // and trigger a recompute
      v._reachable = true;
      v._module._runtime._dirty.add(v);
      v._module._runtime._updates.add(v);
    }
    let previous = v._observer;
    v._observer = observer;
    cancels.add(() => (v._observer = previous));
  } else {
    // intercepts an existing observer handler
    ["fulfilled", "rejected", "pending"].forEach((type) => {
      const old = v._observer[type];
      v._observer[type] = (...args) => {
        if (v?._name === trace_variable) {
          console.log(trace_variable, type, ...args);
        }
        // The old is often a prototype, so we use Reflect to call it
        if (old) {
          if (v?._name === trace_variable) {
            console.log(`previous: ${type} ${trace_variable}`);
          }
          Reflect.apply(old, v._observer, args);
          if (type === "fulfilled") {
            if (
              detachNodes &&
              isnode(args[0]) &&
              observer._node !== args[0].parentNode
            ) {
              if (v?._name === trace_variable) {
                console.log(`dettaching existing DOM: ${trace_variable}`);
              }
              args[0].remove();
            }
          }
        }
        if (v?._name === trace_variable) {
          console.log(`tapped ${trace_variable} ${type}`);
        }
        if (observer[type]) observer[type](...args);
      };
      cancels.add(() => (v._observer[type] = old));
    });
    if (v?._name === trace_variable) {
      debugger;
      console.log(`checking`, trace_variable, v, toObject(v), v._value);
    }
  }
  // Resolve initial state
  if (v._value !== undefined) {
    setTimeout(() => {
      if (
        detachNodes &&
        isnode(v._value) &&
        observer._node !== v._value.parentNode
      ) {
        if (v?._name === trace_variable) {
          console.log(`dettaching existing DOM: ${trace_variable}`);
        }
        v._value.remove();
      }
      if (v?._name === trace_variable) {
        console.log(`tapped fulfilled: ${trace_variable}`);
      }
      observer.fulfilled(v._value, v._name);
    }, 0);
  } else {
    // either in pending or error state, we can check by racing a promise
    getPromiseState(v._promise).then(({ state, error, value }) => {
      if (state == "rejected") {
        if (observer.rejected) observer.rejected(error, v._name);
      } else if (state == "pending") {
        if (observer.pending) observer.pending();
      } else if (state == "fulfilled") {
        if (observer.fulfilled) observer.fulfilled(value, v._name);
      }
    });
  }
  return onCancel;
}
```

## keepalive

Keep a named cell evaluated. Useful to keep background tasks alive even after importing.

```js echo
const keepalive = (module, variable_name) => {
  if (variable_name === undefined) debugger;
  const name = `dynamic observe ${variable_name}`;
  console.log(`keepalive: ${name}`);
  if (module._scope.has(name)) return;
  const variable = module.variable({}).define(name, [variable_name], (m) => m);
  return () => variable.delete();
}
```

## isOnObservableCom

```js echo
const isOnObservableCom = () =>
  location.href.includes("observableusercontent.com") &&
  !location.href.includes("blob:")
```

## viewof thisModule

Use like this

      ```
      viewof notebookModule = thisModule()
      ```

```js
const myModule = view(thisModule())
```

```js echo
const thisModule = async () => {
  const view = new EventTarget();
  view.tag = Symbol();
  let module = undefined;

  return Object.defineProperty(view, "value", {
    get: () => {
      if (module) return module;
      find_with_tag(view.tag).then((v) => {
        module = v._module;
        view.dispatchEvent(new Event("input"));
      });
    }
  });
}
```

```js echo
const find_with_tag = (tag) => {
  return new Promise((resolve) => {
    [...runtime._variables].map((v) => {
      if (v?._value?.tag == tag) {
        resolve(v);
      }
    });
  });
}
```

## Utils

### unorderedSync
Helper for syncing two arrays

```js echo
const unorderedSync = (goal, current, identityFn = _.isEqual) => ({
  add: _.differenceWith(goal, current, identityFn),
  remove: _.differenceWith(current, goal, (a, b) => identityFn(b, a))
})
```

```js echo
unorderedSync(
  [
    { name: "red", age: 12 },
    { name: "joe", age: 1 }
  ],
  [{ name: "joe" }, { name: "jean" }],
  (a, b) => a.name == b.name
)
```

### getPromiseState

```js echo
async function getPromiseState(p) {
  const sentinel = Symbol();
  try {
    const val = await Promise.race([p, Promise.resolve(sentinel)]);
    return val === sentinel
      ? { state: "pending" }
      : { state: "fulfilled", fulfilled: val };
  } catch (err) {
    return { state: "rejected", error: err };
  }
}
```

### Reposition set

```js echo
function repositionSetElement(set, element, newPosition) {
  if (!set.has(element)) {
    throw new Error("Element not found in the set.");
  }

  // Convert Set to an array
  const elementsArray = Array.from(set);

  // Remove the element
  const currentIndex = elementsArray.indexOf(element);
  elementsArray.splice(currentIndex, 1);

  // Insert element at the new position
  elementsArray.splice(newPosition, 0, element);

  // Reconstruct the Set
  set.clear();
  elementsArray.forEach(set.add, set);
}
```

```js echo
// https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/index.js#L66C10-L69C2
const isnode = (value) => {
  return (
    (value instanceof Element || value instanceof Text) &&
    value instanceof value.constructor
  );
}
```

```js echo
//import { runtime, main } from "@mootari/access-runtime"
import { runtime, main } from "/components/access-runtime.js"
```

```js echo
function observeSet(set, callback) {
  const originalAdd = set.add;
  set.add = function (value) {
    const result = originalAdd.call(this, value); // Call the original `add`
    callback("add", [value], this); // Invoke the callback
    return result; // Maintain chainability
  };

  const originalDelete = set.delete;
  set.delete = function (value) {
    const result = originalDelete.call(this, value); // Call the original `delete`
    callback("delete", [value], this); // Invoke the callback
    return result;
  };

  const originalClear = set.clear;
  set.clear = function () {
    const result = originalClear.call(this); // Call the original `clear`
    callback("clear", [], this); // Invoke the callback
    return result;
  };

  return set; // Return the modified `Set`
}
```

```js echo
const toObject = (v) =>
  Object.fromEntries(Object.getOwnPropertyNames(v).map((p) => [p, v[p]]))
```
