//# Composing viewofs with the _viewUI_ literal
//https://observablehq.com/@tomlarkworthy/view?collection=@tomlarkworthy/ui
//<!--NOTE: This is a complex notebook to convert. -->


import * as htl from '/components/htl_npm.js';
import { html } from "/components/htl.js";
import {Generators} from "observablehq:stdlib";

import * as Inputs from "/components/inputs_observable.js";
import { DOM } from "/components/DOM.js"

import markdownit from "markdown-it";
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


/* Helper to return elements where the view() function was used in Framework. */
const view = x => x;


/* =========== core =========== */

// ### variable

export function variable(value, { name = "variable" } = {}) {
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


// NOTE: This doesn't appear to be configured correctly
const variableGen = (async function* () {
  let resolve = null;
  example_variable.addEventListener('assign', evt => resolve(evt.detail));
  while (true) {
    yield new Promise(r => (resolve = r));
  }
})()



// Copied from https://github.com/observablehq/inputs/blob/main/src/bind.js
export const bindOneWay = (() => {
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



// ### arrayView

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


// ## Code



export function viewUI(strings, ...exprs) {
  return wrap(htl.html, strings, ...exprs);
}



function viewUISvg(strings, ...exprs) {
  return wrap(htl.svg, strings, ...exprs);
}



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




// ## Extras

// ### Cautious Wrapper



export function cautious(
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


// #### Cautious demo



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




const cautiousNestedDemo = Generators.input(cautiousNestedDemoView)






/* =========== UI =========== */



///#### Demo


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



const composite = Generators.input(compositeView)





//## Back-writable



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


//## Singletons



// NOTE:  We need to reconcile this with how viewUIs work in Framework
const singletonView = viewUI`<div><h4>My control</h4>${['...', Inputs.range()]}`



const singleton = Generators.input(singletonView)


// ## Collections -- Arrays



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



const arrayCollection = Generators.input(arrayCollectionView)




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



//### Dynamic Arrays



// viewof dynamicArrayCollection = viewUI`<div>${[
const dynamicArrayCollectionView = viewUI`<div>${[
  'elements',
  [],
  val => Inputs.range([0, 1], { value: val }) // rowBuilder
]}`




const dynamicArrayCollection = Generators.input(dynamicArrayCollectionView)





Inputs.button("Add a slider", {
  reduce: () => {
    dynamicArrayCollectionView.value.elements.push(Math.random());
    // dispatch the input event so dataflow gets updated
    //viewof dynamicArrayCollection.elements.dispatchEvent(new Event("input"));
    dynamicArrayCollectionView.value.elements.dispatchEvent(new Event("input"));
  }
})



Inputs.button("Remove a slider", {
  reduce: () => {
    dynamicArrayCollectionView.value.elements.pop();
    // dispatch the input event so dataflow gets updated
    //viewof dynamicArrayCollection.elements.dispatchEvent(new Event("input"));
    dynamicArrayCollectionView.value.elements.dispatchEvent(new Event("input"));
  }
})



//const objects = md`## Collections -- Objects
//
//  You can bind an object of [string, viewUI] to many parameters with the special spread key '_..._'
//
//`


//## Collections -- Objects



// viewof objectCollection = viewUI`${[
const objectCollectionView = viewUI`${[
  '...',
  {
    number: Inputs.range(),
    text: Inputs.text()
  }
]}`




const objectCollection = Generators.input(objectCollectionView)



// ### Dynamic Objects



// viewof dynamicObjectCollection = viewUI`<div>${[
const dynamicObjectCollectionView = viewUI`<div>${[
  '...',
  {},
  txt => Inputs.text({ value: txt })
]}`




const dynamicObjectCollection = Generators.input(dynamicObjectCollectionView)



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


// ## Hidden viewUIs




//viewof hiddenView = viewUI`<div><h4>My hidden control</h4>${[
const hiddenViewView = viewUI`<div><h4>My hidden control</h4>${[
  '_hidden',
//  viewof singleton
singleton

]}`




const hiddenView = Generators.input(hiddenViewView)




// ### bindOneWay



//viewof slider = Inputs.range([0, 10], { value: 0, label: "Try increasing me" })
const sliderElement = Inputs.range([0, 10], { value: 0, label: "Try increasing me" })



const slider = Generators.input(sliderElement)



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




const levels = Generators.input(levelsElement)



//viewof levelsText = bindOneWay(Inputs.text({ disabled: true }), viewof levels, {
const levelsTextElement = bindOneWay(Inputs.text({ disabled: true }), 
//viewof levels, {
//levels, {
levelsElement, {
  transform: l => `The level is ${l}`
})


const levelsText = Generators.input(levelsTextElement)



///




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



//viewof arrayViewTests = testing.createSuite({
//const arrayViewTests = view(testing.createSuite({
//    name: "arrayView Tests",
//  timeout_ms: 1000
//}))




///md`length: ${numbers.length} with elements: ${numbers.join(", ")}`



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



