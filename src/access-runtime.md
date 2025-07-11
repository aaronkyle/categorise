# Accessing a Notebook's Runtime

Based on an idea by Bryan Gin-ge Chen (which he explores in his notebook [Dirty tricks](https://observablehq.com/d/4e5230c1d38f7c0f)), this notebook demonstrates a hack that exposes a notebook's underlying [Runtime](https://github.com/observablehq/runtime) instance.

*Related discussion: [Check if a cell is defined](https://talk.observablehq.com/t/check-if-a-cell-is-defined/4351/3)*

Suggested imports:
```
~~~js
import {runtime, main, observed} from '@mootari/access-runtime'
~~~
```


<style>
  a[href^="#"]:before {
    content: "→ ";
  }
  a[href], a[href]:hover {
    text-decoration: underline dotted 2px;
    text-underline-offset: 2px;
  }
  a[href]:hover {
    text-decoration: underline solid 2px;
  }
  a[href]:visited {
    color: inherit;
  }
  p > code, li > code {
    color: var(--syntax-keyword)
  }
</style>



## API

### Instances

```js echo
//const runtime = recomputeTrigger, captureRuntime
const runtime = captureRuntime
```

```js echo
const main = Array.from(modules).find(d => d[1] === 'main')[0]
```

```js echo
const modules = () => {
  // Builtins are stored in a separate module.
  const builtin = runtime._builtin;
  // Imported modules are keyed by their define() functions, which we don't need here.
  const imports = new Set(runtime._modules.values());
  // Find all modules by retrieving them directly from the variables.
  // Derived modules are "anonymous" but keep a reference to their source module.
  const source = m => !m._source ? m : source(m._source);
  const modules = new Set(Array.from(runtime._variables, v => source(v._module)));
  // When you edit a notebook on observablehq.com, Observable defines the
  // variables dynamically on main instead of creating a separate module.
  // When embedded however the entry notebook also becomes a Runtime module.
  const main = [...modules].find(m => m !== builtin && !imports.has(m));
  
  const _imports = [...imports];
  const labels = [
    [builtin, 'builtin'],
    [main || _imports.shift(), 'main'],
    ..._imports.map((m, i) => [m, `child${i+1}`]),
  ];
  
  return new Map(labels);
}
```

### Utilities

```js echo
function observed(variable = null) {
  const _observed = v => v._observer !== no_observer;
  if(variable !== null) return _observed(variable);
  const vars = new Set();
  for(const v of runtime._variables) _observed(v) && vars.add(v);
  return vars;
}
```

```js echo
const no_observer = () => {
  const v = main.variable();
  const o = v._observer;
  v.delete();
  return o;
}
```

### Internals

```js echo
const captureRuntime = new Promise(resolve => {
  const forEach = Set.prototype.forEach;
  Set.prototype.forEach = function(...args) {
    const thisArg = args[1];
    forEach.apply(this, args);
    if(thisArg && thisArg._modules) {
      Set.prototype.forEach = forEach;
      resolve(thisArg);
    }
  };
  //mutable recomputeTrigger = mutable recomputeTrigger + 1;
  set_recomputeTrigger(recomputeTrigger + 1)
})
```

```js echo
//mutable recomputeTrigger = 0
const recomputeTrigger = Mutable(0)
const set_recomputeTrigger = (t) => recomputeTrigger.value = t;
```

```js
recomputeTrigger
```

---
## Examples

*Hit Refresh to update the lists below.*

```js echo
const ex_refresh = view(Inputs.button('Refresh'))
```

### Defined variables

```js echo
const ex_vars = (() => {
  ex_refresh();  // side effects
  return Array.from(runtime._variables).map(v => ({
    name: v._name,
    module: modules.get(v._module),
    type: [, 'normal', 'implicit', 'duplicate'][v._type],
    observed: v._observer !== no_observer,
    inputs: v._inputs.length,
    outputs: v._outputs.size
  }));
})();
```

```js echo
const ex_vars_filters = () => view(() => {
  const unique = (arr, acc) => Array.from(new Set(arr.map(acc))).sort((a, b) => a?.localeCompare?.(b));
  const modules = unique(ex_vars, v => v.module);
  const types = unique(ex_vars, v => v.type);
  const value = this?.value ?? {};

  return Inputs.form({
    modules: Inputs.checkbox(modules, {
      label: 'Modules',
      value: value.modules ?? modules,
    }),
    types: Inputs.checkbox(types, {
      label: 'Types',
      value: value.types ?? types,
    }),
    features: Inputs.checkbox(['named', 'observed', 'inputs', 'outputs'], {
      label: 'Features',
      value: value.features ?? [],
    })
  });
});

```

```js echo
const ex_vars_table = () => {
  const flags = (arr) => Object.fromEntries(arr.map(v => [v, true]));
  const modules = flags(ex_vars_filters.modules);
  const types = flags(ex_vars_filters.types);
  const {named, observed, inputs, outputs} = flags(ex_vars_filters.features);

  const data = ex_vars.filter(d => true
    && modules[d.module]
    && types[d.type]
    && (!named || d.name != null)
    && (!observed || d.observed)
    && (!inputs || d.inputs)
    && (!outputs || d.outputs)
  );
  return Inputs.table(data);
}
```

### Dependency matrix

```js echo
const ex_deps = () => {
  ex_refresh;
  
  const vars = Array.from(observed(), d => ({
    name: d._name,
    inputs: Array.from(d._inputs, d => d._name)
  }));
  const inputs = new Set();
  for(const {inputs: i} of vars) for(const n of i) inputs.add(n);

  return Inputs.table(
    vars.map(d => ({
      '': d.name,
      ...Object.fromEntries(d.inputs.map(n => [n, '✔️'])),
    })),
    {
      columns: ['', ...Array.from(inputs).sort((a, b) => a.localeCompare(b))],
      header: {
        '': htl.html`<em>_name`
      }
    }
  );
  
}
```

---
## Explainer

Presumably, our best shot at fetching the runtime is to receive the instance as `thisArg` to [`Set.prototype.forEach()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach) in [`runtime_computeNow()`](https://github.com/observablehq/runtime/blob/v4.23.0/src/runtime.js#L110-L119):

1. In [`captureRuntime`](#captureRuntime) we apply a temporary [monkey patch](https://en.wikipedia.org/wiki/Monkey_patch) to `Set.prototype.forEach` in order to gain access to any passed-in parameters.
2. In [`runtime`](#runtime) we define a dependency on `recomputeTrigger` to ensure that the `Mutable`'s generator value is observed.
3. To trigger a recomputation we reassign [`mutable recomputeTrigger`](#recomputeTrigger).
4. In our overridden `Set.forEach` callback we then use [duck typing](https://en.wikipedia.org/wiki/Duck_typing) to match the Runtime instance.
5. Once we've encountered the instance we restore `Set.forEach` and resolve `captureRuntime`, and in turn `runtime`.




---
## Updates

- 2022-08-28: Rewrite and simplification, documentation updates.
- 2022-08-27: Added `main`, `no_observer`, `observed`. Added example for `observed`.

---
*Thumbnail image: [Austrian National Library](https://unsplash.com/photos/ciMJn3mD5u8)*

