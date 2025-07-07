# localStorageView: Non-invasive local persistence

<!---
NOTE: There are several places where we need to check for compatibility with Framework, particularly around use of Inputs.bind
ALSO NOTE: THIS RELIES ON INSPECTOR
--->

Lets make it simple to add local storage to a UI control (e.g. [@observablehq/inputs](/@observablehq/inputs))


We exploit back-writability and input binding to avoid having to mess with existing UI control code.

_localStorageView(key)_ creates a read/write view of a [safe-local-storage](/@mbostock/safe-local-storage). Because it's a view it can be [_synchronized_](https://observablehq.com/@observablehq/synchronized-inputs) to any control we want to provide persistence for.

We avoid having to write any _setItem_/_getItem_ imperative wiring.

If you want all users to share a networked value, consider [shareview](https://observablehq.com/@tomlarkworthy/shareview).

This works with an view that follows [design guidelines for views](https://observablehq.com/@tomlarkworthy/ui-linter?collection=@tomlarkworthy/ui). A similar notebook for URL query fields is the [urlQueryFieldView](https://observablehq.com/@tomlarkworthy/url-query-field-view).

```
~~~js
    import {localStorageView} from '@tomlarkworthy/local-storage-view'
~~~
```

### Change log
- 2021-11-21: Added json option which is true uses JSON.stringify/parse
- 2021-10-09: Added defaultValue option


### Demo

So starting with an ordinary control:

```js echo
const example1 = view(Inputs.range())
```

We will use the excellent  [@mbostock/safe-local-storage](/@mbostock/safe-local-storage) which very nicely abstracts over enhanced privacy controls with an in memory fallback.

```js echo
//import { localStorage } from '@mbostock/safe-local-storage'
import { localStorage } from './safe-local-storage.js';
display(localStorage)
```


```js echo
//added DOM control
import {DOM} from "/components/DOM.js";
```


However, we don't want to have to mess around with our original control to add local persistence. Instead we create a writable [view](https://observablehq.com/@observablehq/introduction-to-views) of a local storage key

```js echo
const example1storage = view(localStorageView("example1"))
```

```js echo
const localStorageView = (
  key,
  { bindTo = undefined, defaultValue = null, json = false } = {}
) => {
  const id = DOM.uid().id;
  const ui = htl.html`<div class="observablehq--inspect" style="display:flex">
    <code>localStorageView(<span class="observablehq--string">"${key}"</span>): </code><span id="${id}">${inspect(
    localStorage.getItem(key) || defaultValue
  )}</span>
  </div>`;
  const holder = ui.querySelector(`#${id}`);

  const view = Object.defineProperty(ui, "value", {
    get: () => {
      const val = json
        ? JSON.parse(localStorage.getItem(key))
        : localStorage.getItem(key);
      return val || defaultValue;
    },
    set: (value) => {
      value = json ? JSON.stringify(value) : value;
      holder.removeChild(holder.firstChild);
      holder.appendChild(inspect(localStorage.getItem(key) || defaultValue));
      localStorage.setItem(key, value);
    },
    enumerable: true
  });

  if (bindTo) {
    Inputs.bind(bindTo, view);
  }

  return view;
}
```

```js echo
localStorageView.value
```

And we bind our original control to the key view


```js echo
// Note you need to get these the right way round to have the page load work correctly
// CHECK TO DETERMINE THAT THIS BINDING PARAMETER IS CORRECT FOR FRAMEWORK
Inputs.bind(example1, example1storage)
```

Tada! that control will now persist its state across page refreshes.


### JSON support

Set *json* to true to *serde*.

```js echo
const jsonView = view(localStorageView("json", {
  json: true
}))
```

```js echo
jsonView
```

```js echo
// THIS NEED TO BE VERIFIED AGAINST FRAMEWORK
jsonView.value
```

### Writing

```js echo
// THIS NEED TO BE VERIFIED AGAINST FRAMEWORK
{
  jsonView.value = {
    rnd: Math.random()
  };
  jsonView.dispatchEvent(new Event("input", { bubbles: true }));
}
```

### In two cells

It is quite likely we often just want to create the view and bind it to a ui control so just pass the viewof in as the _bindTo_ option in the 2nd argument


```js echo
const example2 = view(Inputs.textarea())
```

```js echo
// CHECK FOR FRAMEWORK COMPATIBILITY
localStorageView("example2", {
  bindTo: example2
})
```

### In a single cell!

You can even declare a UI control, wrap it with local storage and return in a single cell! (thanks @mbostock!)


```js echo
const example3 = view(Inputs.bind(Inputs.textarea(), localStorageView("example3")))
```

```js
//import { inspect } from "@tomlarkworthy/inspector"
import { inspect } from "./inspector.js"
```

```js echo
//import { footer } from "@endpointservices/endpoint-services-footer"
```

```js echo
//footer
```
