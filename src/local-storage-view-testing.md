# localStorageView: Non-invasive local persistence

<!---
NOTE: There are several places where we need to check for compatibility with Framework, particularly around use of Inputs.bind
ALSO NOTE: THIS RELIES ON INSPECTOR
--->


```js echo
//added DOM control
import {DOM} from "/components/DOM.js";
display(DOM)
```

```js echo
//import { inspect } from "@tomlarkworthy/inspector"
import { inspect } from "/components/inspector.js";
display(inspect)
```

```js echo
//import { localStorage } from '@mbostock/safe-local-storage'
import { localStorage } from '/components/safe-local-storage.js';
display(localStorage)
```




```js echo
const example_base = Inputs.range()
//const example1 = Generators.input(example1Element)
```

```js echo
display(example_base)
```

```js echo
const example1 = view(example_base)
```


```js echo
example1
```

```js echo
//const example1 = Generators.input(example_base);
//const example1 = Generators.input(example1Element)
```

```js echo
const example1storage = localStorageView("example1");
```

```js echo
example1storage
```

```js echo
function localStorageView(key, { bindTo, defaultValue = null, json = false } = {}) {
  const id = DOM.uid().id;

  const readRaw = () => localStorage.getItem(key);
  const readValue = () => {
    const raw = readRaw();
    if (raw == null) return defaultValue;
    if (!json) return raw;
    try { return JSON.parse(raw); } catch { return defaultValue; }
  };

  const ui = htl.html`<div class="observablehq--inspect" style="display:flex; gap:.5rem;">
    <code>localStorageView(<span class="observablehq--string">"${key}"</span>):</code>
    <span id="${id}"></span>
  </div>`;
  const holder = ui.querySelector(`#${id}`);
  holder.textContent = String(readValue());

  Object.defineProperty(ui, "value", {
    get: readValue,
    set: (value) => {
      const toStore = json ? JSON.stringify(value) : value;
      localStorage.setItem(key, toStore);
      holder.textContent = String(readValue());
    },
    enumerable: true
  });

  if (bindTo) Inputs.bind(bindTo, ui);
  return ui;
}
display(localStorageView)
```

```js echo
localStorageView.value
```

```js echo
// Note you need to get these the right way round to have the page load work correctly
// CHECK TO DETERMINE THAT THIS BINDING PARAMETER IS CORRECT FOR FRAMEWORK
Inputs.bind(example_base, example1storage)
```
