# Composing views across time: viewroutine

```js echo
import {Promises} from "/components/promises.js"
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

${await FileAttachment("viewroutine.png").image()}

Sometimes you want to put a sequence of UI steps in a single cell. Using inspiration drawn from Unity and Golang ([_coroutines_](https://docs.unity3d.com/Manual/Coroutines.html) and _goroutines_) checkout the _viewroutine_. A _viewroutine_ leans on Javascript's _async generator functions_ to compose views across time.

    ```
    ~~~
        viewroutine(generator: async function*) => viewof
    ~~~
    ```

The import:-

    ```
    ~~~js
    import {viewroutine, ask} from '@tomlarkworthy/viewroutine'
    ~~~
    ```

## What is a view again?

A view

- contains a visual DOM component (viewof foo)
- contains a data component (foo) as the value of the visual component (viewof foo.value)
- Emits _input_ events to signal listeners that the data value has changed
- Like all cells, the viewof cell can be a generator as well and be its own stream

(see also https://observablehq.com/@observablehq/introduction-to-views)

## What is an async generator?

Async generators
- Have a signature like _async foo*()_
- have intermediate return values in the body with _yield_
- can have a final return value with _return_
- can use _await_ in the body
- can bulk return the results of other generators with _yield*_

(see also https://observablehq.com/@observablehq/introduction-to-generators)

## Putting it together

The broad idea of a viewroutine, is that an async generator yields a stream of visual components, and we update an overarching span by setting its only child to be those stream of values. Thus, the span becomes a view that doesn't invalidate when the generator yields.

There are a few nice properties with this. You can have variables declared in the closure that are carried between yields. This can often replace the use of an overarching _mutable_ in Observable.

You can compose generators by using the _yield*_ syntax making things compose nicely.

You can on demand and programatically drive the sequence, wait for user input, make choices _etc._ You could probably build an entire app in this way, and it can be decomposed into functional pieces.

One other important aspect of views is programmatic control over when an input event is raised. The viewroutine will emit an event if yielded.  


### Pattern we are trying to fix

We want to avoid stuffing a model into a mutable and asynchronously updating that from a dedicated input cell. It takes up too many cells and the use of mutable has lots of unexpected implications such as not working when imported from other notebooks


```js echo
//VERIFY MUTABLE
//mutable nameOfThing = undefined
const nameOfThing = Mutable(undefined)
```

```js echo
const newName = view(Inputs.text({
  label: "please enter the name of the thing to create",
  submit: true,
  minlength: 1
}))
```

<!--
MUTABLE HERE LIKELY HITTING ERRORS
NEED NEW SETTER
--->

```js echo
const sideEffect = async function* (newName) {
  yield md`<mark>updating`;
  await new Promise(r => setTimeout(r, 1000));
  nameOfThing.value = newName;

  yield md`<mark>updated!!!`;
}
```

## The viewroutine

```js echo
function viewroutine(generator) {
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
```

### Example

_ask_ wraps any input. It yields the passed in input to be its visual representation, but its final return is the value submitted, which ends the routine (allowing an enclosing generator to continue with the sequence)

```js
async function* ask(input) {
  let responder = null;
  const response = new Promise(resolve => (responder = resolve));
  input.addEventListener('input', () => responder(input.value));
  yield input;
  return await response;
}
```

Now we can do the same thing without a mutable, even carrying the inputed name in the first step to steps further along.

```js echo
const example1 = view(viewroutine(async function*() {
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
}))
```

```js echo
example1
```

## Animation Example with return values

Mixing HTML with SVG and composing animations


```js echo
choice
```

```js echo
const choice = view(viewroutine(async function*() {
  while (true) {
    const choice = yield* choose();
    if (choice == 'square') yield* flashSquare();
    if (choice == 'star') yield* flashStar();
  }
}))
```

```js echo
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
```

```js echo
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
```

```js echo
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
```

```js echo
//import { footer } from "@tomlarkworthy/footer"
```

```js echo
//footer
```
