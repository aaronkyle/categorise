//# localStorageView: Non-invasive local persistence


import * as htl from "htl";
import * as Inputs from "/components/inputs_observable.js";
import {DOM} from "/components/DOM.js";
import { localStorage } from '/components/safe-local-storage.js';


export function localStorageView(key, { bindTo, defaultValue = null, json = false } = {}) {
  const id = DOM.uid().id;

  const readRaw = () => localStorage.getItem(key);
  const readValue = () => {
    const raw = readRaw();
    if (raw == null) return defaultValue;
    if (!json) return raw;
    try { return JSON.parse(raw); } catch { return defaultValue; }
  };

  const ui = htl.html`<div class="observablehq--inspect" style="display:flex; gap:.5rem;">
    <code>localStorageView(<span class="observablehq--string">"${key}"</span>):</code>
    <span id="${id}"></span>
  </div>`;
  const holder = ui.querySelector(`#${id}`);
  holder.textContent = String(readValue());

  Object.defineProperty(ui, "value", {
    get: readValue,
    set: (value) => {
      const toStore = json ? JSON.stringify(value) : value;
      localStorage.setItem(key, toStore);
      holder.textContent = String(readValue());
    },
    enumerable: true
  });

  if (bindTo) Inputs.bind(bindTo, ui);
  return ui;
}




