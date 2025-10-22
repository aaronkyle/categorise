
//# Copier

import {html, Inputs} from "observablehq:stdlib";
import markdownit from "markdown-it";

export const Markdown = new markdownit({html: true});

export const pbcopy = text => navigator.clipboard.writeText(text)
export const copy = pbcopy // Deprecated alias

export function md(strings) {
  let string = strings[0];
  for (let i = 1; i < arguments.length; ++i) {
    string += String(arguments[i]);
    string += strings[i];
  }
  const template = document.createElement("template");
  template.innerHTML = Markdown.render(string);
  return template.content.cloneNode(true);
}

export function Copier(content = "Copy code", options) {
  if (Array.isArray(content)) content = Array.from(content, ([key, value]) => [key, () => (pbcopy(value), value)]);
  return Inputs.button(content, {...options, reduce: (value) => (pbcopy(value), value)});
}


