//# Copier
// Code in this notebook are derived from https://observablehq.com/@mbostock/copier

// Clipboard copy utility
export const pbcopy = text => navigator.clipboard.writeText(text);

// Deprecated alias for pbcopy
export const copy = pbcopy;

/**
 * Creates a copy button or a set of copy buttons.
 * 
 * @param {string | Array<[string, string]>} content - The button label or array of [key, text] pairs.
 * @param {Object} options - Options passed to Inputs.button.
 * @returns {HTMLElement} A button or button group for copying text.
 */
export function Copier(content = "Copy code", options) {
  if (Array.isArray(content)) {
    content = Array.from(content, ([key, value]) => [
      key,
      () => (pbcopy(value), value)
    ]);
  }
  return Inputs.button(content, {
    ...options,
    reduce: (value) => (pbcopy(value), value)
  });
}

// Example: Simple click-to-copy button
export function exampleSimpleCopyButton() {
  let count = 0;
  return Object.assign(
    html`<button>Click me to copy text!</button>`,
    {
      onclick: () => pbcopy(`Hello, world! ${++count}`)
    }
  );
}