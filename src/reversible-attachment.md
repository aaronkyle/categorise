# Reversible attachment

https://observablehq.com/@tomlarkworthy/reversible-attachment

_reversibleAttach_ allows you toggle whether a viewUI is attached to a composite viewUI at runtime. This is useful for development when building viewUIs hierarchically, as you can use the _reversibleAttach_ to work on isolated pieces or the whole.

The value remain accessible in both places. Works with both `Inputs.form` and `@tomlarkworthy/view`, the latter supports back-driving values, which only works when the attachment is active.

        ```js
        import {reversibleAttach} from '@tomlarkworthy/reversible-attachment'
        ```

```js echo
const attachElement = Inputs.toggle({
  label: "attach"
})
```

```js echo
const attach = Generators.input(attachElement)
```

```js echo
attachElement
```

```js echo
attach
```

## child viewUI

```js echo
const childElement = Inputs.text()
```


```js echo
const child = Generators.input(childElement)
```

```js echo
display(childElement)
```

```js echo
child
```


## parent viewUI ([@tomlarkworthy/view](https://observablehq.com/@tomlarkworthy/view))

```js echo
// CHECK viewUI CONFIG
const parent = viewUI`<div>
${["child", reversibleAttach(attach, childElement)]}
</div>`
```

Note changes propogate to both

```js echo
child
```

```js echo
parent
```

Backdrivability works 

```js echo
Inputs.button("backdrive parent", {
  reduce: () => {
    parent.value.child = Math.random();
    parent.child.dispatchEvent(new Event("input", { bubbles: true }));
  }
})
```

## grandparent viewUI ([Inputs.form](https://observablehq.com/@observablehq/input-form))

```js echo
const attach_gpElement = Inputs.toggle({
  label: "attach gradparent"
})
```

```js echo
const attach_gp = Generators.input(attach_gpElement)
```

```js echo
attach_gp
```


```js echo
attach_gpElement
```

```js echo
const grand_parentElement = Inputs.form({
  parent: reversibleAttach(attach_gp, parent)
})
```

```js echo
const grand_parent = Generators.input(grand_parentElement)
```


```js echo
grand_parent
```


```js echo
grand_parentElement
```


```js echo
Inputs.button("backdrive grand_parent", {
  reduce: () => {
    grand_parent.parent.child = Math.random();
    grand_parent.dispatchEvent(new Event("input", { bubbles: true }));
  }
})
```

---

```js
const parents = new Map()
```

```js
function reversibleAttach(shouldBind, viewUI, invalidation) {
  if (!parents.has(viewUI) && viewUI.parentElement) {
    parents.set(viewUI, viewUI.parentElement);
  }
  if (shouldBind) {
    return viewUI;
  } else {
    if (parents.has(viewUI)) {
      const parent = parents.get(viewUI);
      if (parent.firstChild !== viewUI) parent.appendChild(viewUI);
    }
    const dummy = document.createTextNode("<detached>");
    return bindOneWay(dummy, viewUI, invalidation);
  }
}
```

```js echo
//import { viewUI, bindOneWay } from "@tomlarkworthy/viewUI"
import {viewUI, bindOneWay } from "/components/view.js";
display(viewUI);
display(bindOneWay)
```

```js echo
//import { footer } from "@tomlarkworthy/footer"
```

```js echo
//footer
```
