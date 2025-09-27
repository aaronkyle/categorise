// # DOM
// Code in this notebook are derived from https://github.com/observablehq/stdlib/tree/main/src/dom

var count = 0;

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function () {
  return "url(" + this.href + ")";
};

export function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
};

export function svg(width, height) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", [0, 0, width, height]);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  return svg;
};

export function text(value) {
  return document.createTextNode(value);
}

export function select(values) {
  var select = document.createElement("select");
  Array.prototype.forEach.call(values, function(value) {
    var option = document.createElement("option");
    option.value = option.textContent = value;
    select.appendChild(option);
  });
  return select;
}

export function context2d(width, height, dpi) {
  if (dpi == null) dpi = devicePixelRatio;
  var canvas = document.createElement("canvas");
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  canvas.style.width = width + "px";
  var context = canvas.getContext("2d");
  context.scale(dpi, dpi);
  return context;
};


export function contextWebGL(width, height, dpi) {
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


export const DOM = {
  uid,
  svg,
  text,
  select,
  context2d,
  contextWebGL
};


