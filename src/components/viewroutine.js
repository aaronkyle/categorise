//# Composing views across time: viewroutine
// THIS NOTEBOOKS NEEDS WORK - THE MUTABLE ISN'T PROPERLY DEFINED

import * as Inputs from "/components/inputs_observable.js";

import * as Promises from "/components/promises.js"
import { Mutable } from "@observablehq/stdlib";

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


//VERIFY MUTABLE
//mutable nameOfThing = undefined
const nameOfThing = Mutable(undefined)

//const newName = view(Inputs.text({
const newName = Inputs.text({
  label: "please enter the name of the thing to create",
  submit: true,
  minlength: 1
})
//}))

//MUTABLE HERE LIKELY HITTING ERRORS
//NEED NEW SETTER

const sideEffect = async function* (newName) {
  yield md`<mark>updating`;
  await new Promise(r => setTimeout(r, 1000));
  nameOfThing.value = newName;

  yield md`<mark>updated!!!`;
}

export function viewroutine(generator) {
  let current;
  const holder = Object.defineProperty(
    document.createElement("span"),
    "value",
    {
      get: () => current?.value,
      set: (v) => (current ? (current.value = v) : null),
      enumerable: true
    }
  );

  new Promise(async () => {
    const iterator = generator();
    const n = await iterator.next();
    let { done, value } = n;
    while (!done) {
      if (value instanceof Event) {
        holder.dispatchEvent(value);
      } else {
        current = value;
        if (holder.firstChild) holder.removeChild(holder.firstChild);
        if (value) {
          holder.appendChild(value);
        }
      }
      ({ done, value } = await iterator.next());
    }
    holder.remove();
  });
  return holder;
}

export async function* ask(input) {
  let responder = null;
  const response = new Promise(resolve => (responder = resolve));
  input.addEventListener('input', () => responder(input.value));
  yield input;
  return await response;
}

//const example1 = view(viewroutine(async function*() {
const example1 = viewroutine(async function*() {
  let newName = undefined;
  while (true) {
    newName = yield* ask(
      Inputs.text({
        label: "please enter the name of the thing to create",
        minlength: 1,
        value: newName,
        submit: true
      })
    );
    yield md`<mark>updating to ${newName}`; // Note we can remember newName
    await new Promise(r => setTimeout(r, 1000)); // Mock async action
    yield* ask(htl.html`${md`<mark>updated`} ${Inputs.button("Again?")}`);
  }
  })
//}))

//const choice = view(viewroutine(async function*() {
const choice = viewroutine(async function*() {
while (true) {
    const choice = yield* choose();
    if (choice == 'square') yield* flashSquare();
    if (choice == 'star') yield* flashStar();
  }
})
//}))

async function* choose() {
  let resolve;
  yield Object.defineProperty(
    htl.html`<button onclick=${() =>
      resolve('star')}>click to play star</button>
             <button onclick=${() =>
               resolve('square')}>click to play square</button>`,
    'value',
    {
      value: 'undecided'
    }
  );
  yield new Event("input", { bubbles: true });
  return await new Promise(function(_resolve) {
    resolve = _resolve;
  });
}

async function* flashSquare() {
  for (let index = 0; index < 360; index += 5) {
    yield Object.defineProperty(
      html`<span style="display:inline-block; width:50px;height:50px; background-color: hsl(${index}, 50%, 50%);"></span>`,
      'value',
      {
        value: "square"
      }
    );
    if (index === 0) yield new Event("input", { bubbles: true });
    await Promises.delay(10);
  }
}

async function* flashStar() {
  for (let index = 0; index < 360; index += 5) {
    yield Object.defineProperty(
      htl.svg`<svg height="50" width="50" viewbox="0 0 200 200">
        <polygon points="100,10 40,198 190,78 10,78 160,198"
                 style="fill:hsl(${index}, 50%, 50%);" /></svg>`,
      'value',
      {
        value: "star"
      }
    );
    if (index === 0) yield new Event("input", { bubbles: true });
    await Promises.delay(10);
  }
}
