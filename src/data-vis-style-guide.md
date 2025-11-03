# Style Guide for Data Visualizations

- [Why did we create a new colour palette for ADB data visualizations](https://observablehq.com/@adb/why-did-we-need-a-new-colour-palette-for-adb-data-visualizations)

```js
toc("h2,h3,h4")
```

---

## Colors

### Main colors

```js echo
const main = (() => ({
  blue: {
    "400": "#a1d3f2",
    "500": "#73beeb",
    "600": "#47a5da",
    "700": "#298abd",
    "800": "#156e9a",
    "900": "#075376"
  },
  green: {
    "400": "#b0da83",
    "500": "#96c45f",
    "600": "#7daa42",
    "700": "#648e2c",
    "800": "#4d7117",
    "900": "#375601"
  },
  red: {
    "400": "#f1c2b5",
    "500": "#eda28e",
    "600": "#e67d62",
    "700": "#d25a3b",
    "800": "#b23f20",
    "900": "#8d290c"
  },
  grey: {
    "100": "#fbfbfc",
    "200": "#eff1f4",
    "300": "#dde1e7",
    "400": "#c5cdd7",
    "500": "#aab5c4",
    "600": "#8e9bad",
    "700": "#728093",
    "800": "#576476",
    "900": "#3e4959",
    "1000": "#28303c",
    // "1100": "#131921",
    // "1200": "#010203"
  }
}))()
display(main)
```

```js echo
Object.entries(main)
```

```js echo
(() => {
  const start = 1; // "100"
  const end = 10; // "1000"
  const keys = d3.range(start, end + 1).map((i) => `${i}00`);
  //const keys = d3.range(start, end + 1).map((i) => htl.html`${i}00`);
  return htl.html`
<div style=${{
    display: "grid",
    gridTemplateColumns: "repeat(4, max-content)",
    gridAutoFlow: "dense",
    gridGap: "0.25rem 0.5rem"
  }}>
  
  ${Object.entries(main).flatMap(
    ([hue, colors], i) => 
    {
    return keys
      .slice()
      .reverse()
      .map((k) => {
        const code = colors[k];
        return htl.html`<div style=${{ gridColumn: i + 1 }}>${
          code
            ? swatch(code, {
                label: `${hue}.${k}`
              })
            : ""
        }</div>`;
      });
  }
  )
  }
</div>
`;
})()
```

### Accent colors

Only reach for accent colors to highlight a data point over main colors.

```js echo
const accent = (() => ({
  blue: adbBrandMainColors["700"],
  red: adbBrandAccentColors["300"],
  green: adbBrandAccentColors["600"],
  grey: "#64748b" // TW Slate 500
}))();
display(accent)
```

```js echo
htl.html`
<div style=${{
  display: "grid",
  gridTemplateColumns: "repeat(4, max-content)",
  gridAutoFlow: "dense",
  gridGap: "0.25rem 0.5rem"
}}>  
  ${Object.entries(accent).map(
    ([name, code], i) =>
      htl.html`<div style=${{ gridColumn: i + 1}}>
${swatch(code, {
  label: name
//})}`
})}</div>`
  )}
</div>`
```

### Schemes
#### Categorical
##### `schemeBuGnReGr`

```js echo
const schemeBuGnReGr = (() => [
  main.blue["600"],
  main.green["600"],
  main.red["600"],
  main.grey["600"],
  
  main.blue["800"],
  main.green["800"],
  main.red["800"],
  main.grey["800"],
  
  main.blue["400"],
  main.green["400"], 
  // main.red["400"],
])()

