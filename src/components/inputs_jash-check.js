
// NEED TO FIGURE OUT HOW TO GET THIS WORKING


//import { Inputs } from "@observablehq/inputs";
import * as Inputs from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.12/+esm";
import markdownit from "markdown-it";
import { DOM } from "/components/DOM.js";
import {require} from "npm:d3-require";
//import * as d3geo from "d3-geo";
import { html } from "htl";
//import { Files } from "@observablehq/stdlib";
//import { format as d3format } from "d3-format";
//import * as topojson from "topojson-client";

const d3geo = require("d3-geo@1");
const d3format = require("d3-format@1");
const topojson = require("topojson-client@3");

export async function initializeGeoData() {
  const world = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json")).json();
  const land = topojson.feature(world, world.objects.land);
  const countries = topojson.feature(world, world.objects.countries);
  const usa = await (await fetch("https://cdn.jsdelivr.net/npm/us-atlas@^2.1/us/states-10m.json")).json();
  const nation = topojson.feature(usa, usa.objects.nation);
  const states = topojson.feature(usa, usa.objects.states);
  const graticule = d3geo.geoGraticule10();
  return { world, land, countries, usa, nation, states, graticule };
};


const Markdown = new markdownit({ html: true });

export function md(strings, ...values) {
  const raw = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
  const template = document.createElement("template");
  template.innerHTML = Markdown.render(raw);
  return template.content.cloneNode(true);
};

export function input(config) {
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
};


export function slider(config = {}) {
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
};

export function button(config = {}) {
  const {
    value = "Ok", title, description, disabled
  } = typeof config === "string" ? { value: config } : config;
  const form = input({
    type: "button", title, description,
    attributes: { disabled, value }
  });
  form.output.remove();
  return form;
};

export function select(config = {}) {
  let {
    value: formValue,
    title,
    description,
    disabled,
    submit,
    multiple,
    size,
    options
  } = Array.isArray(config) ? { options: config } : config;

  options = options.map((o) =>
    typeof o === "object" ? o : { value: o, label: o }
  );

  const form = input({
    type: "select",
    title,
    description,
    submit,
    attributes: { disabled },
    getValue: (input) => {
      const selected = Array.prototype.filter
        .call(input.options, (i) => i.selected)
        .map((i) => i.value);
      return multiple ? selected : selected[0];
    },
    form: html`<form>
        <select name="input" multiple=${multiple} size=${multiple ? size || options.length : undefined}>
          ${options.map(
            ({ value, label, disabled }) =>
              html`<option value=${value} selected=${
                Array.isArray(formValue)
                  ? formValue.includes(value)
                  : formValue === value
              } disabled=${disabled}>${label}</option>`
          )}
        </select>
      </form>`
  });

  form.output.remove();
  return form;
}

export function autoSelect(config = {}) {
  const {
    value,
    title,
    description,
    disabled,
    placeholder,
    options
  } = Array.isArray(config) ? { options: config } : config;

  return Inputs.text({
    value,
    label: title === undefined ? description : title,
    disabled,
    placeholder,
    datalist: options
  });
}

export function color(config = {}) {
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

  form.input.value = '';
  form.input.value = value;
  if (title || description) form.input.style.margin = "5px 0";
  return form;
}

export function coordinates(config = {}) {
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
};

export async function worldMapCoordinates(config = {}) {
  const { land, countries, graticule } = await initializeGeoData();
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
};


export function usaMapCoordinates(config = {}) {
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
};



export function time(config = {}) {
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
};


export function file(config = {}) {
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
};

// differently refactored
export function text(config = {}) {
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
};



export function textarea(config = {}) {
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
};


export function radio(config = {}) {
  const {
    value,
    title,
    description,
    options,
    disabled,
    // TODO submit
  } = Array.isArray(config) ? {options: config} : config;
  return Inputs.radio(options, {
    value,
    label: title === undefined ? description : title,
    format: o => typeof o === "object" ? o.label : o,
    keyof: o => typeof o === "object" ? o.label : o,
    valueof: o => typeof o === "object" ? o.value : o,
    disabled: disabled || options.filter(o => typeof o === "object" && o.disabled).map(o => o.value)
  });
};

export function checkbox(config = {}) {
  let {
    value,
    title,
    description,
    disabled,
    options,
    // TODO submit
    // TODO false / value when only a single option?
  } = Array.isArray(config) ? {options: config} : config;
  return Inputs.checkbox(options, {
    value,
    label: title === undefined ? description : title,
    format: o => typeof o === "object" ? o.label : o,
    keyof: o => typeof o === "object" ? o.label : o,
    valueof: o => typeof o === "object" ? o.value : o,
    disabled: disabled || options.filter(o => typeof o === "object" && o.disabled).map(o => o.value)
  });
};


export function number(config = {}) {
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
};



export function password(config = {}) {
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