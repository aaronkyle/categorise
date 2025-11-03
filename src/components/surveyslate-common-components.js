//# Survey Slate | Common Components


import {html} from "htl";     
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
}

import * as Inputs from "/components/inputs.js";

//import {mainColors, accentColors} from "@categorise/brand.js";
import {mainColors, accentColors} from "/components/brand.js";
//import {getIconSvg} from "@saneef/feather-icons"
import {getIconSvg} from "/components/feather-icons.js"

/* -------------------- re-exports -------------------- */
// make available to consumers...
//export { mainColors, accentColors, getIconSvg };

// Thanks @mootari, https://observablehq.com/@saneef/is-observable-inputs-style-able
const ns = Inputs.text().classList[0]


//## TextNodeView

export const textNodeView = (value = '') => {
  const node = document.createTextNode(value)
  return Object.defineProperty(node, 'value', {
    get: () => node.textContent,
    set: (val) => node.textContent = val,
    enumerable: true
  });
}


// Icons
const getIconHtml = (name, klasses = "") => `<span class="icon ${klasses}">${getIconSvg(name, 24, {role: 'img'})}</span>`


/* -------------------- UI Components -------------------- */


//## Logotype

const logotype = (name = "Survey Slate") => html`<div class="[ pa2 flex items-center w3 h3 ][ f6 lh-title b tracked-light ][ text-on-brand bg-accent ]">${name}`


//## Page Header

const pageHeader = (titles, brandName = "Survey Slate") => {
  const header = html`<div class="flex bg-text-on-brand">
  <div class="flex-none">
    ${logotype(brandName)}
  </div>
  <div class="[ flex items-center ph3 w-100 ][ f6 f5-ns ]">
    ${titles.reduce((acc,t, i, arr) => {
      const isLast = i === arr.length - 1;
      const commonClasses = "lh-solid ma0";
      const specialClasses = isLast ? "b" : "dn db-ns mid-gray";
      const seperator = isLast ? "" : html`<span aria-hidden="true" class="mv0 mh2 black-20">/<span>`;

      return html`${acc}<p class="${commonClasses} ${specialClasses}">${t}${seperator}</p>`;
    }, "")}
  </div>
</div>`

  return header;
}


//## Page Footer

const pageFooter = (brandName = "Survey Slate") => {
  const linkClasses = "link brand underline-hover";
  const year = new Date().getFullYear();

  return html`<footer class="[ flex flex-wrap justify-center justify-between-l pa3 ph2 ph5-ns ][ f6 gray bg-white ]">
  <div class="[ flex flex-wrap justify-center ][ space-x-2 ]">
    © ${year} ${brandName}
  </div>
</footer>
`
}


//## Spinner (Loader)

//!!!!!!!!!!!!!!!!
//!!! Check that this is the correct way to add this here
//!!!!!!!!!!!!!!!!
//const spinner = () => { 
//  return html`<span class="spinner">${getIconHtml("loader")}</span>`
//}
const spinner = () => {
  const t = document.createElement("template");
  t.innerHTML = `<span class="spinner">${getIconHtml("loader")}</span>`;
  return t.content.firstElementChild;
};


//## Button Label

///!!!!!!!!!!!!!!!!!!!!!
///!!!!!!Changes introduced in attaching buttons back into the DOM. Verify.
///!!!!!!!!!!!!!!!!!!!!!
const buttonLabel = ({label, iconLeft, iconRight, iconRightClass, iconLeftClass, ariaLabel}) => {
  let labelHtml = "";
  if (iconLeft) {
    labelHtml += `${getIconHtml(iconLeft, `icon--sm ${iconLeftClass || ""}`)} `;
  }

  if(label) {
    labelHtml += `<span class="button-label__text">${label}</span>`;
  }

  if (iconRight) {
    labelHtml += `${getIconHtml(iconRight, `icon--sm ${iconRightClass || ""}`)} `;
  }

  if (ariaLabel) {
    labelHtml += `<span class="clip">${ariaLabel}</span>`;
  }
  
  //return html`<span class="button-label">${labelHtml}</span>`
  // Turn the string into a real node so it won't be escaped.
  const t = document.createElement("template");
  t.innerHTML = `<span class="button-label">${labelHtml}</span>`;
  return t.content.firstElementChild;
}



/* -------------------- Styles -------------------- */

//## Styles

const styles = html`<style>
  :root {
    --button-border-radius: var(--border-radius-2, 0.25rem);
    --border-color: #aaa; /* tachyons's light-silver */
    --border-color-light: #eee; /* tachyons's light-gray */
  }

  /* https://observablehq.com/@saneef/is-observable-inputs-style-able */
  form.${ns} {
    width: auto;
  }

  .${ns} input,
  .${ns} textarea,
  .${ns} select,
  .${ns} button {
    font-family: var(--brand-font);
  }

  .${ns} input[type="text"],
  .${ns} textarea,
  .${ns} select,
  .${ns} button {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: var(--button-border-radius);
  }

  .${ns} input[type="text"],
  .${ns} textarea,
  .${ns} button {
    padding: var(--spacing-extra-small) var(--spacing-small);
  }

  .${ns} select {
    padding-top: var(--spacing-extra-small);
    padding-bottom: var(--spacing-extra-small);
  }

  .${ns} button:hover,
  .${ns} button:focus,
  .${ns} button:active {
    background-color: var(--light-gray, #eee);
  }

  /* Icon */

  .icon {
    display: inline-block;
    position: relative;
    vertical-align: middle;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--gray, #777)
  }

  .icon svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .icon--sm {
    width: 1rem;
    height: 1rem;
  }
  
  .icon--danger {
    color: var(--red, #ff4136)
  }

  .icon--success {
    color: var(--green, #19a974)
  }

  /* Button Group*/

  .button-group {
    display: flex;
  }

  .button-group form.${ns} + form.${ns} {
    margin-left: -1px;
  }

  .button-group form.${ns} button {
      border-radius: 0;
    }

  .button-group form.${ns}:first-child button {
    border-top-left-radius: var(--button-border-radius);
    border-bottom-left-radius: var(--button-border-radius);
  }

  .button-group form.${ns}:last-child button {
    border-top-right-radius: var(--button-border-radius);
    border-bottom-right-radius: var(--button-border-radius);
  }

  /* Button Label */
  .button-label {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  .button-label > * + * {
    margin-left: var(--spacing-extra-small, 0.25rem);
  }
  .button-label__text {}

  /* Card */

  .card {
    display: block;
    background: white;
    padding: 1rem; /* pa3 or --spacing-medium */
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-3);
  }

  .card--compact {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Loader */
  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
  .spinner .icon {
    color: var(--brand);
  }
  .spinner svg {
    animation: rotate ease-out 1.2s infinite;
  }
</style>`


