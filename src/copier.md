# Copier


<div class="tip">
This notebook ports a notebook by Mike Bostock [@mbostock] called <a href="https://observablehq.com/@mbostock/copier">Copier</a>.  All mistakes and deviations from the original are my own.
</div>

---

<!-- https://observablehq.com/@mbostock/copier -->


<p style="background: #fffced; box-sizing: border-box; padding: 10px 20px;">***Update Sep. 2021:*** *Buttons are now available as part of [**Observable Inputs**](/@observablehq/inputs), and you can use <code>navigator.clipboard.writeText</code> to copy text to the clipboard! This notebook will remain for history, but please upgrade.*</p>

A button to help copy snippets of text to the clipboard. To use in your notebook:

```
~~~js
import {Copier} from "@mbostock/copier"
~~~
```


${Copier("Copy import", {value: `import {Copier} from "@mbostock/copier"`})}


```js
view(Inputs.textarea({placeholder: "Now try pasting here."}))
```

```js echo
Copier("Click me!", {value: "Hello, world!"})
```

```js echo
Copier([
  ["1", "I have eaten the plums that were in the icebox"],
  ["2", "and which you were probably saving for breakfast"],
  ["3", "Forgive me they were delicious so sweet and so cold"]
], {label: "Snippets"})
```

---

## Implementation

```js echo
(() => {
  let count = 0;
  return Object.assign(
    html`<button>Click me to copy text!`,
    {
      onclick: () => pbcopy(`Hello, world! ${++count}`)
    }
  );
})()
```

```js echo
const pbcopy = text => navigator.clipboard.writeText(text)
```

```js echo
function Copier(content = "Copy code", options) {
  if (Array.isArray(content)) content = Array.from(content, ([key, value]) => [key, () => (pbcopy(value), value)]);
  return Inputs.button(content, {...options, reduce: (value) => (pbcopy(value), value)});
}
```

```js echo
const copy = pbcopy // Deprecated alias
```
