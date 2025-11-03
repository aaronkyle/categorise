//# Style Guide for Data Visualizations

//## Imports

import * as d3 from "npm:d3";
import * as htl from "htl";
//import {mainColors as adbBrandMainColors, accentColors as adbBrandAccentColors} from "@adb/brand"
import {mainColors as adbBrandMainColors, accentColors as adbBrandAccentColors} from "/components/brand.js"

//## Credits and references

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


//## Colors
//### Main colors

export const main = (() => ({
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



//### Accent colors

const accent = (() => ({
  blue: adbBrandMainColors["700"],
  red: adbBrandAccentColors["300"],
  green: adbBrandAccentColors["600"],
  grey: "#64748b" // TW Slate 500
}))();



//## Typography


//### Font Family



// From adb.org
const fontFamily = `-apple-system,BlinkMacSystemFont,segoe ui,Roboto,helvetica neue,Arial,sans-serif,apple c emoji,segoe ui emoji,segoe ui symbol`;


//## Helpers


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


//### Schemes
//#### Categorical
//##### `schemeBuGnReGr`

export const schemeBuGnReGr = (() => [
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



//##### `schemeBuReGnGr`

export const schemeBuReGnGr = (() => [
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



//##### `schemeBuGnReGrPaired` 

export const schemeBuGnReGrPaired = (() => [
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



//##### `schemeContrasting`

export const schemeContrasting = (() => [
  main.blue["600"],
  main.blue["900"],
])();



//##### `schemeContrastingAlt`
//⚠️ Accessibility warning: not enough contrast between colors. Use sparingly in cases where you need to use mix-blend-modes.

export const schemeContrastingAlt = [main.blue["600"], main.red["600"]];



//##### `schemeCategory10` 

export const schemeCategory10 = (() => {
  console.warn("schemeCategory10 is deprecated. Use schemeBuGnReGr");

  return schemeBuGnReGr;
})()



//##### `schemePaired` 

export const schemePaired = (() => {
  console.warn("schemePaired is deprecated. Use schemeBuGnReGrPaired");
  return schemeBuGnReGrPaired
})();


//##### `schemeAltCategory10` 

export const schemeAltCategory10 = (() => {
  console.warn("schemeAltCategory10 is deprecated. Use schemeBuReGnGr");

  return schemeBuReGnGr;
})();


//#### Diverging


//##### `schemeReGrBu[k] / interpolateReGrBu(t)`


export const schemeReGrBu = (() => [
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



export const interpolateReGrBu = d3.interpolateRgbBasis(
  schemeReGrBu[schemeReGrBu.length - 1]
)


//#### Sequential (Single Hue)
//##### `schemeBlues[k] / interpolateBlues(t)`

export const schemeBlues = generateSchemes(main.blue)

export const interpolateBlues = d3.interpolateRgbBasis(schemeBlues[schemeBlues.length - 1])



//##### `schemeReds[k]  / interpolateReds(t)`

export const schemeReds = generateSchemes(main.red)

export const interpolateReds = d3.interpolateRgbBasis(schemeReds[schemeReds.length - 1])



//##### `schemeGreens[k] / interpolateGreens(t)`

export const schemeGreens = generateSchemes(main.green)

export const interpolateGreens = d3.interpolateRgbBasis(schemeGreens[schemeGreens.length - 1])


//##### `schemeGreys[k] / interpolateGreys(t)`


export const schemeGreys = generateSchemes(main.grey)

export const interpolateGreys = d3.interpolateRgbBasis(schemeGreys[schemeGreys.length - 1])


//#### Sequential (Multi-Hue)
//##### `schemeGrBu[k] / interpolateGrBu(t)`

export const schemeGrBu = (() => [
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



export const interpolateGrBu = d3.interpolateRgbBasis(schemeGrBu[8])

//##### `schemeGrRe[k] / interpolateGrRe(t)`


export const schemeGrRe = (() => [
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


export const interpolateGrRe = d3.interpolateRgbBasis(schemeGrRe[8]);


//##### `schemeGrGn[k] / interpolateGrGn(t)`

export const schemeGrGn = (() => [
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


export const interpolateGrGn = d3.interpolateRgbBasis(schemeGrGn[8]);


//### Reference colors

export const refColors = (() => ({
  "main 700": adbBrandMainColors["700"],
  "accent 600": adbBrandAccentColors["600"],
  "accent 300": adbBrandAccentColors["300"]
}))();





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


const schemeHtml = (arr) => {
  if (arr === undefined) return;

  return htl.html`<div style=${{ display: "flex", gap: "0.125rem" }}>${arr.map(
    swatch
  )}</div>`
};

const schemeArrayHtml = (arr, variableName) =>
  htl.html`${arr.map((o, i) =>
    o !== undefined
      ? htl.html`<h6><code>${variableName}[${i}]</code></h6>${schemeHtml(o)}`
      : ""
  )}`;




const interpolateColorFn = (fn, n = 50) => d3.range(n).map(i => d3.rgb(fn(i / (n - 1))).hex());


//### All colors

const allColorCodes = [main, accent].flatMap(getStringsFromObject);

function getStringsFromObject (x) {
  if (typeof x === 'string') return x;

  if (typeof x === 'object') {
    return Object.entries(x).flatMap(([k, v]) => getStringsFromObject(v))
  }
};

