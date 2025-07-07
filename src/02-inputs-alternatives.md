# 02. Inputs (Alternatives)
<!--
Jeremy Ashkenas
https://observablehq.com/@jashkenas/inputs
-->

<!--
MIGRATION GUIDE: https://observablehq.com/@observablehq/legacy-inputs
-->

<!--
<div style="margin-top: -3px; font-size: 1.05em;">*a.k.a “The Grand Native Inputs Bazaar”*</div>

<div style="max-width: 500px; margin: 30px 0; padding: 15px 30px; background-color: #ffffee; font: 700 18px/24px sans-serif;">✨ Rejoice! Observable now has <a href="https://observablehq.com/@observablehq/inputs">an official inputs library</a>. If it contains the input you need, you should probably be using that instead of this notebook. ✨</div>


A collection of assorted fancy inputs, odds and ends — with which to produce values to feed your burgeoning sketches. All inputs support optional **titles** and **descriptions**; where it makes sense, inputs also support a **submit** option, which allows you to prevent the value from updating until the input has been finalized.

Wares we have on offer: 
  * [\`slider\`](#sliderDemo)
  * [\`button\`](#buttonDemo)
  * [\`select\`](#selectDemo)
  * [\`autoSelect\`](#autoSelectDemo)
  * [\`color\`](#colorDemo)
  * [\`coordinates\`](#coordinatesDemo)
  * [\`worldMapCoordinates\`](#worldMapCoordinatesDemo)
  * [\`usaMapCoordinates\`](#usaMapCoordinatesDemo)
  * [\`date\`](#dateDemo)
  * [\`time\`](#timeDemo)
  * [\`file\`](#fileDemo)
  * [\`text\`](#textDemo)
  * [\`textarea\`](#textareaDemo)
  * [\`radio\`](#radioDemo)
  * [\`checkbox\`](#checkboxDemo)
  * [\`number\`](#numberDemo)
  * [\`password\`](#passwordDemo)`


| <h3>Friends & Family:</h3>  |   |
|---|---|
| **[@mbostock/form-input](/@mbostock/form-input)**  | Fully custom forms, combining inputs into a single reactive cell. |
| **[@mbostock/scrubber](/@mbostock/scrubber)** | A slider that automatically plays through its range, useful for driving and scrubbing through animations. |
| **[@bumbeishvili/input-groups](/@bumbeishvili/input-groups)** | A wrapper function that can put many of these inputs into a more compact grid layout. | 
| **[@zechasault/color-schemes-and-interpolators-picker](/@zechasault/color-schemes-and-interpolators-picker)**  | Color scheme and interpolation pickers. |
| **[@awhitty/fips-county-code-brush](/@awhitty/fips-county-code-brush)**  | A brushable map of the United States, allowing you to quickly select sets of counties to get their FIPS codes. |
| **[@mootari/range-slider](https://observablehq.com/@mootari/range-slider)**  |  True range sliders, setting both a minimum and maximum value. |
| **[@bumbeishvili/data-driven-range-sliders](/@bumbeishvili/data-driven-range-sliders)** | Data-driven range sliders, displaying a distribution histogram of the underlying data. |
| **[@trebor/snapping-histogram-slider](/@trebor/snapping-histogram-slider)** | Another data-driven range slider option. |
| **[@mootari’s 2D Slider](https://observablehq.com/d/98bbb19bf9e859ee)** | Two dimensional sliders, exploring discrete points on a plane. |
| **[@yurivish/ternary-slider](/@yurivish/ternary-slider)** | Nifty ternary plot inputs, describing the percentages of a whole composed of exactly three things. |
| **[@rreusser/binary-input](/@rreusser/binary-input)** | Input numbers in binary, great for working with values where results vary with specific bit positions. |
| **[@bartok32/diy-inputs](/@bartok32/diy-inputs)** | A fun tool for defining your own fancy and colorful inputs. |
| **[@bobkerns/elements-input](/@bobkerns/elements-input)** | A periodic table of the elements input! You can construct molecules programmatically, or click on the table to create formulas. |
| **[@fil/selectflat](/@fil/selectflat)** | A fast selector to explore a discrete parameter space. The value changes on mouseover, and sticks when you click. |
| **[@oscar6echo/player](/@oscar6echo/player)** | A slider with buttons to play, pause, step, and change speed and direction — useful for animations. |
| **[@harrislapiroff/list-input](/@harrislapiroff/list-input)** | A input for when you want more than one of something. |
| **[@nhogs/easing-graphs-editor](/@nhogs/easing-graphs-editor)** | A curve input to display and edit values of animated properties over time, such as easing curves and animation curves. |
| **[@j-f1/checkbox](/@j-f1/checkbox)** | A simple checkbox input that provides a boolean value. |

<br>*If you have any improvements for the bazaar, [please make your change in a fork and send it to me as a suggestion.](https://observablehq.com/@observablehq/suggestions-and-comments)*`

-->

```js
//see: https://github.com/observablehq/framework/discussions/2003
//removing this reveals unconverted alternatives
import {html} from "npm:@observablehq/stdlib@5/src/html";
```


```js
//https://observablehq.observablehq.cloud/pangea/party/markdown-it
import markdownit from "markdown-it";
import matter from "npm:gray-matter";
```

```js echo
const Markdown = new markdownit({html: true});

function md(strings, ...values) {
  const raw = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
  const template = document.createElement("template");
  template.innerHTML = Markdown.render(raw);
  return template.content.cloneNode(true);
}
```


```js echo
const sliderDemo = md`---
## Sliders

~~~js
import {slider} from "@jashkenas/inputs"
~~~`
```

```js echo
const a = view(slider())
```

```js echo
const a1 = view(slider({
  min: 0, 
  max: 1, 
  step: 0.01, 
  format: ".0%",
  description: "Zero to one, formatted as a percentage"
}))
```

```js echo
const a1_1 = view(slider({
  min: 0, 
  max: 1, 
  step: 0.01, 
  format: v => `${Math.round(100 * v)} per cent`,
  description: "Zero to one, formatted with a custom function"
}))
```

```js echo
const a2 = view(slider({
  min: 0,
  max: 1e9,
  step: 1000,
  value: 3250000,
  format: ",",
  description:
    "Zero to one billion, in steps of one thousand, formatted as a (US) number"
}))
```

```js echo
const a3 = view(slider({
  min: 0, 
  max: 100, 
  step: 1, 
  value: 10, 
  title: "Integers", 
  description: "Integers from zero through 100"
}))
```

```js echo
const a4 = view(slider({
  min: 0.9,
  max: 1.1,
  precision: 3,
  description: "A high precision slider example"
}))
```

```js echo
const a5 = view(slider({
  min: 0.9,
  max: 1.1,
  precision: 3,
  submit: true,
  description: "The same as a4, but only changes value on submit"
}))
```

More [fancy slider techniques](https://observablehq.com/@mootari/prime-numbers-slider)


```js echo
function slider(config = {}) {
  let {
    min = 0,
    max = 1,
    value = (max + min) / 2,
    step = "any",
    precision = 2,
    title,
    description,
    disabled,
    getValue,
    format,
    display,
    submit
  } = typeof config === "number" ? { value: config } : config;
  precision = Math.pow(10, precision);
  if (!getValue)
    getValue = input => Math.round(input.valueAsNumber * precision) / precision;
  return input({
    type: "range",
    title,
    description,
    submit,
    format,
    display,
    attributes: { min, max, step, disabled, value },
    getValue
  });
}
```

```js echo
const buttonDemo = md`---
## Buttons

~~~js
import {button} from "@jashkenas/inputs"
~~~`
```

```js echo
const b = view(button())
```

```js echo
(() => {
  b;
  return !this;
})()
```

```js echo
const b1 = view(button({value: "Click me", description: "We use a reference to the button below to record the time you pressed it."}))
```

```js echo
(() => {
{
  b1;
  return new Date(Date.now()).toUTCString()
}
})()
```

```js echo
function button(config = {}) {
  const {
    value = "Ok", title, description, disabled
  } = typeof config === "string" ? {value: config} : config;
  const form = input({
    type: "button", title, description,
    attributes: {disabled, value}
  });
  form.output.remove();
  return form;
}
```

```js echo
const selectDemo = md`---
## Dropdown Menus and Multiselects

~~~js
import {select} from "@jashkenas/inputs"
~~~`
```

```js echo
// invalidbinding
const dd = view(select(["Spring", "Summer", "Fall", "Winter"]));

```

```js echo
dd
```

```js echo
const dd1 = view(select({
  title: "Stooges",
  description: "Please pick your favorite stooge.",
  options: ["Curly", "Larry", "Moe", "Shemp"],
  value: "Moe"
}))
```

```js
dd1
```

```js echo
const dd2 = view(select({
  description: "As a child, which vegetables did you refuse to eat?",
  options: ["Spinach", "Broccoli", "Brussels Sprouts", "Cauliflower", "Kale", "Turnips", "Green Beans", "Asparagus"],
  multiple: true
}))
```

```js echo
dd2
```

```js echo
const dd3raw = select({
  title: "How are you feeling today?",
  options: [
    { label: "🤷", value: "shrug" },
    { label: "😂", value: "tears-of-joy" },
    { label: "😍", value: "loving-it" },
    { label: "🤔", value: "hmmm" },
    { label: "😱", value: "yikes", disabled: true },
    { label: "😈", value: "mischievous" },
    { label: "💩", value: "poo" }
  ],
  value: "hmmm"
});

dd3raw.input.style.fontSize = "30px";
dd3raw.input.style.marginTop = "8px";
```

```js
const dd3 = view(dd3raw);
```



```js echo
dd3
```

```js echo
function select(config = {}) {
  const {
    value,
    title,
    description,
    disabled,
    multiple,
    size,
    options = []
  } = Array.isArray(config) ? { options: config } : config;

  const opts = options.map(o => typeof o === "object" ? o : { value: o, label: o });

  const el = document.createElement("select");
  if (disabled) el.disabled = true;
  if (multiple) {
    el.multiple = true;
    el.size = size || opts.length;
  }

  for (const o of opts) {
    const opt = new Option(o.label, o.value, false, Array.isArray(value) ? value.includes(o.value) : value === o.value);
    if (o.disabled) opt.disabled = true;
    el.append(opt);
  }

  const container = document.createElement("div");

  if (title) {
    const lbl = document.createElement("div");
    lbl.textContent = title;
    lbl.style.fontWeight = "bold";
    container.append(lbl);
  }

  container.append(el);

  if (description) {
    const desc = document.createElement("div");
    desc.textContent = description;
    desc.style.fontStyle = "italic";
    container.append(desc);
  }

  const updateValue = () => {
    container.value = multiple
      ? Array.from(el.selectedOptions).map(o => o.value)
      : el.value;
    container.dispatchEvent(new CustomEvent("input"));
  };

  el.addEventListener("input", updateValue);
  updateValue();

  Object.defineProperty(container, "input", {
    get: () => el
  });

  return container;
}



```

```js echo
const autoSelectDemo = md`---
## Autoselects
*A variant of an option menu, using an autocompleting text input, via HTML’s datalist element.* 

~~~js
import {autoSelect} from "@jashkenas/inputs"
~~~`
```

```js echo
const as = view(autoSelect({
  options: usa.objects.states.geometries.map(d => d.properties.name),
  placeholder: "Search for a US state . . ."
}))
```

```js echo
as
```

```js echo
function autoSelect(config = {}) {
  const {
    value,
    title,
    description,
    disabled,
    autocomplete = "off",
    placeholder,
    size,
    options,
    list = "options"
  } = Array.isArray(config) ? { options: config } : config;

  const optionsSet = new Set(options);

  const datalistId = `datalist-${Math.random().toString(36).slice(2)}`;

  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.autocomplete = autocomplete;
  inputEl.placeholder = placeholder || "";
  inputEl.setAttribute("list", datalistId);
  if (disabled) inputEl.disabled = true;

  const datalist = document.createElement("datalist");
  datalist.id = datalistId;
  for (const opt of options) {
    const option = document.createElement("option");
    option.value = opt;
    datalist.appendChild(option);
  }

  const form = document.createElement("form");
  form.appendChild(inputEl);
  form.appendChild(datalist);

  if (title) {
    const label = document.createElement("div");
    label.style.fontWeight = "bold";
    label.textContent = title;
    form.prepend(label);
  }

  if (description) {
    const desc = document.createElement("div");
    desc.style.fontStyle = "italic";
    desc.textContent = description;
    form.appendChild(desc);
  }

  inputEl.value = value || "";
  form.input = inputEl;
  form.value = inputEl.value;

  inputEl.addEventListener("input", (e) => {
    e.stopPropagation();
    form.value = inputEl.value;
    if (!form.value || optionsSet.has(form.value)) {
      form.dispatchEvent(new CustomEvent("input"));
    }
  });

  return form;
}

```

```js echo
const colorDemo = md`---
## Color Pickers

*value: a hexadecimal string, e.g. * \`"#bada55"\` 

~~~js
import {color} from "@jashkenas/inputs"
~~~`
```

```js echo
const c = view(color())
```

```js echo
const c1 = view(color({
  value: "#0000ff",
  title: "Background Color",
  description: "This color picker starts out blue"
}))
```

```js 
function color(config = {}) {
  const { value = "#000000", title, description, disabled, submit, display } =
    typeof config === "string" ? { value: config } : config;
  const form = input({
    type: "color",
    title,
    description,
    submit,
    display,
    attributes: { disabled, value }
  });
  // The following two lines are a bugfix for Safari, which hopefully can be removed in the future.
  form.input.value = '';
  form.input.value = value;
  if (title || description) form.input.style.margin = "5px 0";
  return form;
}
```

```js echo
const coordinatesDemo = md` ---
## Coordinates

*value: an array pair of \`[longitude, latitude]\`, e.g. * \`[-122.27, 37.87]\` 

~~~js
import {coordinates} from "@jashkenas/inputs"
~~~`
```

```js echo
const coords1 = view(coordinates())
```

```js echo
coords1
```

```js echo
const coords2 = view(coordinates({
  title: "Hometown",
  description: "Enter the coordinates of where you were born",
  value: [-122.27, 37.87],
  submit: true
}))
```

```js echo
coords2
```

```js echo
function coordinates(config = {}) {
  const { value = [], title, description, submit } = Array.isArray(config)
    ? { value: config }
    : config;

  let [lon = "", lat = ""] = value;

  const lonEl = document.createElement("input");
  lonEl.type = "number";
  lonEl.name = "lon";
  lonEl.min = -180;
  lonEl.max = 180;
  lonEl.step = "any";
  lonEl.value = lon;
  lonEl.style.width = "80px";

  const latEl = document.createElement("input");
  latEl.type = "number";
  latEl.name = "lat";
  latEl.min = -90;
  latEl.max = 90;
  latEl.step = "any";
  latEl.value = lat;
  latEl.style.width = "80px";

  const form = document.createElement("form");
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.gap = "10px";

  wrapper.appendChild(lonEl);
  wrapper.appendChild(latEl);
  form.appendChild(wrapper);

  if (title) {
    const label = document.createElement("div");
    label.style.fontWeight = "bold";
    label.textContent = title;
    form.prepend(label);
  }

  if (description) {
    const desc = document.createElement("div");
    desc.style.fontStyle = "italic";
    desc.textContent = description;
    form.appendChild(desc);
  }

  form.input = [lonEl, latEl];
  form.value = [
    lonEl.valueAsNumber || null,
    latEl.valueAsNumber || null
  ];

  const update = () => {
    const lonVal = lonEl.valueAsNumber;
    const latVal = latEl.valueAsNumber;
    form.value = [
      isNaN(lonVal) ? null : lonVal,
      isNaN(latVal) ? null : latVal
    ];
    form.dispatchEvent(new CustomEvent("input"));
  };

  lonEl.addEventListener("input", update);
  latEl.addEventListener("input", update);

  return form;
}
```



```js echo
//added/
//import {DOM} from "/components/DOM.js";

var count = 0;

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function () {
  return "url(" + this.href + ")";
};

function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
};

function svg(width, height) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", [0, 0, width, height]);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  return svg;
};


function context2d(width, height, dpi) {
  if (dpi == null) dpi = devicePixelRatio;
  var canvas = document.createElement("canvas");
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  canvas.style.width = width + "px";
  var context = canvas.getContext("2d");
  context.scale(dpi, dpi);
  return context;
};


function contextWebGL(width, height, dpi) {
  if (dpi == null) dpi = devicePixelRatio;
  var canvas = document.createElement("canvas");
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  canvas.style.width = width + "px";
  var context = canvas.getContext("webgl");
  if (!context) {
    console.error("WebGL not supported");
    return null;
  }
  return canvas;
};


const DOM = {
  uid,
  svg,
  context2d,
  contextWebGL
};


```


```js echo
const worldMapCoordinatesDemo = md` ---
## World Map Coordinates

*value: an array pair of \`[longitude, latitude]\`, e.g. * \`[-122.27, 37.87]\` 

~~~js
import {worldMapCoordinates} from "@jashkenas/inputs"
~~~`
```

```js echo
const worldMap1 = view(worldMapCoordinates([-122.27, 37.87]))
```

```js echo
worldMap1
```

```js echo
function worldMapCoordinates(config = {}) {
  const {
    value = [], title, description, width = 400
  } = Array.isArray(config) ? {value: config} : config;
  const height = Math.round((210 / 400) * width);
  let [lon, lat] = value;
  lon = lon != null ? lon : null;
  lat = lat != null ? lat : null;
  const formEl = html`<form style="width: ${width}px;"></form>`;
  const context = DOM.context2d(width, height);
  const canvas = context.canvas;
  canvas.style.margin = "10px 0 3px";
  const projection = d3geo
    .geoNaturalEarth1()
    .precision(0.1)
    .fitSize([width, height], { type: "Sphere" });
  const path = d3geo.geoPath(projection, context).pointRadius(2.5);
  formEl.append(canvas);

  function draw() {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.beginPath();
    path(graticule);
    context.lineWidth = 0.35;
    context.strokeStyle = `#ddd`;
    context.stroke();
    context.beginPath();
    path(land);
    context.fillStyle = `#f4f4f4`;
    context.fill();
    context.beginPath();
    path(countries);
    context.strokeStyle = `#aaa`;
    context.stroke();
    if (lon != null && lat != null) {
      const pointPath = { type: "MultiPoint", coordinates: [[lon, lat]] };
      context.beginPath();
      path(pointPath);
      context.fillStyle = `#f00`;
      context.fill();
    }
  }

  canvas.onclick = function(ev) {
    const { offsetX, offsetY } = ev;
    var coords = projection.invert([offsetX, offsetY]);
    lon = +coords[0].toFixed(2);
    lat = +coords[1].toFixed(2);
    draw();
    canvas.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  };

  draw();

  const form = input({
    type: "worldMapCoordinates",
    title,
    description,
    display: v =>
      html`<div style="width: ${width}px; white-space: nowrap; color: #444; text-align: center; font: 13px sans-serif; margin-bottom: 5px;">
            <span style="color: #777;">Longitude:</span> ${lon != null ? lon.toFixed(2) : ""}
            &nbsp; &nbsp; 
            <span style="color: #777;">Latitude:</span> ${lat != null ? lat.toFixed(2) : ""} 
          </div>`,
    getValue: () => [lon != null ? lon : null, lat != null ? lat : null],
    form: formEl
  });
  return form;
}
```

```js echo
const usaMapCoordinatesDemo = md` ---
## U.S.A. Map Coordinates

*value: an array pair of \`[longitude, latitude]\`, e.g. * \`[-122.27, 37.87]\` 

~~~js
import {usaMapCoordinates} from "@jashkenas/inputs"
~~~`
```

```js echo
const usaMap1 = view(usaMapCoordinates([-122.27, 37.87]))
```

```js echo
usaMap1
```

```js echo
const usaMap2 = view(usaMapCoordinates({
  title: "A Mini Map",
  description: "Defaults to New York City",
  width: 200,
  value: [-74, 40.71]
}))
```

```js echo
usaMap2
```

```js echo
function usaMapCoordinates(config = {}) {
  const {
    value = [], title, description, width = 400
  } = Array.isArray(config) ? {value: config} : config;
  const scale = width / 960;
  const height = scale * 600;
  let [lon, lat] = value;
  lon = lon != null ? lon : null;
  lat = lat != null ? lat : null;
  const formEl = html`<form style="width: ${width}px;"></form>`;
  const context = DOM.context2d(width, height);
  const canvas = context.canvas;
  canvas.style.margin = "5px 0 20px";
  const projection = d3geo
    .geoAlbersUsa()
    .scale(1280)
    .translate([480, 300]);
  const path = d3geo
    .geoPath()
    .context(context)
    .pointRadius(2.5 / scale);
  formEl.append(canvas);

  function draw() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(scale, scale);
    context.lineWidth = 0.35 / scale;
    context.beginPath();
    path(nation);
    context.fillStyle = `#f4f4f4`;
    context.fill();
    context.beginPath();
    path(states);
    context.strokeStyle = `#aaa`;
    context.stroke();
    if (lon != null && lat != null) {
      const pointPath = {
        type: "MultiPoint",
        coordinates: [projection([lon, lat])]
      };
      context.beginPath();
      path(pointPath);
      context.fillStyle = `#f00`;
      context.fill();
    }
    context.restore();
  }

  canvas.onclick = function(ev) {
    const { offsetX, offsetY } = ev;
    var coords = projection.invert([offsetX / scale, offsetY / scale]);
    lon = +coords[0].toFixed(2);
    lat = +coords[1].toFixed(2);
    draw();
    canvas.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  };

  draw();

  const form = input({
    type: "worldMapCoordinates",
    title,
    description,
    display: v =>
      html`<div style="position: absolute; width: ${width}px; white-space: nowrap; color: #444; text-align: center; font: 13px sans-serif; margin-top: -18px;">
            <span style="color: #777;">Longitude:</span> ${lon != null ? lon : ""}
            &nbsp; &nbsp; 
            <span style="color: #777;">Latitude:</span> ${lat != null ? lat : ""} 
          </div>`,
    getValue: () => [lon != null ? lon : null, lat != null ? lat : null],
    form: formEl
  });
  return form;
}
```

```js echo
const dateDemo = md` ---
## Dates

*value: a YYYY-MM-DD formatted string: * \`"2016-11-08"\` 

~~~js
import {date} from "@jashkenas/inputs"
~~~`
```

```js echo
const d = view(date())
```

```js echo
const d1 = view(date({
  title: "2017", 
  min: "2017-01-01",
  max: "2017-12-31",
  value: "2017-01-01",
  description: "Only dates within the 2017 calendar year are allowed"
}))
```

```js echo
function date(config = {}) {
  const { min, max, value, title, description, disabled, display } =
    typeof config === "string" ? { value: config } : config;
  return input({
    type: "date",
    title,
    description,
    display,
    attributes: { min, max, disabled, value }
  });
}
```

```js echo
const timeDemo = md` ---
## Times

*value: a HH:MM:SS formatted string: * \`"09:30:45"\`
<br>*(Time values are always in 24-hour format)*

~~~js
import {time} from "@jashkenas/inputs"
~~~`
```

```js echo
const t = view(time())
```

```js echo
t
```

```js echo
const t1 = view(time({
  title: "Afternoon",
  min: "12:00:00",
  max: "23:59:59",
  value: "13:00:00",
  step: 1,
  description: "Only times after noon are allowed, and seconds are included"
}))
```

```js
t1
```

```js echo
function time(config = {}) {
  const { min, max, step, value, title, description, disabled, display } =
    typeof config === "string" ? { value: config } : config;
  const el = input({
    type: "time",
    title,
    description,
    display,
    getValue: d => (d.value ? d.value : undefined),
    attributes: { min, max, step, disabled, value }
  });
  el.output.remove();
  return el;
}
```

```js echo
const fileDemo = md`---
## File Upload
*Use the JavaScript [File API](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications) to work with uploaded file contents.*

\`import {file} from "@jashkenas/inputs"\``
```

```js echo
const e = view(file())
```

```js echo
const e1 = view(file({
  title: "Photographs",
  description: "Only .jpg files are allowed in this example. Choose some images, and they’ll appear in the cell below.",
  accept: ".jpg",
  multiple: true,
}))
```


```js
//added
import { Files } from "@observablehq/stdlib";
```

```js echo
async () => {
  const div = html`<div>`;
  for (var j = 0; j < e1.length; j++) {
    let file = e1[j];
    let img = html`<img height="125px" style="margin: 2px;" />`;
    img.src = await Files.url(e1[j]);
    div.append(img);
  }
  return div;
}
```


```js echo
function file(config = {}) {
  const { multiple, accept, title, description, disabled } = config;
  const form = input({
    type: "file",
    title,
    description,
    attributes: { multiple, accept, disabled },
    action: form => {
      form.input.onchange = () => {
        form.value = multiple ? form.input.files : form.input.files[0];
        form.dispatchEvent(new CustomEvent("input"));
      };
    }
  });
  form.output.remove();
  form.input.onchange();
  return form;
}
```

```js echo
const textDemo = md`---
## Text Inputs

~~~js
import {text} from "@jashkenas/inputs"
~~~`
```

```js echo
const f = view(text())
```

```js echo
const f1 = view(text({title: "A Text Input", placeholder: "Placeholder text", description: "Note that text inputs don’t show output on the right"}))
```

```js
f1
```

```js echo
const f2 = view(text({placeholder: "Placeholder text", description: "This input only changes value on submit", submit: "Go"}))
```

```js
f2
```

```js echo
function text(config = {}) {
  const {
    value,
    title,
    description,
    disabled,
    autocomplete = "off",
    maxlength,
    minlength,
    pattern,
    placeholder,
    size,
    submit,
    getValue
  } = typeof config === "string" ? { value: config } : config;
  const form = input({
    type: "text",
    title,
    description,
    submit,
    getValue,
    attributes: {
      value,
      autocomplete,
      maxlength,
      minlength,
      pattern,
      placeholder,
      size,
      disabled
    }
  });
  form.output.remove();
  form.input.style.fontSize = "1em";
  return form;
}
```

```js echo
const textareaDemo = md`---
## Textareas

~~~js
import {textarea} from "@jashkenas/inputs"
~~~`
```

```js echo
const g = view(textarea())
```

```js echo
g
```

```js echo
const g1 = view(textarea({
  title: "Your Great American Novel", 
  placeholder: "Insert story here...", 
  spellcheck: true,
  width: "100%",
  rows: 10,
  submit: "Publish"
}))
```

```js echo
g1
```

```js echo
function textarea(config = {}) {
  const {
    value = "",
    title,
    description,
    autocomplete,
    cols = 45,
    rows = 3,
    width,
    height,
    maxlength,
    placeholder,
    spellcheck,
    wrap,
    disabled
  } = typeof config === "string" ? { value: config } : config;

  const container = document.createElement("div");
  const textarea = document.createElement("textarea");

  // Apply attributes
  if (autocomplete != null) textarea.autocomplete = autocomplete;
  if (cols != null) textarea.cols = cols;
  if (rows != null) textarea.rows = rows;
  if (maxlength != null) textarea.maxLength = maxlength;
  if (placeholder != null) textarea.placeholder = placeholder;
  if (spellcheck != null) textarea.spellcheck = spellcheck;
  if (wrap != null) textarea.wrap = wrap;
  if (disabled != null) textarea.disabled = disabled;
  if (width != null) textarea.style.width = width;
  if (height != null) textarea.style.height = height;

  textarea.value = value;

  if (title) {
    const label = document.createElement("div");
    label.style.fontWeight = "bold";
    label.textContent = title;
    container.appendChild(label);
  }

  container.appendChild(textarea);

  if (description) {
    const desc = document.createElement("div");
    desc.style.fontStyle = "italic";
    desc.textContent = description;
    container.appendChild(desc);
  }

  container.value = textarea.value;

  textarea.addEventListener("input", () => {
    container.value = textarea.value;
    container.dispatchEvent(new CustomEvent("input"));
  });

  Object.defineProperty(container, "input", {
    get: () => textarea
  });

  return container;
}
```

```js echo
const radioDemo = md`---
## Radio Buttons

~~~js
import {radio} from "@jashkenas/inputs"
~~~`
```

```js echo
const r = view(radio(["Lust", "Gluttony", "Greed", "Sloth", "Wrath", "Envy", "Pride"]))
```

```js
r
```

```js echo
const r1 = view(radio({
  title: 'Contact Us',
  description: 'Please select your preferred contact method',
  options: [
    { label: 'By Email', value: 'email' },
    { label: 'By Phone', value: 'phone' },
    { label: 'By Pager', value: 'pager' },
  ],
  value: 'pager'
}))
```

```js
r1
```

```js echo
function radio(config = {}) {
  let {
    value: formValue,
    title,
    description,
    options,
    disabled
  } = Array.isArray(config) ? { options: config } : config;

  options = options.map(o =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  const container = document.createElement("div");
  const radioGroup = document.createElement("div");

  if (title) {
    const label = document.createElement("div");
    label.textContent = title;
    label.style.fontWeight = "bold";
    container.appendChild(label);
  }

  if (description) {
    const desc = document.createElement("div");
    desc.textContent = description;
    desc.style.fontStyle = "italic";
    container.appendChild(desc);
  }

  const name = `radio-${Math.random().toString(36).slice(2)}`;
  for (const { value, label } of options) {
    const wrapper = document.createElement("label");
    wrapper.style.display = "inline-block";
    wrapper.style.margin = "5px 10px 3px 0";
    wrapper.style.fontSize = "0.85em";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    if (disabled) input.disabled = true;
    if (formValue === value) input.checked = true;

    input.addEventListener("input", () => {
      container.value = value;
      container.dispatchEvent(new CustomEvent("input"));
    });

    wrapper.appendChild(input);
    wrapper.appendChild(document.createTextNode(" " + label));
    radioGroup.appendChild(wrapper);
  }

  container.appendChild(radioGroup);

  container.value = formValue;

  Object.defineProperty(container, "input", {
    get: () => radioGroup.querySelector("input:checked")
  });

  return container;
}

```

```js echo
const checkboxDemo = md`---
## Checkboxes

~~~js
import {checkbox} from "@jashkenas/inputs"
~~~`
```

```js echo
const ch = view(checkbox(["Lust", "Gluttony", "Greed", "Sloth", "Wrath", "Envy", "Pride"]))
```

```js echo
ch
```

```js echo
const ch1 = view(checkbox({
  title: "Colors",
  description: "Please select your favorite colors",
  options: [
    { value: "r", label: "Red" },
    { value: "o", label: "Orange" },
    { value: "y", label: "Yellow" },
    { value: "g", label: "Green" },
    { value: "b", label: "Blue" },
    { value: "i", label: "Indigo" },
    { value: "v", label: "Violet" }
  ],
  value: ["r", "g", "b"],
  submit: true
}))
```

```js echo
ch1
```

```js echo
const ch3 = view(checkbox({
  description: "Just a single checkbox to toggle",
  options: [{ value: "toggle", label: "On" }],
  value: "toggle"
}))
```

```js echo
ch3
```

```js echo
function checkbox(config = {}) {
  let {
    value: formValue,
    title,
    description,
    submit,
    disabled,
    options
  } = Array.isArray(config) ? { options: config } : config;
  options = options.map(o =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  const form = input({
    type: "checkbox",
    title,
    description,
    submit,
    getValue: input => {
      if (input.length)
        return Array.prototype.filter
          .call(input, i => i.checked)
          .map(i => i.value);
      return input.checked ? input.value : false;
    },
    form: html`
      <form>
        ${options.map(({ value, label }, i) => {
          const input = html`<input type=checkbox name=input ${
            (formValue || []).indexOf(value) > -1 ? "checked" : ""
          } style="vertical-align: top; ${
            i === 0 ? `margin-left: 1px;` : ``
          }" />`;
          input.setAttribute("value", value);
          if (disabled) input.setAttribute("disabled", disabled);
          const tag = html`<label style="display: inline-block; margin: 5px 10px 3px 0; font-size: 0.85em;">
           ${input}
           ${label}
          </label>`;
          return tag;
        })}
      </form>
    `
  });
  form.output.remove();
  return form;
}
```

```js echo
const numberDemo = md`---
## Numbers

~~~js
import {number} from "@jashkenas/inputs"
~~~`
```

```js echo
const h = view(number())
```

```js
h
```

```js echo
const h1 = view(number({placeholder: "13+", title: "Your Age", submit: true}))
```

```js
h1
```

```js echo
function number(config = {}) {
  const {
    value,
    title,
    description,
    disabled,
    placeholder,
    submit,
    step = "any",
    min,
    max
  } =
    typeof config === "number" || typeof config === "string"
      ? { value: +config }
      : config;
  const form = input({
    type: "number",
    title,
    description,
    submit,
    attributes: {
      value,
      placeholder,
      step,
      min,
      max,
      autocomplete: "off",
      disabled
    },
    getValue: input => input.valueAsNumber
  });
  form.output.remove();
  form.input.style.width = "auto";
  form.input.style.fontSize = "1em";
  return form;
}
```

```js echo
const passwordDemo = md`---
## Passwords

~~~js
import {password} from "@jashkenas/inputs"
~~~`
```

```js echo
const i = view(password({value: "password"}))
```

```js echo
i
```

```js echo
const i1 = view(password({
  title: "Your super secret password", 
  description: "Less than 12 characters, please.",
  minlength: 6,
  maxlength: 12
}))
```

```js
i1
```

```js echo
function password(config = {}) {
  const {
    value,
    title,
    description,
    disabled,
    autocomplete = "off",
    maxlength,
    minlength,
    pattern,
    placeholder,
    size,
    submit
  } = typeof config === "string" ? { value: config } : config;
  const form = input({
    type: "password",
    title,
    description,
    submit,
    attributes: {
      value,
      autocomplete,
      maxlength,
      minlength,
      pattern,
      placeholder,
      size,
      disabled
    }
  });
  form.output.remove();
  form.input.style.fontSize = "1em";
  return form;
}
```

```js
md`---
## Wishlist (Send suggestions, please!)

* 3D coordinate input (for say, positioning a camera in a WebGL sketch)
* Geocoder search with location autocomplete that returns longitude and latitude.
* Degrees or radians input, for circular things, or angles.
* A dimensions input, or a box-model input, with margin (and optionally, padding).
* A map-projection-picker input, rendering little thumbnails of all the d3-geo-projections.
* Drag and drop file upload input.
* Alternative coordinate inputs, e.g. Right Ascension, Declination.
* Other useful formatting options.

---`
```

```js echo
function input(config) {
  let {
    form,
    type = "text",
    attributes = {},
    action,
    getValue,
    title,
    description,
    format,
    display,
    submit,
    options
  } = config;

  const wrapper = html`<div></div>`;
  if (!form)
    form = html`<form>
	<input name=input type=${type} />
  </form>`;
  Object.keys(attributes).forEach(key => {
    const val = attributes[key];
    if (val != null) form.input.setAttribute(key, val);
  });
  if (submit)
    form.append(
      html`<input name=submit type=submit style="margin: 0 0.75em" value="${
        typeof submit == "string" ? submit : "Submit"
      }" />`
    );
  form.append(
    html`<output name=output style="font: 14px Menlo, Consolas, monospace; margin-left: 0.5em;"></output>`
  );
  if (title)
    form.prepend(
      html`<div style="font: 700 0.9rem sans-serif; margin-bottom: 3px;">${title}</div>`
    );
  if (description)
    form.append(
      html`<div style="font-size: 0.85rem; font-style: italic; margin-top: 3px;">${description}</div>`
    );
  if (format)
    format = typeof format === "function" ? format : d3format.format(format);
  if (action) {
    action(form);
  } else {
    const verb = submit
      ? "onsubmit"
      : type == "button"
      ? "onclick"
      : type == "checkbox" || type == "radio"
      ? "onchange"
      : "oninput";
    form[verb] = e => {
      e && e.preventDefault();
      const value = getValue ? getValue(form.input) : form.input.value;
      if (form.output) {
        const out = display ? display(value) : format ? format(value) : value;
        if (out instanceof window.Element) {
          while (form.output.hasChildNodes()) {
            form.output.removeChild(form.output.lastChild);
          }
          form.output.append(out);
        } else {
          form.output.value = out;
        }
      }
      form.value = value;
      if (verb !== "oninput")
        form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    };
    if (verb !== "oninput")
      wrapper.oninput = e => e && e.stopPropagation() && e.preventDefault();
    if (verb !== "onsubmit") form.onsubmit = e => e && e.preventDefault();
    form[verb]();
  }
  while (form.childNodes.length) {
    wrapper.appendChild(form.childNodes[0]);
  }
  form.append(wrapper);
  return form;
}
```

```js
import {require} from "npm:d3-require";
```


```js echo
const d3geo = require("d3-geo@1")
```

```js echo
const d3format = require("d3-format@1")
```

```js echo
const topojson = require("topojson-client@3")
```

```js echo
const world = (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json")).json()
```

```js echo
const land = topojson.feature(world, world.objects.land)
```

```js echo
const countries = topojson.feature(world, world.objects.countries)
```

```js echo
const usa = (await fetch("https://cdn.jsdelivr.net/npm/us-atlas@^2.1/us/states-10m.json")).json()
```

```js echo
const nation = topojson.feature(usa, usa.objects.nation)
```

```js echo
const states = topojson.feature(usa, usa.objects.states)
```

```js echo
const graticule = d3geo.geoGraticule10()
```

```js echo
// formerly was view
const license = (() =>  {
  const license = md`License: [MIT](https://opensource.org/licenses/MIT)`;
  license.value = "MIT";
  return license;
})()
```


```js
md`*Clip art courtesy [ClipArt ETC](https://etc.usf.edu/clipart/), radio buttons and checkboxes courtesy [Amit Sch](https://observablehq.com/@meetamit/multiple-choice-inputs).*`
```
