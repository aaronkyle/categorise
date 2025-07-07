# Brand Colors

_Brand attributes are based on ADB Branding Toolkit._

### Main Palette

${generateSwatchHTML(mainColors)}


```js
const mainColors = ({
  "900": "#007DB7", //rgb(0,125,183)
  "800": "#0088C7", //rgb(0,136,199)
  "700": "#0099D8", //rgb(0,153,216)
  "600": "#00A1CB", //rgb(0,161,203)
  "500": "#009FD6", //rgb(0,159,214)
  "400": "#41BEE8", //rgb(65,190,232)
  "300": "#68C5EA", //rgb(104,197,234)
  "200": "#6DBCE3", //rgb(109,188,227)
  "100": "#6DCFF6", //rgb(109,207,246)
})
```

### Accent Palette

${generateSwatchHTML(accentColors)}


```js
const accentColors = ({
  "900": "#00A5D2", // rgb(0,165,210)
  "800": "#00B6C9", // rgb(0,182,201)
  "700": "#63CCEC", // rgb(99,204,236)
  "600": "#8DC63F", // rgb(141,198,63)
  "500": "#C8DA2B", // rgb(200,218,43)
  "400": "#F2E600", // rgb(242,230,0)
  "300": "#E9532B", // rgb(233,83,43)
  "200": "#F57F29", // rgb(245,127,41)
  "100": "#FDB515", // rgb(253,181,21)
})
```

```js
const generateSwatchHTML = (palette) => {
  const listStyles = "display: inline-block; width: 4rem; height: 4rem; padding: 0.25rem;color:white";
  const swatches = Object.keys(palette).reduce((acc, key)=> html`<li style="background-color: ${palette[key]};${listStyles}">${key}</li>${acc}`,"");
  return html`<ul style="list-style: none;padding-left: 0; display: flex;">${swatches}</ul>`
}
```

```js
// To apply base styles when the notebook is downloaded/exported
//substratum({invalidation})
```

```js
//import {substratum} from "@categorise/substratum"
```