display(schemeBuGnReGr)
```

```js echo
schemeHtml(schemeBuGnReGr)
```

##### `schemeBuReGnGr`

```js echo
const schemeBuReGnGr = (() => [
  main.blue["600"],
  main.red["600"],
  main.green["600"],
  main.grey["600"],
  
  main.blue["800"],
  main.red["800"],
  main.green["800"],
  main.grey["800"],
  
  main.blue["400"],
  // main.green["400"], 
  main.red["400"],
])();
display(schemeBuReGnGr)
```

```js
schemeHtml(schemeBuReGnGr)
```

##### `schemeBuGnReGrPaired` 

```js echo
const schemeBuGnReGrPaired = (() => [
  main.blue["600"],
  main.blue["400"],
  main.green["600"],
  main.green["400"],
  main.red["600"],
  main.red["400"],
  main.grey["600"],
  main.grey["400"],
  main.blue["800"],
  main.green["800"],
])();
display(schemeBuGnReGrPaired)
```

```js echo
schemeHtml(schemeBuGnReGrPaired)
```

##### `schemeContrasting`

```js echo
const schemeContrasting = (() => [
  main.blue["600"],
  main.blue["900"],
])();
display(schemeContrasting)
```

```js echo
schemeHtml(schemeContrasting)
```

##### `schemeContrastingAlt`

⚠️ Accessibility warning: not enough contrast between colors. Use sparingly in cases where you need to use mix-blend-modes.

```js echo
const schemeContrastingAlt = [main.blue["600"], main.red["600"]];
display(schemeContrastingAlt)
```

```js echo
schemeHtml(schemeContrastingAlt)
```

##### `schemeCategory10` <mark style="background: #89f3f5">Deprecated. Use <code>schemeBuGnReGr</code></mark>

```js echo
const schemeCategory10 = (() => {
  console.warn("schemeCategory10 is deprecated. Use schemeBuGnReGr");

  return schemeBuGnReGr;
})()
display(schemeCategory10)
```

##### `schemePaired` <mark style="background: #89f3f5">Deprecated. Use <code>schemeBuGnReGrPaired</code></mark>


```js echo
const schemePaired = (() => {
  console.warn("schemePaired is deprecated. Use schemeBuGnReGrPaired");
  return schemeBuGnReGrPaired
})();
display(schemePaired)
```

##### `schemeAltCategory10` <mark style="background: #89f3f5">Deprecated. Use <code>schemeBuReGnGr</code></mark>


```js echo
const schemeAltCategory10 = (() => {
  console.warn("schemeAltCategory10 is deprecated. Use schemeBuReGnGr");

  return schemeBuReGnGr;
})();
display(schemeAltCategory10)
```

#### Diverging


##### `schemeReGrBu[k] / interpolateReGrBu(t)`


```js echo
const interpolateReGrBu = d3.interpolateRgbBasis(
  schemeReGrBu[schemeReGrBu.length - 1]
)
```

```js echo
const schemeReGrBu = (() => [
  ...new Array(3),
  [main.red["500"], main.grey["200"], main.blue["500"]],
  [main.red["500"], main.red["400"], main.blue["400"], main.blue["500"]],
  ,
  [
    main.red["500"],
    main.red["400"],
    main.grey["200"],
    main.blue["400"],
    main.blue["500"]
  ],
  [
    main.red["600"],
    main.red["500"],
    main.red["400"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"]
  ],
  [
    main.red["600"],
    main.red["500"],
    main.red["400"],
    main.grey["200"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"]
  ],
  [
    main.red["700"],
    main.red["600"],
    main.red["500"],
    main.red["400"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["700"]
  ],
  [
    main.red["700"],
    main.red["600"],
    main.red["500"],
    main.red["400"],
    main.grey["200"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["700"]
  ],
  [
    main.red["800"],
    main.red["700"],
    main.red["600"],
    main.red["500"],
    main.red["400"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["700"],
    main.blue["800"]
  ],
  [
    main.red["800"],
    main.red["700"],
    main.red["600"],
    main.red["500"],
    main.red["400"],
    main.grey["200"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["700"],
    main.blue["800"]
  ]
])();
display(schemeReGrBu)
```

```js echo
schemeArrayHtml(schemeReGrBu, 'schemeReGrBu')
```

#### Sequential (Single Hue)
##### `schemeBlues[k] / interpolateBlues(t)`

```js echo
const schemeBlues = generateSchemes(main.blue)
```

```js echo
const interpolateBlues = d3.interpolateRgbBasis(schemeBlues[schemeBlues.length - 1])
```

```js echo
schemeArrayHtml(schemeBlues, 'schemeBlues')
```

##### `schemeReds[k]  / interpolateReds(t)`

```js echo
const schemeReds = generateSchemes(main.red)
```

```js echo
const interpolateReds = d3.interpolateRgbBasis(schemeReds[schemeReds.length - 1])
```

```js echo
schemeArrayHtml(schemeReds, 'schemeReds')
```

##### `schemeGreens[k] / interpolateGreens(t)`

```js echo
const schemeGreens = generateSchemes(main.green)
```

```js echo
const interpolateGreens = d3.interpolateRgbBasis(schemeGreens[schemeGreens.length - 1])
```

```js echo
schemeArrayHtml(schemeGreens, 'schemeGreens')
```

##### `schemeGreys[k] / interpolateGreys(t)`

```js echo
const schemeGreys = generateSchemes(main.grey)
```

```js echo
const interpolateGreys = d3.interpolateRgbBasis(schemeGreys[schemeGreys.length - 1])
```

```js echo
schemeArrayHtml(schemeGreys, 'schemeGreys')
```

#### Sequential (Multi-Hue)
##### `schemeGrBu[k] / interpolateGrBu(t)`

```js echo
const schemeGrBu = (() => [
  ...new Array(3),
  [main.grey["200"], main.blue["500"], main.blue["800"]],
  [main.grey["200"], main.blue["400"], main.blue["700"], main.blue["900"]],
  [
    main.grey["200"],
    main.grey["300"],
    main.blue["400"],
    main.blue["700"],
    main.blue["900"]
  ],
  [
    main.grey["200"],
    main.grey["300"],
    main.blue["400"],
    main.blue["600"],
    main.blue["800"],
    main.blue["900"]
  ],
  [
    main.grey["200"],
    main.grey["300"],
    main.grey["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["800"],
    main.blue["900"]
  ],
  [
    main.grey["200"],
    main.grey["300"],
    main.grey["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["700"],
    main.blue["800"],
    main.blue["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.blue["400"],
    main.blue["500"],
    main.blue["600"],
    main.blue["700"],
    main.blue["800"],
    main.blue["900"]
  ]
])();
display(schemeGrBu)
```

```js echo
schemeGrBu
```

```js echo
const interpolateGrBu = d3.interpolateRgbBasis(schemeGrBu[8])
```

```js echo
schemeArrayHtml(schemeGrBu, 'schemeGrBu')
```

##### `schemeGrRe[k] / interpolateGrRe(t)`

```js echo
const schemeGrRe = (() => [
  ...new Array(3),
  [main.grey["200"], main.red["500"], main.red["800"]],
  [main.grey["200"], main.red["400"], main.red["700"], main.red["900"]],
  [
    main.grey["200"],
    main.grey["300"],
    main.red["400"],
    main.red["700"],
    main.red["900"]
  ],
  [
    main.grey["200"],
    main.grey["300"],
    main.red["400"],
    main.red["600"],
    main.red["800"],
    main.red["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.red["500"],
    main.red["600"],
    main.red["800"],
    main.red["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.red["500"],
    main.red["600"],
    main.red["700"],
    main.red["800"],
    main.red["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.red["400"],
    main.red["500"],
    main.red["600"],
    main.red["700"],
    main.red["800"],
    main.red["900"]
  ]
])();
display(schemeGrRe)
```

```js echo
const interpolateGrRe = d3.interpolateRgbBasis(schemeGrRe[8]);
display(interpolateGrRe)
```

```js echo
schemeArrayHtml(schemeGrRe, 'schemeGrRe')
```

##### `schemeGrGn[k] / interpolateGrGn(t)`

```js echo
const schemeGrGn = (() => [
  ...new Array(3),
  [main.grey["200"], main.green["500"], main.green["800"]],
  [main.grey["200"], main.green["400"], main.green["700"], main.green["900"]],
  [
    main.grey["200"],
    main.grey["300"],
    main.green["400"],
    main.green["700"],
    main.green["900"]
  ],
  [
    main.grey["200"],
    main.grey["300"],
    main.green["400"],
    main.green["600"],
    main.green["800"],
    main.green["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.green["500"],
    main.green["600"],
    main.green["800"],
    main.green["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.green["500"],
    main.green["600"],
    main.green["700"],
    main.green["800"],
    main.green["900"]
  ],
  [
    main.grey["100"],
    main.grey["200"],
    main.grey["300"],
    main.green["400"],
    main.green["500"],
    main.green["600"],
    main.green["700"],
    main.green["800"],
    main.green["900"]
  ]
])();
display(schemeGrGn)
```

```js echo
const interpolateGrGn = d3.interpolateRgbBasis(schemeGrGn[8]);
display(interpolateGrGn)
```

```js echo
schemeArrayHtml(schemeGrGn, 'schemeGrGn')
```

### Reference colors

The colors are made based on these colors from [ADB branding toolkit](https://observablehq.com/@adb/brand).

```js echo
htl.html`<div style=${{ display: "flex", gap: "1rem" }}>
  ${Object.entries(refColors).map(([k, v]) => swatch(v, { label: k }))}
</div>`
```

A suitable grey is picked.

```js echo
htl.html`
<div style=${{ display: "flex", gap: "1rem" }}>${swatch("#64748b", {
  label: "TW Slate 500"
})}</div>`
```

```js echo
const refColors = (() => ({
  "main 700": adbBrandMainColors["700"],
  "accent 600": adbBrandAccentColors["600"],
  "accent 300": adbBrandAccentColors["300"]
}))();
display(refColors)
```

## Typography


### Font Family

The font stack is ‘SF Pro, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif.’

```js echo
// From adb.org
const fontFamily = `-apple-system,BlinkMacSystemFont,segoe ui,Roboto,helvetica neue,Arial,sans-serif,apple c emoji,segoe ui emoji,segoe ui symbol`;
display(fontFamily)
```

---

## Helpers

```js echo
//function swatch(color, { label = color, width = '90px', element = 'div' } = {}) {
//  return html`<${element} style="width: ${width}; padding-bottom: 0.5rem;">
//  <div style="flex: 1; background-color: ${color}; aspect-ratio: 4 / 3; border-radius: 0.25rem"></div>
//  <p style="margin: 0"><code style="">${label}</code></p>
//  ${color !== label ? html`<p style="margin: -0.25rem 0 0;"><code style="font-size: 0.75em; color: rgb(110, 110, 110);">${color}</code></p>`: ""}
//</${element}>`;
//};
function swatch(color, { label = color, width = '90px', element = 'div' } = {}) {
  const root = document.createElement(element);
  root.style.width = width;
  root.style.paddingBottom = '0.5rem';

  const box = htl.html`<div style=${{
    flex: 1,
    backgroundColor: color,
    aspectRatio: '4 / 3',
    borderRadius: '0.25rem'
  }}></div>`;

  const main = htl.html`<p style="margin: 0"><code>${label}</code></p>`;
  const sub  = color !== label
    ? htl.html`<p style=${{ margin: '-0.25rem 0 0' }}>
        <code style=${{ fontSize: '0.75em', color: 'rgb(110, 110, 110)' }}>${color}</code>
      </p>`
    : null;

  root.append(box, main);
  if (sub) root.append(sub);
  return root;
}
display(swatch)
```

```js echo
swatch("#0099D8")
```

```js echo
swatch("#0099D8", {label: "main 700"})
```

```js echo
function generateSchemes(colorObj) {
  return [
    ...new Array(3),
    [colorObj["400"], colorObj["700"], colorObj["900"]],
    [colorObj["400"], colorObj["600"], colorObj["800"], colorObj["900"]],
    [
      colorObj["400"],
      colorObj["500"],
      colorObj["700"],
      colorObj["800"],
      colorObj["900"]
    ],
    [
      colorObj["400"],
      colorObj["500"],
      colorObj["600"],
      colorObj["700"],
      colorObj["800"],
      colorObj["900"]
    ]
  ];
};
display(generateSchemes)
```

```js echo
const schemeArrayHtml = (arr, variableName) =>
  htl.html`${arr.map((o, i) =>
    o !== undefined
      ? htl.html`<h6><code>${variableName}[${i}]</code></h6>${schemeHtml(o)}`
      : ""
  )}`;
  display(schemeArrayHtml)
```

```js echo
const schemeHtml = (arr) => {
  if (arr === undefined) return;

  return htl.html`<div style=${{ display: "flex", gap: "0.125rem" }}>${arr.map(
    swatch
  )}</div>`
};
display(schemeHtml)
```

```js echo
const interpolateColorFn = (fn, n = 50) => d3.range(n).map(i => d3.rgb(fn(i / (n - 1))).hex());
display(interpolateColorFn)
```

### All colors

```
${allColorCodes.map(x => `${x}\n`)}
```

```js echo
const allColorCodes = [main, accent].flatMap(getStringsFromObject);
display(allColorCodes)
```

```js
function getStringsFromObject (x) {
  if (typeof x === 'string') return x;

  if (typeof x === 'object') {
    return Object.entries(x).flatMap(([k, v]) => getStringsFromObject(v))
  }
};
display(getStringsFromObject)
```

```js echo
htl.html`<style>
  h5 > code {
    font-weight: bold;
  }
</style>`
```

## Imports

```js echo
//import {mainColors as adbBrandMainColors, accentColors as adbBrandAccentColors} from "@adb/brand"
import {mainColors as adbBrandMainColors, accentColors as adbBrandAccentColors} from "/components/brand.js"
display(adbBrandMainColors)
display(adbBrandAccentColors)
```

```js echo
//import {toc} from "@saneef/indented-toc"
import {toc} from "/components/indented-toc.js";
display(toc)
```

## Credits and references

- Main colors are generated using [colorcolor.in](${ccUrls[0]})
- [A detailed guide to colors in data vis style guides - Datawrapper Blog](https://blog.datawrapper.de/colors-for-data-vis-style-guides/)

```js echo
const ccUrls = [
  /*
   * Keep latest first
   */
  // 2022-07-18: Tweaks hues of main colors, and rate of red
  "https://colorcolor.in/?s=eJyNksFSwjAQht8lve50krZpE46Cjl6U0aPjYYUUGEvbSVLBYXh3U2hLFZTeNpv99_-y2R0pMVPWqilqXBsy2hFjVekCFkB795DP1ZaMXMJs0M6WzTkGssbtY7V-SqfHQnNIlk2r1x1ZVurYErV1DcLYTzgQlc97BzSuhviMAQWfAyV754O2p4uiRiPYqZ4DA19IYASIRutyLKROmq0WPamUjZRfUu738JuRBdJvEdv4OmEoTw-TVyDZOaToLCM_GEoa8k7VhAMmyTqNvOjTYTJxhskobbTJQMSA9z-cJwMp69U7fsCP-V-ijP6hDP6c5Vtt6RZ2lS8OK198Kp3h17jIrUbjmqSYGQVt_r7edqsrl9EqHRdZoc0zblxX71byMLgBT0zGcXgHHqVSTgR4cZRE4t2BzurqlxJnNUTxsTSZ8_8GJWf4Ow",
  // 2022-07-18: Increased saturation to match ADB brand colors
  "https://colorcolor.in/?s=eJyNkk1PwzAMhv9LerWifDRtsyMdCC4wwRFxCFv2Ibp2SjI2NO2_49J2m2BsvTm2X_vJK-_IyhQ2BDsyziw9GeyID3aFARfQ1R7Kid2SASb8xoTxvH1LIEuzfVwvn6ajphFlSa1qRr3uyHxtm5HGBRwgFRBbTjBSDCPjsUoo58CAKmBkjxtMOFHEcSvI-LFfAQeaaeAEiDMBc1wylBaL2YlU61aqzin3e_hNx0WnaKLrdFLTtPuRvgLI_wJmtBPHVPSlPFgoVT8H-WGLPrvjkoecsVabNj_tQyhUcrRFqJT2A63vrXFf08ugPL4AKv618q1eiVe6KGc_d159WleYr7wqgzMeh0xN4S10-fv6xINbY8bZaV4VlfPPZoNTo1utpLiBKBvmibyDiDGthxlESZzG2TuCjuvul5UZ1xDVx9wXuP8btYL2Bw",
  // 2022-07-07: Made the darker shades lighter
  "https://colorcolor.in/?s=eJyVkk9vwjAMxb9LerWiJG1KwnGwabtsaDtOO3gQ_milRUkYTIjvPnelgCbG4OY6fu_9annDFli4GN0APc4D625YiG5BhVTQvj2UI7dmXQEsrDAOp7tvA2yO68fl_Gk8aAZJlteqxup1w6ZL11iij6yrUg3MlSOqNJk5DPTKuJQggGsQbEsJGI8UWbYTGHmY1yCBGwuSAfMYqSeFIGkxmxxJrd1J9Snldgu_6aRqFU31P11qeaf9I3s9oOGtOOPqUsr9ClN92QblPsWezDiHSL3rCZXOD2tRusMvA63vrdm-5edBZXYGVP0J-lZH0pXOysnPnVefzhf41avK6DGQyRiL4KDt39cnHv2SOt6Ne1VR-fCMK3JNbq1O1Q0kpt_L0ztIhLC2byDJs05m3gl0WE-_LHBYQ1Qf01BQ_jegyvX4",
  // 2022-07-07: Tweaked hues
  "https://colorcolor.in/?s=eJyNk01TgzAQhv9LuO4w-SBAerSV0Yt29Oh4iDT9GCl0ktTW6fS_u0gp1drKjWzy7PuwhB1Z6cJ4b8ba6qUjgx1x3qzwQUG7dV9OzJYMKBC30T6fH9YSyFJvH9bLx-m4OYhUXFNNp5cdma9N01FbTwZc8BAhU07qZxXyeqEdHiEhY0ABdynZY4z2J1jEw6TFUtYhEhiEqQJGgFjtscaoRLpYzE5opdrEuGlzRu_38NuU8fhAMcH6euIbHT3VP5703DPtZpP8iLxqKjpMiLDnQNmRUX_mXPPEWptH-2vyKO6Gw2XSd6acn2IXPuBRl0VXdHkaXrB9rWPx_i7K2fcPUH0YW-jPYVV6qx02merCGWjrd_Xl93aNFWumw6qorHvSG-wa3Cop-A0E6WgYiwwCSpUapRDEURKlbxBkLJOZgkCIiEmJ4nlNP690XktV73NXoM8Xe8P-MQ",
  // Reduced saturation of greens and reds
  "https://colorcolor.in/?s=eJyVkk9PwzAMxb9LerWiJG3aZkc2EFxggiPiYLbsj-jaKcnY0NTvjkvpNk3TKDfH8fP76cl7tsbChmDH6HDl2WDPfLBrKgx0Xw_l1O7YIAbmtxgmi-N7hbvHzeppNm4HSZU2qnbT654tNrbdiC6wgYo1MFtOqdKCKvT0y7iUIIBrEKwmBwwniiT5FeTyOK9BAs8NSAbMYaCeFIKkxXJ-IjWm80p5pi-p6xrOCaXqVG31N2Fs2u2NxvwfMueHSDKu-mIecox1vxjlwcZc9LjGSL3OTfRHVDo9BqN0xvuRStXlb_h1UplcIVX5ZXVdvzWWdKvLcv5z7NWndQV-DasyOPS0ZIaFt9D175tDD25DHWdnw6qonH_GLW2Nbo2O1Q1E-WiYxncQCWHMKIcoTbIkfyfQSTP9ssZJA1F9LHxB_t_NqPcD",
  // First draft
  "https://colorcolor.in/?s=eJylkt9PwjAQx_-X7vXStN26rTwKGn1Roo_GhxPKjzg20hbBkP3v3hgDYohgfLu197nvZ81t2RILG4IdosOFZ70t88EuqTDQXT2UY7thvRiYX2MYzfbfGtgCN4-rxdNk2DYSlTZUO-l1y2Yr205EF1hPxYTYckyVFlShp1vGpQQBXINgNSVgOCGSZA_k8tivQQLPDUgGzGGgMykEocV8eoIa02WlPNPn6LqGn4ZSdVRbXTbUup2-Y4T4s2XGD2-ScXWt5-EhY32dZfIvyxbZ5YnrJZVOj6lKt3962VWqTtTws1EHU5n8Yqry83RdvzWRtK7zcrrb9-rTugK_-lUZHHoaMsHCW-jO75tdD25FJ85O-lVROf-Ma5oa3RodqxuI8kE_je8gEsKYQQ5RmmRJ_k6io6b7ZYmjRqL6mPmC8r8BJeT3hw"
];
display(ccUrls)
```

```js
// To apply base styles when the notebook is downloaded/exported
//substratum({invalidation})
```

```js
//import {substratum} from "@adb/substratum"
```
