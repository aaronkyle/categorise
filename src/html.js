// import {html} from "npm:@observablehq/stdlib@5/src/html";
// https://cdn.jsdelivr.net/npm/@observablehq/stdlib@5/src/html.js

import {template} from "./template.js";

export const html = template(function(string) {
  var template = document.createElement("template");
  template.innerHTML = string.trim();
  return document.importNode(template.content, true);
}, function() {
  return document.createElement("span");
});
