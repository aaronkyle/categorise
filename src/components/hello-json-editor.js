//# Hello json-editor
//Ref.: https://github.com/json-editor/json-editor`


import * as htl from "/components/htl@0.3.1.js";
const html = htl.html


import markdownit from "markdown-it";
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
};

//const JSONEditor = (await require("@json-editor/json-editor@2.5.4")).JSONEditor
//import JSONEditor from "@json-editor/json-editor";
const { JSONEditor } = await import("npm:@json-editor/json-editor@2.5.4")


//### Dependencies


export function editor(schema, options) {
  const dom = html`<div style="max-width:600px;">`;
  const shadow = dom.attachShadow({ mode: 'open' });
  const styles = html`
  <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css">
  <link rel="stylesheet" href="https://unpkg.com/spectre.css">
  <style>
  *{
    font-size:13px;
    font-family: -apple-system,BlinkMacSystemFont,"avenir next",avenir,helvetica,"helvetica neue",ubuntu,roboto,noto,"segoe ui",arial,sans-serif;
    box-sizing: border-box;
  }
  :host div[data-theme="spectre"] *{
    --primary-color: #4263FA;
  }
  .btn.btn-primary{
    background: var(--primary-color);
  }
  .column .je-panel {
    margin-left: 24px !important;
  }
  </style>`;
  const holder = html`<div></div>`;
  shadow.appendChild(styles);
  shadow.appendChild(holder);
  const props = Object.assign({ schema }, options || {});
  const editor = new JSONEditor(holder, props);

  // Allow for updating via `viewof car.value = {....}` (thank you, @jbouecke!)
  let __list = [];
  Object.defineProperty(dom, "value", {
    get: function() {
      return editor.getValue();
    },
    set: function(value) {
      const nos = JSON.stringify(value);
      const cos = JSON.stringify(editor.getValue());
      //console.log(cos+"\n"+nos);
      if (cos == nos) return;
      let no = JSON.parse(nos);
      editor.setValue(no);
      dom.dispatchEvent({ type: "input", value: no });
    }
  });
  dom.addEventListener = function(type, listener) {
    if (type != "input" || __list.includes(listener)) return;
    __list = [listener].concat(__list);
  };
  dom.removeEventListener = function(type, listener) {
    if (type != "input") return;
    __list = __list.filter(l => l !== listener);
  };
  dom.dispatchEvent = function(event) {
    console.log("place dispatch event");
    const p = Promise.resolve(event);
    __list.forEach(l => p.then(l));
  };

  editor.on("change", function() {
    dom.value = editor.getValue();
    dom.dispatchEvent(new CustomEvent("input"));
  });
  return dom;
};
