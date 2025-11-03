# Survey Slate | Common Components


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

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

```js echo
const document_toc = toc({
  headers: "h2,h3,h4,h5",
  hideStartingFrom: "Imports"
})
```


${document_toc}

## TextNodeView

A textNodeView syncs its value to a simple textNode DOM element. Because its a view, it can be added to a view-literal expression in quite a simple way.

```js echo
const textNodeViewExample = view(textNodeView("hi"))
```

```js echo
textNodeViewExample
```

```js echo
Inputs.button("Randomize textNodeViewExample", {
  reduce: () => {
    textNodeViewExample.value = Math.random();
    textNodeViewExample.dispatchEvent(new Event('input', {bubbles: true}))
  }
})
```

```js echo
const textNodeView = (value = '') => {
  const node = document.createTextNode(value)
  return Object.defineProperty(node, 'value', {
    get: () => node.textContent,
    set: (val) => node.textContent = val,
    enumerable: true
  });
}
```

## Logotype

```js
html`${logotype("Survey Slate")}`
```

```js echo
const logotype = (name = "Survey Slate") => html`<div class="[ pa2 flex items-center w3 h3 ][ f6 lh-title b tracked-light ][ text-on-brand bg-accent ]">${name}`
```

## Page Header

### One title

${pageHeader(['One title'])}

<br>

### Multiple titles

${pageHeader(['Level One', 'Level Two', 'Level Three'])}

```js echo
const pageHeader = (titles, brandName = "Survey Slate") => {
  const header = html`<div class="flex bg-text-on-brand">
  <div class="flex-none">
    ${logotype(brandName)}
  </div>
  <div class="[ flex items-center ph3 w-100 ][ f6 f5-ns ]">
    ${titles.reduce((acc,t, i, arr) => {
      const isLast = i === arr.length - 1;
      const commonClasses = "lh-solid ma0";
      const specialClasses = isLast ? "b" : "dn db-ns mid-gray";
      const seperator = isLast ? "" : `<span aria-hidden="true" class="mv0 mh2 black-20">/<span>`;

      return `${acc}<p class="${commonClasses} ${specialClasses}">${t}${seperator}</p>`;
    }, "")}
  </div>
</div>`

  return header;
}
```

## Page Footer

${pageFooter()}

```js echo
const pageFooter = (brandName = "Survey Slate") => {
  const linkClasses = "link brand underline-hover";
  const year = new Date().getFullYear();

  return html`<footer class="[ flex flex-wrap justify-center justify-between-l pa3 ph2 ph5-ns ][ f6 gray bg-white ]">
  <div class="[ flex flex-wrap justify-center ][ space-x-2 ]">
    © ${year} ${brandName}</div></footer>`
    }
```

## Spinner (Loader)

```js echo
spinner()
```

```js echo
const spinner = () => { 
  return html`<span class="spinner">${getIconHtml("loader")}</span>`
}
```

## Button Label

Use `buttonLabel()` to generate HTML to populate label element in `Inputs.button`. This label generator supports icons. 

```js
html`<div class="space-y-2">
${Inputs.button(buttonLabel({label: 'Text only label'}))}
${Inputs.button(buttonLabel({ariaLabel: 'Button with only Icon', iconLeft: 'circle'}))}
${Inputs.button(buttonLabel({label: 'Left label', iconLeft: 'circle'}))}
${Inputs.button(buttonLabel({label: 'Right label', iconLeft: 'circle'}))}
</div>`
```

```js echo
const buttonLabel = ({label, iconLeft, iconRight, iconRightClass, iconLeftClass, ariaLabel}) => {
  let labelHtml = "";
  if (iconLeft) {
    labelHtml += `${getIconHtml(iconLeft, `icon--sm ${iconLeftClass || ""}`)} `;
  }

  if(label) {
    labelHtml += `<span class="button-label__text">${label}</span>`;
  }

  if (iconRight) {
    labelHtml += `${getIconHtml(iconRight, `icon--sm ${iconRightClass || ""}`)} `;
  }

  if (ariaLabel) {
    labelHtml += `<span class="clip">${ariaLabel}</span>`;
  }
  
  return html`<span class="button-label">${labelHtml}</span>`
}
```

