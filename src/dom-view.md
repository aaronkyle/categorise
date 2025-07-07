# DOM view

A view whose value is a DOM node, and whose view is a container of that value. 

```
~~~js
import {domView} from '@tomlarkworthy/dom-view'
~~~
```

```js echo
const domView = ({ className = "" } = {}) => {
  const dom = document.createElement("div");
  dom.className = className;
  dom.value = undefined;
  invalidation.then(dom.addEventListener("input", () => {}));
  Object.defineProperty(dom, "value", {
    set: (value) => {
      if (dom.firstChild) dom.textContent = "";
      if (value) dom.appendChild(value);
    },
    get: () => dom.firstChild
  });
  return dom;
}
```

```js echo
const example = display(domView())
```

```js echo
(example.value = html`<button>❤️</button>`)
```
