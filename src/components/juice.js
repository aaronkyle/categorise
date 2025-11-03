// # Squeezing more _Juice_ out of UI libraries

import {html} from "htl";    
import * as Promises from "/components/promises.js"
import { Generators } from "observablehq:stdlib";


//!!! Note namespace collision with juice definition of viewUI
//import { view, variable } from "@tomlarkworthy/view"
import { viewUI, variable } from "/components/view.js"

import * as Inputs from "/components/inputs.js";




//## Implementation


const juice = (builder, targets = {}) => (...args) => {
  const result = proxyVariable({
    name: "result",
    get: () => viewUIElement.value,
    set: (newVal) => (viewUIElement.value = newVal)
  });

  const proxyPassthrough = (evt) => {
    result.dispatchEvent(new CustomEvent("input", evt));
  };

  let viewUIElement = builder(...args);
  viewUIElement.addEventListener("input", proxyPassthrough);

  const vars = Object.fromEntries(
    Object.entries(targets)
      .filter(([target, _]) => target !== "result") // result var is handled a bit differently
      .map(([target, path]) => {
        const v = variable(_.get(args, path), { name: target });
        v.addEventListener("assign", () => {
          // Patch the args based on the current values in the variables
          Object.keys(targets).forEach((target) => {
            const path = targets[target];
            // Current value, normally pulled from the vairable but special case for the 'result'
            const value =
              target === "result" ? viewUIElement.value : vars[target].value;
            _.update(args, path, () => value);
          });
          // We create a whole new view and substitute it in
          const newView = builder(...args);
          viewUIElement.replaceWith(newView); // A fair amount of state is lost here, but reconcile doesn't work
          viewUIElement.removeEventListener("input", proxyPassthrough);
          viewUIElement = newView;
          viewUIElement.addEventListener("input", proxyPassthrough);
        });
        return [target, v];
      })
  );
  const ui = viewUI`<span>${["...", vars]}${["result", result]}${viewUIElement}`;
  return ui;
}


//### helpers

function proxyVariable({ name = "variable", get, set } = {}) {
  const self = document.createComment(name);
  return Object.defineProperties(self, {
    value: {
      get: get,
      set: set,
      enumerable: true
    },
    toString: {
      value: () => `${get()}`
    }
  });
}





//## fastest way to make UI components

const profile = juice((name, age) => html`Your name is ${name} your age is ${age}`, {
  name: "[0]", // we index into the ...arguments array
  age: "[1]"
})


Inputs.bind(Inputs.range([0, 99]), exampleElement.age)

//## *juice* API

//        ~~~
//            juice(VIEW_BUILDER, JUICE_CONFIG) => NEW_VIEW_BUILDER
//        ~~~

//### 1st arg is a view builder
//### 2nd arg is the argument remapping

//### Works with any functional UI


//### Open Issues

//##### DOM state lost when parameters


//## Range with dynamic max and min

const dynamicRange = juice(Inputs.range, {
  label: "[1].label",
  min: "[0][0]", // "range" is first arg (index 0), the min is the 1st arg of the range array
  max: "[0][1]", // "range" is first arg, the max is the 2nd paramater of that array
  result: "[1].value" // "result" can be set in the options.value, options being the 2nd arg (index 0)
})


const dynamicRangeMinElement = dynamicRange([-1, 1], {
  label: "dynamic range min",
  value: -1
})


const dynamicRangeMin = Generators.input(dynamicRangeMinElement)


const dynamicRangeMaxElement = dynamicRange([-1, 1], {
  label: "dynamic range max",
  value: 1
})


const dynamicRangeMax = Generators.input(dynamicRangeMaxElement)


const inMaxConstraints = () => {
  // We want dynamicRangeMax to constrain the dynamic range's max and min
  //Inputs.bind(viewof dynamicRangeExample.max, viewof dynamicRangeMax.result);
  Inputs.bind(dynamicRangeExample.max, dynamicRangeMax.result);
  //Inputs.bind(viewof dynamicRangeExample.min, viewof dynamicRangeMin.result);
  Inputs.bind(dynamicRangeExample.min, dynamicRangeMin.result);
  // Of course, the max of the min should also be constrained by the max too
  //Inputs.bind(viewof dynamicRangeMin.max, viewof dynamicRangeMax.result);
  Inputs.bind(dynamicRangeMin.max, dynamicRangeMax.result);
  //Inputs.bind(viewof dynamicRangeMax.min, viewof dynamicRangeMin.result);
  Inputs.bind(dynamicRangeMax.min, dynamicRangeMin.result);
}


//### Select with Dynamic Options

const dynamicSelect = juice(Inputs.select, {
  label: "[1].label",
  options: "[0]", // "options" is first arg (index 0) of Inputs.select
  result: "[1].value" // "result" can be set in the options.value, options being the 2nd arg (index 0)
})


Inputs.button("deal", {
  reduce: () => {
    const rndCard = () => {
      const card = Math.floor(Math.random() * 52);
      return (
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"][
          card % 14
        ] + ["♠", "♥", "♦", "♣"][Math.floor(card / 14)]
      );
    };
   //viewof exampleSelect.options.value = [rndCard(), rndCard()];
   exampleSelect.options = [rndCard(), rndCard()];
   //viewof exampleSelect.options.dispatchEvent(new Event("input"));
   exampleSelect.options.dispatchEvent(new Event("input"));
  }
})


const exampleSelectElement = dynamicSelect([], { label: "play a card" })

const exampleSelect = Generators.input(exampleSelectElement)