```js echo
const getIconHtml = (name, klasses = "") => `<span class="icon ${klasses}">${getIconSvg(name, 24, {role: 'img'})}</span>`
```

## Styles

```js echo
// Thanks @mootari, https://observablehq.com/@saneef/is-observable-inputs-style-able
const ns = Inputs.text().classList[0]
```

```js echo
const styles = html`<style>
  :root {
    --button-border-radius: var(--border-radius-2, 0.25rem);
    --border-color: #aaa; /* tachyons's light-silver */
    --border-color-light: #eee; /* tachyons's light-gray */
  }

  /* https://observablehq.com/@saneef/is-observable-inputs-style-able */
  form.${ns} {
    width: auto;
  }

  .${ns} input,
  .${ns} textarea,
  .${ns} select,
  .${ns} button {
    font-family: var(--brand-font);
  }

  .${ns} input[type="text"],
  .${ns} textarea,
  .${ns} select,
  .${ns} button {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: var(--button-border-radius);
  }

  .${ns} input[type="text"],
  .${ns} textarea,
  .${ns} button {
    padding: var(--spacing-extra-small) var(--spacing-small);
  }

  .${ns} select {
    padding-top: var(--spacing-extra-small);
    padding-bottom: var(--spacing-extra-small);
  }

  .${ns} button:hover,
  .${ns} button:focus,
  .${ns} button:active {
    background-color: var(--light-gray, #eee);
  }

  /* Icon */

  .icon {
    display: inline-block;
    position: relative;
    vertical-align: middle;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--gray, #777)
  }

  .icon svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .icon--sm {
    width: 1rem;
    height: 1rem;
  }
  
  .icon--danger {
    color: var(--red, #ff4136)
  }

  .icon--success {
    color: var(--green, #19a974)
  }

  /* Button Group*/

  .button-group {
    display: flex;
  }

  .button-group form.${ns} + form.${ns} {
    margin-left: -1px;
  }

  .button-group form.${ns} button {
      border-radius: 0;
    }

  .button-group form.${ns}:first-child button {
    border-top-left-radius: var(--button-border-radius);
    border-bottom-left-radius: var(--button-border-radius);
  }

  .button-group form.${ns}:last-child button {
    border-top-right-radius: var(--button-border-radius);
    border-bottom-right-radius: var(--button-border-radius);
  }

  /* Button Label */
  .button-label {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  .button-label > * + * {
    margin-left: var(--spacing-extra-small, 0.25rem);
  }
  .button-label__text {}

  /* Card */

  .card {
    display: block;
    background: white;
    padding: 1rem; /* pa3 or --spacing-medium */
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-3);
  }

  .card--compact {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Loader */
  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
  .spinner .icon {
    color: var(--brand);
  }
  .spinner svg {
    animation: rotate ease-out 1.2s infinite;
  }
</style>`
```

### Styles for the demo

```js echo
html`
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style type="text/css" media="screen, print">
  body {
    font-family: var(--brand-font);
  }
</style>
`
```

```js echo
tachyonsExt({
  colors: {
    brand: mainColors[900], // or, provide and color hex code
    accent: accentColors[900], // or, provide and color hex code
    // The color of text which are usually displayed on top of the brand or accent colors.
    "text-on-brand": "#ffffff",
  },
  fonts: {
    "brand-font": `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
  }
})
```

## Imports

```js echo
//import {tachyonsExt} from "@categorise/tachyons-and-some-extras"
import {tachyonsExt} from "/components/tachyons-and-some-extras.js"
```

```js echo
//import {toc} from "@nebrius/indented-toc"
import {toc} from "/components/indented-toc.js"
```

```js echo
//import {mainColors, accentColors} from "@categorise/brand"
import {mainColors, accentColors} from "/components/brand.js"
```

```js echo
//import {getIconSvg} from "@saneef/feather-icons"
import {getIconSvg} from "/components/feather-icons.js"
```

---

```js echo
//import { substratum } from "@categorise/substratum"
import { substratum } from "/components/substratum.js"
```

```js
substratum({ invalidation })
```
