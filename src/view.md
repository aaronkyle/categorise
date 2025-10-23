# Composing viewofs with the _viewUI_ literal

<!--NOTE: This is a complex notebook to convert. -->

```js
import { DOM } from "/components/DOM.js"
```

```js
import markdownit from "npm:markdown-it";
```

```js
const Markdown = new markdownit({html: true});

function md(strings) {
  let string = strings[0];
  for (let i = 1; i < arguments.length; ++i) {
    string += String(arguments[i]);
    string += strings[i];
  }
  const template = document.createElement("template");
  template.innerHTML = Markdown.render(string);
  return template.content.cloneNode(true);
}
```


Lets make custom UIs on Observable _easy_ by composing viewUIs.

We wrap the amazing [hypertext literal](https://observablehq.com/@observablehq/htl) with a interceptor that looks for _[key, viewUI]_ arguments. It uses the key to determine what field to map the viewUI's value to in the container.

      ```
      ~~~js
      viewof container = viewUI\`<div>
        \${["child1", Inputs.text()]}
        \${["child2", Inputs.range()]}\`
      ~~~
      ```

The syntax of a 2 element array is inspired by [Object.entries(...)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries).

By reusing the [hypertext literal](https://observablehq.com/@observablehq/htl) you are able to build your custom ui viewUI using HTML, the best abstraction for layout. Because _viewUI_ itself is a viewof, finally, we can hierarchically build up custom viewUIs from standard library viewUIs like [@observablehq/inputs](https://observablehq.com/@observablehq/inputs)

      ```
      ~~~js
          import {viewUI} from '@tomlarkworthy/viewUI'
      ~~~
      ````

#### How to use the viewUI-literal in UI development

There is a substantial guide to [scaling UI development](https://observablehq.com/@tomlarkworthy/ui-development) which uses on this viewUI literal quite heavily, and also has some weighty examples than the reference documentation here.




Known Issues:
- https://observablehq.com/@tomlarkworthy/dynamic-controls-example cannot bind to arrayView (DocumentFragment does not emit events)

```js
//toc()
```

```js
const document_toc = toc({
  headers: "h2,h3",
})
```

${document_toc}


## Change log

- 2021-03-03 *bindOneWay* has *onlyDefined* option added
- 2021-12-09 Bugfix for *arrayView* not bubbling events.
- 2021-11-05 *arrayView* refactored out
- 2021-09-05 [@mootari](/mootari) added lazy loading for testing, thus slimming its footprint significantly in production..
- 2021-07-29, hidden modifier added
- 2021-07-05, _array_ binding is now dynamic
- 2021-06-21, added _singleton_, _array_ and _object_ collection support


## About

The original need for a UI composition helper was noted by [@mootari](/@mootari) in a [Github issue](https://github.com/observablehq/inputs/issues/73). [@mbostock](/@mbostock) wrote some very nice composition tactics and greatly clarified desired behavior and, finally, I added the template syntax and passthrough API. It took us several months to get to this!


#### Demo

```js echo
const compositeView = viewUI`<div style="display: flex; justify-content:space-between; ">
<div style="display: flex-column;">
  <div>${["r1", Inputs.range([0, 10])]}</div>
  <div>${["r2", Inputs.range([0, 3])]}</div>
  <div>${[
      "text",
      Inputs.text({
        label: "Enter some text"
      })
    ]}</div>
</div>
<img width="150"src="https://media.giphy.com/media/2vobTwCkFg88ZUnilt/giphy-downsized.gif"></img>
</div>
`
```

```js echo
const composite = Generators.input(compositeView)
```

```js echo
compositeView
```

```js echo
display(compositeView.value)
```


```js echo
composite
```




## Back-writable

You can write the values back into the component by setting 'value'. This works for sub-components too, as long as everything is following [reusability guidlines](https://observablehq.com/@tomlarkworthy/ui-linter).



```js echo
htl.html`<button onclick=${() => {
//  viewof composite.value = {
//  composite.value = {
    compositeView.value = {
    r1: Math.random() * 10,
    r2: Math.random() * 3,
    text: `${Math.random()}`
  };
  composite.dispatchEvent(new Event('input'));
}}> randomize composite`
```

## Singletons

  Sometimes you want to just wrap an existing viewUI with some HTML. Use the spread operators for this


```js echo
// NOTE:  We need to reconcile this with how viewUIs work in Framework
const singletonView = viewUI`<div><h4>My control</h4>${['...', Inputs.range()]}`
```

```js
const singleton = Generators.input(singletonView)
```


```js echo
singletonView
```

```js echo
singleton
```


```js echo
// Note that here and for the inputs that follow, we need to establish the use of the Generator.input, otherwise the value isn't dynamic.
singletonView.value
```


```js echo
// viewof singleton
```

## Collections -- Arrays

  You can bind an array of viewUIs to a single parameter with _\[string, ArrayOfViews]_. 

If you supply a third argument, a build function of _data => viewUI_ the list can be dynamically resized  _\[label, ArrayOfViews, (data) => viewUI]_


```js echo
// When I attempt to use Framework's view() function here, the inputs will display but they do not dynamically change when I press the 'Add a slider' button.
// When I do not use Framework's view function, the cell with just `arrayfunction` will display the Inputs, and they will react to the 'Add a slider' button, however I can no longer see the values for `arrayCollection.elements` and I don't see the output 'Object {elements: Array(5)}' in the same way that I see it in the notebook.
// I can, however, see the values using `arrayCollection.value`.
// After I introduce Generators.input, I cannot add a new input.
// Fixed by pointing to arrayCollectionView.view


// This used viewof in the original notebook.
//viewof arrayCollection = viewUI`<div>${[
const arrayCollectionView = viewUI`<div>${[
  "elements",
  Array.from({ length: 5 }, () => Inputs.range())
]}`
```

```js
const arrayCollection = Generators.input(arrayCollectionView)
```


```js echo
arrayCollectionView
```

```js echo
arrayCollection
```

```js echo
arrayCollection.elements
```

Array bindings are mutable, you can write DOM components to the viewof layer

```js echo
// This needs to be reconciled with how viewUI and Generators.input work in Framework.
// Currently I am unable to write new sliders here.


Inputs.button("Add a slider", {
  reduce: () => {
    //viewof arrayCollection.elements = [
    arrayCollectionView.elements = [
    //arrayCollection.value.elements = [
    //  ...viewof arrayCollection.elements,
      ...arrayCollectionView.elements,
    //  ...arrayCollection.value.elements,
      Inputs.range() // Add another viewof
    ];
    // dispatch the input event so dataflow gets updated
    //viewof arrayCollection.dispatchEvent(new Event("input"));
    arrayCollection.dispatchEvent(new Event("input"));
  }
})
```

```js
//display(arrayCollection.elements)
```

```js echo
// As above and also below, we need to establish the use of the Generator.input, otherwise the value isn't dynamic.
// Note that this changes to undefined after introducing Generators.input
arrayCollection.value
```

```js echo
arrayCollectionView.value
```

```js echo
arrayCollectionView.value.elements
```


### Dynamic Arrays

If you provide a rowBuilder function as the third argument the viewUI will build new UI elements in response to reassignments at the data layer. It's decribed in detail in [@tomlarkworthy/ui-development#dynamic_lists](https://observablehq.com/@tomlarkworthy/ui-development#dynamic_lists)


```js echo
// viewof dynamicArrayCollection = viewUI`<div>${[
const dynamicArrayCollectionView = viewUI`<div>${[
  'elements',
  [],
  val => Inputs.range([0, 1], { value: val }) // rowBuilder
]}`
```


```js
const dynamicArrayCollection = Generators.input(dynamicArrayCollectionView)
```


```js echo
dynamicArrayCollectionView
```



```js echo
dynamicArrayCollection
```


```js echo
// As already flagged, we need to establish the use of the Generator.input, otherwise the value isn't dynamic.
dynamicArrayCollection.value
```

```js
dynamicArrayCollection.value
```


```js echo
Inputs.button("Add a slider", {
  reduce: () => {
    dynamicArrayCollectionView.value.elements.push(Math.random());
    // dispatch the input event so dataflow gets updated
    //viewof dynamicArrayCollection.elements.dispatchEvent(new Event("input"));
    dynamicArrayCollectionView.value.elements.dispatchEvent(new Event("input"));
  }
})
```

```js echo
Inputs.button("Remove a slider", {
  reduce: () => {
    dynamicArrayCollectionView.value.elements.pop();
    // dispatch the input event so dataflow gets updated
    //viewof dynamicArrayCollection.elements.dispatchEvent(new Event("input"));
    dynamicArrayCollectionView.value.elements.dispatchEvent(new Event("input"));
  }
})
```

```js
//const objects = md`## Collections -- Objects
//
//  You can bind an object of [string, viewUI] to many parameters with the special spread key '_..._'
//
//`
```

## Collections -- Objects

You can bind an object of [string, viewUI] to many parameters with the special spread key '_..._'

```js echo
// viewof objectCollection = viewUI`${[
const objectCollectionView = viewUI`${[
  '...',
  {
    number: Inputs.range(),
    text: Inputs.text()
  }
]}`
```


```js
const objectCollection = Generators.input(objectCollectionView)
```


```js echo
objectCollectionView
```


```js echo
objectCollection
```


```js echo
// Again, we need to establish the use of the Generator.input, otherwise the value isn't dynamic.
objectCollection.value
```


```js echo
objectCollectionView.value
```


### Dynamic Objects

If you supply a viewUI builder, _(data) => viewUI_ as the third argument, you can dynamically add and remove entries to your viewUI by assigning the a whole new object.


```js echo
// viewof dynamicObjectCollection = viewUI`<div>${[
const dynamicObjectCollectionView = viewUI`<div>${[
  '...',
  {},
  txt => Inputs.text({ value: txt })
]}`
```


```js
const dynamicObjectCollection = Generators.input(dynamicObjectCollectionView)
```


```js echo
dynamicObjectCollectionView
```


```js echo
dynamicObjectCollection
```

```js echo
// viewof dynamicObjectCollection
```

```js echo
Inputs.button("Pick one of three keys and randomize their value", {
  reduce: () => {
    const key = "k" + Math.floor(Math.random() * 3);
   // viewof dynamicObjectCollection.value = {
       dynamicObjectCollectionView.value = {
//      ...viewof dynamicObjectCollection.value,
      ...dynamicObjectCollectionView.value,
      [key]: key + " " + Math.random()
    };
//    viewof dynamicObjectCollection.dispatchEvent(new Event('input', {bubbles: true}))
    dynamicObjectCollectionView.dispatchEvent(new Event('input', {bubbles: true}))
  }
})
```

```js echo
Inputs.button("Delete a random key", {
  reduce: () => {
    //const copy = { ...viewof dynamicObjectCollection.value };
    const copy = { ...dynamicObjectCollectionView.value };
    const key = "k" + Math.floor(Math.random() * 3);
    delete copy[key];
    //viewof dynamicObjectCollection.value = copy;
    dynamicObjectCollectionView.value = copy;
    //viewof dynamicObjectCollection.dispatchEvent(
    dynamicObjectCollectionView.dispatchEvent(

      new Event('input', { bubbles: true })
    );
  }
})
```

```js echo
dynamicObjectCollectionView.value
```

```js echo
//viewof dynamicObjectCollection.value
dynamicObjectCollection.value

// Wile the notebook use of .value here is a bit different than the above, its the same concept - we need to establish the use of the Generator.input, otherwise the value isn't dynamic.
```

## Hidden viewUIs

If you wish to bind a value to the viewUI but not add it to the DOM, prefix the label with "_". This can be useful for bringing another viewUI's value into the model without pruning its currently location.

known issues: does not work well with singletons.|


```js echo
//viewof hiddenView = viewUI`<div><h4>My hidden control</h4>${[
const hiddenViewView = viewUI`<div><h4>My hidden control</h4>${[
  '_hidden',
//  viewof singleton
singleton

]}`
```


```js
const hiddenView = Generators.input(hiddenViewView)
```


```js echo
hiddenView
```


```js echo
hiddenViewView.hidden
```

```js echo
hiddenViewView.hidden = 0.60
```

```js echo
{
  //viewof hiddenView.hidden.value = 0.60;
  //viewof hiddenView.hidden.dispatchEvent(new Event("input", { bubble: true }));
  hiddenView.hidden.value = 0.60;
  hiddenView.hidden.dispatchEvent(new Event("input", { bubble: true }));

}
```

## Extras

### Cautious Wrapper

You might not want changes to propagate immediately. For this usecase wrap with _cautious_.

*Contributed by [@mootari](/@mootari) and [@jobleonard](/@jobleonard). _isTrusted_ backwriting bypass yoinked from [@mbostock](/@mbostock) in a [talk thread](https://talk.observablehq.com/t/what-is-the-best-way-to-make-range-slider-update-only-on-release/5112/4). Name of feature yoinked from [@tmcw/inputs](https://observablehq.com/@tmcw/inputs/2)*

By default it wraps the inner node with a SPAN. This is usually the safest thing to do but not always, you can turn off this behaviour with the option _nospan: false_. Note: this will use the topmost node to hold the value.


```js echo
function cautious(
  /* (apply, reset) => viewUI */ viewUIBuilder,
  { nospan = false } = {}
) {
  const apply = DOM.uid().id;
  const reset = DOM.uid().id;

  function inputFilter(node, { filter } = {}) {
    node.addEventListener("input", (e) => {
      filter(e) || e.stopImmediatePropagation();
    });
    return node;
  }

  function wrapper(
    node,
    { initialOnly = false, signal = (e) => e.detail === reset } = {}
  ) {
    const ui = nospan ? node : html`<span>${node}</span>`;
    ui.value = { ...node.value };
    node.addEventListener("input", (e) => {
      if (signal(e)) {
        node.value = ui.value;
        e.stopImmediatePropagation();
      } else if (!initialOnly) {
        ui.value = { ...node.value };
      }
    });

    return ui;
  }

  function trigger(detail) {
    return (e) => {
      if (!e) console.log("An event needs to be passed to apply and reset");
      e.target.dispatchEvent(
        new CustomEvent("input", { bubbles: true, detail })
      );
    };
  }

  return wrapper(
    inputFilter(viewUIBuilder(trigger(apply), trigger(reset)), {
      filter: (e) => e.detail === apply || e.detail === reset || !e.isTrusted
    })
  );
}
```

#### Cautious demo


```js echo
cautiousNestedDemoView
```


```js echo
cautiousNestedDemo
```

```js echo
//viewof cautiousNestedDemo = viewUI`
const cautiousNestedDemoView = viewUI`
  ${[
    "c1",
    cautious(
      (apply, reset) => viewUI`<div>
        ${['foo', Inputs.range([0, 100], { label: 'Foo', step: 1 })]}
        ${['bar', Inputs.text({ value: 'change me', label: 'Bar' })]}
        <hr style="margin:0;padding:10px;max-width:360px">
        <button onclick=${apply}>Apply</button>
        <button onclick=${reset}>Reset</button>`
    )
  ]}
  ${[
    "c2",
    cautious(
      (apply, reset) => viewUI`<div>
        ${['baz', Inputs.range([0, 100], { label: 'Baz', step: 1 })]}
        ${['bat', Inputs.text({ value: 'change me', label: 'Bat' })]}
        <hr style="margin:0;padding:10px;max-width:360px">
        <button onclick=${apply}>Apply</button>
        <button onclick=${reset}>Reset</button>`
    )
  ]}
`
```


```js
const cautiousNestedDemo = Generators.input(cautiousNestedDemoView)
```




### bindOneWay

As viewUIs become composite heirarchies, its useful to transform their values as you connect their parts unidirectionally.

_bindOneWay(target, source, transform, options)_ is a *one-way* bind between event sources, that returns the target. _options_ keys include: _invalidation_, and _transform_.

Transform allows you to alter the data as it passed between from source to target. Unlike _Inputs.bind_, an event is raised on the target, making it more useful for chaining.

The signature follows Observables precedence (https://github.com/observablehq/inputs#bind)


```js echo
//viewof slider = Inputs.range([0, 10], { value: 0, label: "Try increasing me" })
const sliderElement = Inputs.range([0, 10], { value: 0, label: "Try increasing me" })
```

```js echo
const slider = Generators.input(sliderElement)
```

```js echo
display(sliderElement)
```

```js echo
display(slider)
```

```js echo
//viewof levels = bindOneWay(
const levelsElement = bindOneWay(
  Inputs.radio(["0", "low", "high"], { disabled: true }),
//  viewof slider,
//  slider,
sliderElement,
  {
    transform: v => (v === 0 ? "0" : v < 5 ? "low" : "high")
  }
)
```


```js echo
const levels = Generators.input(levelsElement)
```

```js echo
display(levelsElement)
```

```js echo
display(levels)
```

```js echo
//viewof levelsText = bindOneWay(Inputs.text({ disabled: true }), viewof levels, {
const levelsTextElement = bindOneWay(Inputs.text({ disabled: true }), 
//viewof levels, {
//levels, {
levelsElement, {
  transform: l => `The level is ${l}`
})
```


```js echo
const levelsText = Generators.input(levelsTextElement)
```

```js echo
display(levelsTextElement)
```

```js echo
display(levelsText)
```

```js echo
// Copied from https://github.com/observablehq/inputs/blob/main/src/bind.js
const bindOneWay = (() => {
  function disposal(element) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        if (!element.closest) return;

        const target = element.closest(".observablehq");
        if (!target) return resolve();
        const observer = new MutationObserver(() => {
          if (target.contains(element)) return;
          observer.disconnect(), resolve();
        });
        observer.observe(target, { childList: true });
      });
    });
  }

  return function bindOneWay(
    target,
    /* primary*/ source,
    { invalidation, transform = (d) => d, onlyDefined = false } = {}
  ) {
    const sourceEvent = eventof(source);
    const targetEvent = eventof(target);
    const onsource = () => {
      set(target, source);
      target.dispatchEvent(new Event(targetEvent, { bubbles: true }));
    };
    onsource();
    source.addEventListener(sourceEvent, onsource);
    if (!invalidation) invalidation = disposal(target);
    invalidation.then(() => source.removeEventListener(sourceEvent, onsource));
    return target;

    function get(input) {
      switch (input.type) {
        case "range":
        case "number":
          return input.valueAsNumber;
        case "date":
          return input.valueAsDate;
        case "checkbox":
          return input.checked;
        case "file":
          return input.multiple ? input.files : input.files[0];
        default:
          return input.value;
      }
    }

    function set(target, source) {
      const value = transform(get(source));
      if (onlyDefined && !value) return;
      switch (target.type) {
        case "range":
        case "number":
          target.valueAsNumber = value;
          break;
        case "date":
          target.valueAsDate = value;
          break;
        case "checkbox":
          target.checked = value;
          break;
        case "file":
          target.multiple ? (target.files = value) : (target.files = [value]);
          break;
        default:
          target.value = value;
          break;
      }
    }

    function eventof(input) {
      switch (input.type) {
        case "button":
        case "submit":
          return "click";
        case "file":
          return "change";
        default:
          return "input";
      }
    }
  };
})()
```

### variable

Variables allow you to add additional degrees of freedom to a component as normal viewUIs. They have an contained 'value', and they can be bind to.


The contract of Observable states changes to a viewUI's value should update visual appearance **but not cascade**, whereas if an _'input'_ events is dispatch the cell should cascade Dataflow. Thus a variable defines an additional event type 'assign' which is emmitted whenever the variable is assigned. This is so you can hook variables being assigned to and make DOM manipulations without causing a dataflow cascade.

The toString of variable is a coercion of the value, so a variable as a viewUI can be placed in attribute nodes etc.


```js echo
function variable(value, { name = "variable" } = {}) {
  const self = document.createComment(name);
  return Object.defineProperties(self, {
    value: {
      get: () => value,
      set: newValue => {
        value = newValue;
        self.dispatchEvent(new CustomEvent('assign', { detail: newValue }));
      },
      enumerable: true
    },
    toString: {
      value: () => `${value}`
    }
  });
};
```

```js echo
const example_variable = variable(5);
```

```js echo
example_variable
```

```js echo
(example_variable.value = 44)
```

```js echo
// NOTE: This doesn't appear to be configured correctly
const variableGen = (async function* () {
  let resolve = null;
  example_variable.addEventListener('assign', evt => resolve(evt.detail));
  while (true) {
    yield new Promise(r => (resolve = r));
  }
})()
```

```js echo
variableGen
```


## Code

Most of the work is done by _htl_, we are simply adding a new _[key, HTML]_ case


```js
function viewUI(strings, ...exprs) {
  return wrap(htl.html, strings, ...exprs);
}
```

```js
function viewUISvg(strings, ...exprs) {
  return wrap(htl.svg, strings, ...exprs);
}
```

```js echo
function wrap(fn, strings, ...exprs) {
  let singleton = undefined;
  let start = undefined; // To know where to start dynamic objects
  let builder = undefined; // For new keys are added dynamically
  const viewUIs = {};

  const pexpr = exprs.map((exp) => {
    // All special functions are [key, ...]
    // Otherwise we pass through
    if (!Array.isArray(exp) || typeof exp[0] !== "string") {
      return exp;
    }

    const hidden = exp[0].startsWith("_");
    const key = hidden ? exp[0].substring(1) : exp[0];
    if (key === "value") throw new Error("Cannot use 'value' as a key");
    let presentation;

    if (exp.length === 2 && exp[1] instanceof EventTarget) {
      // SINGLE VIEW PASSED IN
      if (key === "...") {
        // SINGLETON!
        singleton = exp[1];
      } else {
        // look for [key, HTML] entries
        viewUIs[key] = exp[1];
      }
      presentation = exp[1];
    } else if (
      // ARRAY PASSED IN (NO BUILDER)
      exp.length === 2 &&
      Array.isArray(exp[1]) &&
      exp[1].every((e) => e instanceof EventTarget)
    ) {
      if (key === "...") throw new Error("Spread not supported for arrays ATM");
      /*
      const start = document.createComment(key);
      arrayViews[key] = {
        start,
        array: exp[1]
      };
      presentation = [start, ...exp[1]];*/
      presentation = arrayView({
        name: key,
        initial: exp[1]
      });
      viewUIs[key] = presentation;
    } else if (
      // ARRAY PASSED IN (WITH BUILDER)
      exp.length === 3 &&
      Array.isArray(exp[1]) &&
      exp[1].every((e) => e instanceof EventTarget) &&
      typeof exp[2] === "function"
    ) {
      if (key === "...") throw new Error("Spread not supported for arrays ATM");
      /*
      const start = document.createComment(key);
      arrayViews[key] = {
        start,
        array: exp[1],
        builder: exp[2]
      };
      presentation = [start, ...exp[1]];*/
      presentation = arrayView({
        name: key,
        initial: exp[1],
        builder: exp[2]
      });
      viewUIs[key] = presentation;
    } else if (
      // SPREAD OBJECT (NO BUILDER)
      exp.length === 2 &&
      key === "..." &&
      typeof exp[1] === "object" &&
      Object.keys(exp[1]).every((e) => typeof e === "string") &&
      Object.values(exp[1]).every((e) => e instanceof EventTarget)
    ) {
      Object.entries(exp[1]).forEach((e) => (viewUIs[e[0]] = e[1]));
      presentation = Object.values(exp[1]);
    } else if (
      // SPREAD OBJECT (WITH BUILDER)
      exp.length === 3 &&
      key === "..." &&
      typeof exp[1] === "object" &&
      Object.keys(exp[1]).every((e) => typeof e === "string") &&
      Object.values(exp[1]).every((e) => e instanceof EventTarget) &&
      typeof exp[2] === "function"
    ) {
      Object.entries(exp[1]).forEach((e) => (viewUIs[e[0]] = e[1]));
      start = document.createComment(key);
      builder = exp[2];
      presentation = [start, ...Object.values(exp[1])];
    } else {
      presentation = exp;
    }

    if (hidden) {
      const forwardEvent = (evt) => {
        const clone = new evt.constructor(evt.type, evt);
        self.dispatchEvent(clone);
      };
      if (presentation.addEventListener) {
        presentation.addEventListener("input", forwardEvent);
      } else if (Array.isArray(presentation)) {
        presentation.forEach((p) => {
          // The first element can be the start event sometimes
          if (p.addEventListener) {
            p.addEventListener("input", forwardEvent);
          }
        });
      } else {
        throw new Error("Not sure how to deal with this hidden element");
      }

      return undefined; // No DOM representation
    } else {
      return presentation; // Places in DOM
    }
  });
  const self = fn(strings, ...pexpr);

  if (singleton) {
    if (Object.keys(viewUIs).length !== 0)
      throw new Error("Singleton defined but additional properties supplied");

    // Users are expected to call dispatchEvent on viewUI, so the inner singleton
    // need to know about these events for the viewUI to work
    // => events need to be copied over, if originating from here
    self.addEventListener("input", (evt) => {
      if (evt.target === self) {
        const clone = new evt.constructor(evt.type, evt);
        singleton.dispatchEvent(clone);
      }
    });

    return Object.defineProperties(self, {
      value: {
        get: () => singleton.value,
        set: (val) => (singleton.value = val),
        configurable: true
      },
      singleton: {
        value: singleton,
        enumerable: true
      }
    });
  }
  // Non-singleton (Object or Array)
  return Object.defineProperties(self, {
    value: {
      get() {
        return Object.defineProperties(
          {},
          Object.keys(viewUIs).reduce((acc, key) => {
            acc[key] = {
              get: () => viewUIs[key].value,
              set: (v) => (viewUIs[key].value = v),
              enumerable: true
            };
            return acc;
          }, {})
        );
      },
      set(newValues) {
        Object.entries(newValues).forEach(([key, newValue]) => {
          if (viewUIs[key]) {
            viewUIs[key].value = newValue; // Update of existing child value
          } else if (start && builder) {
            // Adding a new key
            const parent = start.parentNode;
            const newView = builder(newValue);
            viewUIs[key] = newView;
            parent.appendChild(newView);
            // Add top level entry too
            Object.defineProperty(self, key, {
              value: newView,
              enumerable: true,
              configurable: true
            });
          }
        });

        // If we are a dynamic Object, we need to remove keys too
        Object.entries(viewUIs).forEach(([key, oldValue]) => {
          if (!newValues.hasOwnProperty(key)) {
            // It needs to go
            const oldView = viewUIs[key];
            delete viewUIs[key];
            if (oldView.remove) oldView.remove();
            delete self[key];
          }
        });
      },
      configurable: true
    },
    ...Object.keys(viewUIs).reduce(
      // Add top level field to access the subviewUIs in the parent viewof
      (acc, key) => {
        acc[key] = {
          get: () => viewUIs[key],
          set: (newView) => {
            const oldView = viewUIs[key];
            delete viewUIs[key];
            if (oldView.remove) oldView.remove();

            // assigning an arrayView (special cased)
            if (oldView.length && newView.length) {
              newView = arrayView({
                initial: newView,
                builder: oldView.builder
              });
            }

            viewUIs[key] = newView;
            if (newView instanceof Node) self.appendChild(newView);
          },
          enumerable: true,
          configurable: true
        };
        return acc;
      },
      {}
    )
  });
}
```

### arrayView

arrayView is a DocumentFragment whose nodes are subviewUIs organised in an array. It is initialized with a *builder* of which is a function from data to a subviewUI. E.g. `(str) => Inputs.text({value: str})`, and it can be initialised with a set of viewUIs.

Its presentation layer is a DocumentFragment, but with added array like behaviour so subviewUIs are indexable like an array.

Its data object is an array, whose in-place methods (splice, push, pop, shift, unshift) are mirrored to DOM manipulation.

So assigning a new data array *e.g.* `viewUI.value = [...]`, will replace the whole DOM. Pushing an element on an array will insert a single DOM *e.g.* `viewUI.push(...)` using the *builder* to make the new DOM element. By preferring in-place manipulations you can create efficient UIs that minimize DOM manipulations.

<mark>
todo
- Its pretty confusing viewof array.splice does not work now
</mark>

```js echo
function arrayView({
  name = "arrayNode" + DOM.uid().id,
  value = [],
  initial = [],
  builder
} = {}) {
  if (value.length > 0 && !builder)
    throw new Error(
      "You cannot initialize an arrayView with data without a builder"
    );

  const frag = new DocumentFragment();

  const subviewUIToFragmentEventCloner = (e) => {
    const new_e = new e.constructor(e.type, e);
    frag.dispatchEvent(new_e);
  };

  const _builder = builder
    ? (arg) => {
        const subviewUI = builder(arg);
        subviewUI.addEventListener("input", subviewUIToFragmentEventCloner);
        return subviewUI;
      }
    : undefined;

  const unbuilder = (subviewUI) => {
    subviewUI.removeEventListener("input", subviewUIToFragmentEventCloner);
  };

  initial.forEach((subviewUI) =>
    subviewUI.addEventListener("input", subviewUIToFragmentEventCloner)
  );

  const start = document.createComment("START:" + name);
  const end = document.createComment("END:" + name);
  let subviewUIs = (_builder ? value.map(_builder) : []).concat(initial);
  frag.append(...[start, ...subviewUIs, end]);

  frag.addEventListener("input", (e) => {
    // https://stackoverflow.com/questions/11974262/how-to-clone-or-re-dispatch-dom-events
    const new_e = new e.constructor(e.type, e);
    start.dispatchEvent(new_e);
  });

  const getIndexProperty = (index) => ({
    get: () => subviewUIs[index],
    enumerable: true,
    configurable: true
  });

  const customSplice = (startIndex, deleteCount, ...items) => {
    const parent = start.parentNode;
    startIndex = Math.floor(startIndex);
    const removedData = [];
    // sync the splice with the DOM
    let node = start;
    // Forward to begining of the splice
    for (let i = 0; i < startIndex && i < subviewUIs.length; i++)
      node = node.nextSibling;
    // delete 'deleteCount' times
    for (let i = 0; i < deleteCount && i < subviewUIs.length; i++) {
      const toDelete = node.nextSibling;
      removedData.push(toDelete.value);
      unbuilder(toDelete);
      toDelete.remove();
    }
    // add additional items
    const itemViews = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const subviewUI = _builder(items[i]);
      Object.defineProperty(frag, i, getIndexProperty(i));
      let presentation =
        subviewUI instanceof HTMLElement ? subviewUI : htl.html`${subviewUI}`;
      itemViews.unshift(subviewUI);
      parent.insertBefore(presentation, node.nextSibling);
    }

    // Apply to cache
    subviewUIs.splice(startIndex, deleteCount, ...itemViews);
    // Let flow upwards to array too
    return removedData;
  };
  // We intercept operations to the data array and use it to drive DOM operations too.
  const dataArrayProxyHandler = {
    get: function (target, prop, receiver) {
      const args = arguments;

      if (prop === "splice") {
        return customSplice;
      } else if (prop === "push") {
        return (...elements) => {
          customSplice(subviewUIs.length, 0, ...elements);
          return subviewUIs.length;
        };
      } else if (prop === "pop") {
        return () => {
          return customSplice(subviewUIs.length - 1, 1)[0];
        };
      } else if (prop === "shift") {
        return () => {
          return customSplice(0, 1)[0];
        };
      } else if (prop === "unshift") {
        return (...elements) => {
          customSplice(0, 0, ...elements);
          return subviewUIs.length;
        };
      }
      return Reflect.get(...args);
    },
    set(obj, prop, value) {
      if (!isNaN(+prop)) {
        // we also need to set the viewUI
        customSplice(+prop, 1, value);
      }
      return Reflect.set(...arguments);
    }
  };

  // Add data channel
  Object.defineProperties(frag, {
    value: {
      get: () =>
        new Proxy(
          subviewUIs.map((sv) => sv.value),
          dataArrayProxyHandler
        ),
      set: (newArray) => {
        const vArr = _.cloneDeep(newArray);
        const parent = start.parentNode;

        if (builder) {
          // We should be true to the operation and tear of the DOM and then replace it.
          subviewUIs.forEach((sv) => (sv.remove ? sv.remove() : undefined));
          subviewUIs = vArr.map((data) => {
            const subviewUI = _builder(data);
            let presentation =
              subviewUI instanceof HTMLElement ? subviewUI : htl.html`${subviewUI}`;
            parent.insertBefore(presentation, end);
            return subviewUI;
          });
        } else {
          // We have to work around the limitations and try to do the operation without
          // building, so this only can work if you are setting it to something smaller
          vArr.forEach((v, i) => {
            if (i < subviewUIs.length) {
              subviewUIs[i].value = v; // mutate inplace
            } else {
              let built = _builder(v); // append additional
              subviewUIs[i] = built;
              if (!(built instanceof HTMLElement)) built = htl.html`${built}`;
              parent.appendChild(built);
            }
          });

          for (var i = subviewUIs.length - 1; i >= vArr.length; i--) {
            // delete backwards
            const deleted = subviewUIs.pop();
            if (deleted.remove) deleted.remove();
          }
        }
      }
    }
  });

  // Add presentation channel
  return Object.defineProperties(frag, {
    remove: {
      value: () => {
        const toRemove = [];
        for (var node = start; node !== end; node = node.nextSibling) {
          toRemove.push(node);
        }
        toRemove.push(end);
        toRemove.forEach((n) => n.remove());
      }
    },
    length: {
      get: () => subviewUIs.length,
      enumerable: true,
      configurable: true
    },
    [Symbol.iterator]: {
      value: () => {
        let index = 0;
        return {
          next() {
            if (index < subviewUIs.length) {
              let val = subviewUIs[index];
              index++;
              return { value: val, done: false };
            } else return { done: true };
          }
        };
      }
    },
    ...subviewUIs.reduce((acc, sv, index) => {
      acc[index] = getIndexProperty(index);
      return acc;
    }, {})
  });
}
```

```js echo
md`length: ${numbers.length} with elements: ${numbers.join(", ")}`
```

```js echo
htl.html`<div style="display: flex;">
${Inputs.button("reset", {
  reduce: () => {
    //viewof numbers.value = [1, 2, 3, 4, 5, 6];
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.value = [1, 2, 3, 4, 5, 6];
    numbers.dispatchEvent(new Event("input", { bubbles: true }));

  }
})}
${Inputs.button("delete last", {
  reduce: () => {
    numbers.splice(numbers.length - 1, 1);
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.dispatchEvent(new Event("input", { bubbles: true }));
  }
})}
${Inputs.button("delete random", {
  reduce: () => {
    const choice = Math.random() * numbers.length;
    numbers.splice(choice, 1);
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.dispatchEvent(new Event("input", { bubbles: true }));
  }
})}
${Inputs.button("push number", {
  reduce: () => {
    numbers.push(numbers.length + 1);
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.dispatchEvent(new Event("input", { bubbles: true }));

  }
})}

${Inputs.button("unshift", {
  reduce: () => {
    numbers.unshift(0);
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.dispatchEvent(new Event("input", { bubbles: true }));
  }
})}

${Inputs.button("pop", {
  reduce: () => {
    numbers.pop();
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.dispatchEvent(new Event("input", { bubbles: true }));
  }
})}

${Inputs.button("shift", {
  reduce: () => {
    numbers.shift();
    //viewof numbers.dispatchEvent(new Event("input", { bubbles: true }));
    numbers.dispatchEvent(new Event("input", { bubbles: true }));
  }
})}
`
```

```js echo
//viewof numbers = viewUI`<table>
const numbers = view(viewUI`<table>
  ${[
    "...",
    arrayView({
      value: [1, 2, 3, 4, 5, 6],
      builder: (number) =>
        viewUI`<tr><td>${["...", Inputs.number({ value: number })]}</td></tr>`
    })
  ]}
</table>`)
```

```js echo
//viewof arrayViewTests = testing.createSuite({
const arrayViewTests = view(testing.createSuite({
    name: "arrayView Tests",
  timeout_ms: 1000
}))
```

```js echo
arrayViewTests.test("arrayView dispatchEvent bubbles to container", (done) => {
  const av = arrayView({ builder: (v) => Inputs.input(v) });
  const container = viewUI`<div>${av}`;
  container.addEventListener("input", () => done());
  av.dispatchEvent(new Event("input", { bubbles: true }));
})
```

```js echo
arrayViewTests.test("arrayView subviewUI events bubble to arrayView", (done) => {
  const av = arrayView({
    value: [1],
    builder: (v) => Inputs.input(v)
  });
  av.addEventListener("input", () => done());
  av[0].dispatchEvent(new Event("input", { bubbles: true }));
})
```

```js echo
arrayViewTests.test("arrayView initialization (data + builder)", () => {
  const av = arrayView({
    value: [1],
    builder: (number) => Inputs.input("foo")
  });
  expect(av[0].value).toBe("foo");
  expect(av.value[0]).toBe("foo");
})
```

```js echo
arrayViewTests.test("arrayView initialization (initial)", () => {
  const av = arrayView({ initial: [Inputs.input("foo")] });
  expect(av[0].value).toBe("foo");
  expect(av.value[0]).toBe("foo");
})
```

```js echo
arrayViewTests.test("arrayView write element", () => {
  const av = arrayView({
    initial: [Inputs.input("foo")],
    builder: Inputs.input
  });
  expect(av[0].value).toBe("foo");
  expect(av.value[0]).toBe("foo");

  av.value[0] = "bar";

  expect(av[0].value).toBe("bar");
  expect(av.value[0]).toBe("bar");
})
```

```js echo
arrayViewTests.test("arrayView splice (delete)", () => {
  const av = arrayView({ initial: [Inputs.input("foo")] });
  expect(av[0].value).toBe("foo");
  expect(av.value[0]).toBe("foo");
  expect(av.length).toBe(1);
  expect(av.value.length).toBe(1);

  av.value.splice(0, 1);

  expect(av[0]).toBe(undefined);
  expect(av.value[0]).toBe(undefined);
  expect(av.value.length).toBe(0);
  expect(av.length).toBe(0);
})
```

```js echo
arrayViewTests.test("arrayView splice out of bounds (delete)", () => {
  const av = arrayView({ initial: [Inputs.input("foo")] });
  expect(av[0].value).toBe("foo");
  expect(av.value[0]).toBe("foo");
  expect(av.length).toBe(1);
  expect(av.value.length).toBe(1);

  av.value.splice(1, 1);

  expect(av[0].value).toBe("foo");
  expect(av.value[0]).toBe("foo");
  expect(av.length).toBe(1);
  expect(av.value.length).toBe(1);
})
```

```js echo
arrayViewTests.test("arrayView splice (add)", () => {
  const av = arrayView({ builder: (v) => Inputs.input(v) });
  av.value.splice(0, 0, 1);
  expect(av[0].value).toBe(1);
  expect(av.value[0]).toBe(1);
})
```

```js echo
arrayViewTests.test("arrayView unshift", () => {
  const av = arrayView({ builder: (v) => Inputs.input(v) });
  av.value.unshift(1);
  expect(av[0].value).toBe(1);
  expect(av.value[0]).toBe(1);
})
```

```js echo
arrayViewTests.test("arrayView shift", () => {
  const av = arrayView({ value: [1], builder: (v) => Inputs.input(v) });
  av.value.shift(1);
  expect(av[0]).toBe(undefined);
  expect(av.value[0]).toBe(undefined);
})
```

```js echo
arrayViewTests.test("arrayView pop", () => {
  const av = arrayView({ value: [1], builder: (v) => Inputs.input(v) });
  av.value.pop();
  expect(av[0]).toBe(undefined);
  expect(av.value[0]).toBe(undefined);
})
```

```js echo
arrayViewTests.test("arrayView push", () => {
  const av = arrayView({ builder: (v) => Inputs.input(v) });
  av.value.push(1);
  expect(av[0].value).toBe(1);
  expect(av.value[0]).toBe(1);
})
```

## [Optional] Tests

```js
const RUN_TESTS = true // htl.html`<a href="">`.href.includes("@tomlarkworthy/viewUI")
```

```js echo
const testing = ( async () => {
  if (!RUN_TESTS) return invalidation;
  const [{ Runtime }, { default: define }] = await Promise.all([
    import(
      "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"
    ),
    import(`https://api.observablehq.com/@tomlarkworthy/testing.js?v=3`)
  ]);
  const module = new Runtime().module(define);
  return Object.fromEntries(
    await Promise.all(
      ["expect", "createSuite"].map((n) => module.value(n).then((v) => [n, v]))
    )
  );
})();
display(testing)
```

```js echo
const suite = view(testing.createSuite({
  name: "Unit Tests",
  timeout_ms: 1000
}));
display(suite)
```

```js
const expect = testing.expect
```

```js echo
suite.test("Singleton spread reads from delagate", async () => {
  const v = viewUI`<div>${["...", variable(1)]}`;
  expect(v.value).toEqual(1);
})
```

```js echo
suite.test("Singleton spread write propagates", async () => {
  const delegate = variable();
  const v = viewUI`<div>${["...", delegate]}`;
  v.value = 4;
  expect(delegate.value).toEqual(4);
})
```

```js echo
suite.test(
  "Singleton events propagate from container to inner singleton",
  async (done) => {
    const delegate = variable();
    delegate.addEventListener("input", (evt) => {
      done();
    });
    const v = viewUI`<div>${["...", delegate]}`;
    v.dispatchEvent(new Event("input"));
  }
)
```

```js echo
suite.test("Hidden write propagates upstream", async () => {
  const delegate = variable();
  const v = viewUI`<div>${["_hidden", delegate]}`;
  v.hidden.value = 4;
  expect(delegate.value).toEqual(4);
})
```

```js echo
suite.test("Hidden events propogate to self", async (done) => {
  const delegate = variable();
  const v = viewUI`<div>${["_hidden", delegate]}`;
  v.addEventListener("input", (evt) => {
    done();
  });
  delegate.dispatchEvent(new Event("input"));
})
```

```js echo
suite.test(
  "Hidden object collection member events propogate to self",
  async (done) => {
    const delegate = variable();
    const v = viewUI`<div>${["_...", { a: delegate }]}`;
    v.addEventListener("input", (evt) => {
      done();
    });
    delegate.dispatchEvent(new Event("input"));
  }
)
```

```js echo
suite.test("Nested write on arrayView replaces presentation", async () => {
  const v = viewUI`<div>${["array", [html`<input id=nwoa1 value="foo">`]]}`;
  expect(v.querySelector("#nwoa1")).not.toBe(null);
  expect(v.querySelector("#nwoa2")).toBe(null);
  expect(v.array.value).toEqual(["foo"]);

  v.array = [html`<input id=nwoa2 value="fum">`];
  expect(v.querySelector("#nwoa1")).toBe(null);
  expect(v.querySelector("#nwoa2")).not.toBe(null);
  expect(v.array.value).toEqual(["fum"]);
})
```

```js echo
suite.test(
  "Composite write spreads to array subproperty (deletion)",
  async () => {
    const v = viewUI`<div>${["array", [Inputs.input()]]}`;
    v.value = { array: [] };
    expect([...v.array]).toEqual([]);
    expect(v.value.array).toEqual([]);
  }
)
```

```js echo
suite.test(
  "Composite write spreads to array subproperty (addition) (via destructuring assignment)",
  async () => {
    const v = viewUI`<div>${["array", [Inputs.input()], (v) => Inputs.input(v)]}`;
    v.value = { array: [1, 2] };
    expect(v.value.array).toEqual([1, 2]);
    expect(v.array).toContainEqual(Inputs.input(1));
    expect(v.array).toContainEqual(Inputs.input(2));
  }
)
```

```js echo
suite.test(
  "Composite write spreads to array subproperty (addition) (via viewUI.value assignment)",
  async () => {
    const v = viewUI`<div>${["array", [Inputs.input()], (v) => Inputs.input(v)]}`;
    v.array.value = [1, 2]; // Should work but doesn't, we need some kind of ArrayView type
    expect(v.value.array).toEqual([1, 2]);
    expect(v.array).toContainEqual(Inputs.input(1));
    expect(v.array).toContainEqual(Inputs.input(2));
  }
)
```

```js echo
suite.test(
  "Composite write spreads to array subproperty (addition) (via data assignment)",
  async () => {
    const v = viewUI`<div>${["array", [Inputs.input()], (v) => Inputs.input(v)]}`;
    v.value.array = [1, 2];
    expect(v.value.array).toEqual([1, 2]);
    expect(v.array).toContainEqual(Inputs.input(1));
    expect(v.array).toContainEqual(Inputs.input(2));
  }
)
```

```js echo
suite.test("Array get", async () => {
  const v = viewUI`<div>${["array", [Inputs.input(1)]]}`;
  expect(v.value.array).toEqual([1]);
  expect(v.array[0]).toEqual(Inputs.input(1));
  expect([...v.array]).toEqual([Inputs.input(1)]);
})
```

```js echo
suite.test("Array write with builder creates new elements", async () => {
  const v = viewUI`<div>${["array", [Inputs.input()], (v) => Inputs.input(v)]}`;
  v.value.array = [1, 2];
  expect(v.value.array).toEqual([1, 2]);
  expect(v.array).toContainEqual(Inputs.input(1));
  expect(v.array).toContainEqual(Inputs.input(2));
})
```

```js echo
suite.test("Array write remove elements", async () => {
  const v = viewUI`<div>${["array", [Inputs.input(0), Inputs.input(2)]]}`;
  v.value.array = [1];
  expect(v.value.array).toEqual([1]);
  expect(v.array).toContainEqual(Inputs.input(1));
})
```

```js echo
suite.test("Array in-place splice support (delete), no builder", async () => {
  const v = viewUI`<div>${["array", [Inputs.input(0), Inputs.input(2)]]}`;
  v.value.array.splice(0, 1);
  expect(v.value.array).toEqual([2]);
})
```

```js echo
suite.test("Array in-place splice support (delete), with builder", async () => {
  const v = viewUI`<div>${[
    "array",
    [Inputs.input(0), Inputs.input(2)],
    (v) => Inputs.input(v)
  ]}`;
  v.value.array.splice(0, 1);
  expect(v.value.array).toEqual([2]);
})
```

```js echo
suite.test(
  "Array in-place splice support (addition) with builder",
  async () => {
    const v = viewUI`<div>${[
      "array",
      [Inputs.input(0)],
      (v) => Inputs.input(v)
    ]}`;
    v.value.array.splice(1, 0, 1);
    expect(v.value.array).toEqual([0, 1]);
    expect([...v.array]).toEqual([Inputs.input(0), Inputs.input(1)]);
  }
)
```

```js echo
suite.test("Dynamic Object value property assignment", async () => {
  const v = viewUI`<div>${["field", Inputs.input()]}`;
  v.value = { field: 1 };
  expect(v.field.value).toEqual(1);
  expect(v.value.field).toEqual(1);
})
```

```js echo
suite.test("Dynamic Object viewUI property assignment", async () => {
  const v = viewUI`<div>${["field", Inputs.input()]}`;
  v.field = Inputs.input("2");
  expect(v.field.value).toEqual("2");
  expect(v.value.field).toEqual("2");
})
```

```js echo
suite.test(
  "Dynamic Object write with builder creates new elements",
  async () => {
    const v = viewUI`<div>${["...", {}, (v) => Inputs.text({ value: v })]}`;
    v.value = { a: "b" };
    expect(v.value).toEqual({ a: "b" });
    expect(v.a).toHaveProperty("name"); // It's a DOM node
  }
)
```

```js echo
suite.test("Dynamic Object write deletes old elements", async () => {
  const v = viewUI`<div>${["...", { a: Inputs.text() }]}`;
  expect(v.value).toEqual({ a: "" });
  expect(v.a).toHaveProperty("name"); // It's a DOM node
  v.value = {};
  expect(v.value).toEqual({});
  expect(v.a).toBeUndefined();
})
```

```js echo
suite.test("Collection object creates matching keys", async () => {
  const v = viewUI`<div>${[
    "...",
    {
      a: Inputs.input()
    }
  ]}`;
  expect(v.value).toHaveProperty("a");
})
```

```js echo
//const toc = async () => {
//  const [{ Runtime }, { default: define }] = await Promise.all([
//    import(
//      "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"
//    ),
//    import(`https://api.observablehq.com/@nebrius/indented-toc.js?v=3`)
//  ]);
//  const module = new Runtime().module(define);
//  return module.value("toc");
//};

import {toc} from "/components/indented-toc.js"
```

```js
//import { footer } from "@tomlarkworthy/footer"
```

```js
//footer
```

```js echo
// import { exporter } from "@tomlarkworthy/exporter"
```

```js echo
// exporter()
```
