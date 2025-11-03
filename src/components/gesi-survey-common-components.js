//# GESI Survey | Common Components
//Reusable UI components for Survey Slate projects.


import {html} from "htl";     

//import {tachyonsExt} from "@adb/tachyons-and-some-extras"
import {tachyonsExt} from "/components/tachyons-and-some-extras.js"

//import {mainColors, accentColors} from "@adb/brand"
import {mainColors, accentColors} from "/components/brand.js"

//import {getIconSvg} from "@saneef/feather-icons"
import {getIconSvg} from "/components/feather-icons.js"

import * as Inputs from "/components/inputs.js";

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



const getIconHtml = (name, klasses = "") => `<span class="icon ${klasses}">${getIconSvg(name, 24, {role: 'img'})}</span>`




//## TextNodeView
//A textNodeView syncs its value to a simple textNode DOM element. Because its a view, it can be added to a view-literal expression in quite a simple way.


const textNodeView = (value = '') => {
  const node = document.createTextNode(value)
  return Object.defineProperty(node, 'value', {
    get: () => node.textContent,
    set: (val) => node.textContent = val,
    enumerable: true
  });
}


//## Logo


const logoSvg = (klasses = "", size = 32) => html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="${size}" height="${size}" role="img" aria-label="Asian Development Bank" class="${klasses}"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g><path fill="#002569" d="M0 0h80v80H0z"/><g fill="#FFF" fill-rule="nonzero" transform="translate(2 33)"><path d="M50.9 6.5c-1.5-2.2-3.6-3.9-6.4-4.8-.7-.2-1.5-.4-2.2-.5-.7-.1-1.5-.2-2.3-.2H26.8v1.2h.2c1.2.1 2.2.2 2.8.5.7.3 1 1.2 1 2.6v17.4c0 1.4-.3 2.3-1 2.6-.5.2-1.2.4-2 .5-.6-.1-1.2-.3-1.6-.6-.5-.4-1-1.1-1.4-1.9L15 .5h-1.4L4.2 23.2c-.4 1-.9 1.7-1.6 2.1-.6.3-1.5.5-2.6.5V27h9v-1.2H7.6c-.4 0-.9-.1-1.2-.4-.4-.2-.6-.6-.6-1.1 0-.2 0-.4.1-.5.1-.2.1-.3.2-.5l2-5.1h10.4l2.1 5.1c.1.2.2.4.3.7.1.2.1.5.1.7 0 .4-.2.7-.4.8-.3.2-.6.3-1 .3h-1.8V27h22.5c3.9 0 7-1.2 9.4-3.5 2.4-2.4 3.6-5.5 3.6-9.3-.1-2.9-.9-5.4-2.4-7.7Zm-42.3 10L12.8 6c0-.1.1-.2.1-.2 0-.1.1-.2.1-.2 0-.1.1-.2.1-.3 0-.1.1-.2.1-.3.1.4.2.8.4 1.3.2.4.3.8.5 1.3 0 .1.1.2.1.3.1.1.1.2.1.3l3.4 8.3H8.6Zm37.9 5.7c-1.3 2.3-3.7 3.5-7.2 3.5-1.8 0-3.1-.2-3.7-.7-.6-.5-.9-1.7-.9-3.6V2.3c.2 0 .5 0 .7-.1H37.5c3.8 0 6.6 1.1 8.4 3.2 1.8 2.1 2.6 5 2.6 8.8.1 2.9-.6 5.6-2 8Z"/><path d="M65.9 12.9c2.1.1 4 .7 5.8 1.8 1.7 1.1 2.6 2.9 2.6 5.2 0 2.2-.8 4-2.3 5.2-1.5 1.3-3.3 1.9-5.4 1.9H53.2v-1.2h.2c1.3-.1 2.2-.2 2.8-.5.6-.3 1-1.2 1-2.6V5.3c0-1.4-.3-2.3-1-2.6-.7-.3-1.6-.5-2.8-.5h-.2V1h12.6c1.8 0 3.4.5 4.8 1.4 1.4.9 2.2 2.4 2.2 4.3 0 2.1-.7 3.6-2.1 4.5-1.4.8-3 1.4-4.8 1.7Zm-4.8.8v9c0 1.3.4 2.1 1.1 2.4.7.4 1.6.5 2.7.5 1.9 0 3.2-.6 3.9-1.9.7-1.2 1.1-2.7 1.1-4.4 0-2.9-.9-4.5-2.7-5-1.9-.4-3.9-.6-6.1-.6Zm0-1.3c2 0 3.8-.2 5.3-.7 1.5-.5 2.2-1.9 2.2-4.4 0-1.6-.3-2.8-.9-3.7-.6-.9-1.8-1.4-3.5-1.4h-3.1v10.2Z"/></g></g></g></svg>`


//## Page Header


export const pageHeader = (titles) => {
  const header = html`<div class="flex bg-text-on-brand">
  <div class="flex-none">${logoSvg("db w3 h3")}</div>
  <div class="[ flex items-end ph3 w-100 ][ f6 f5-ns ]">
    ${titles.reduce((acc,t, i, arr) => {
      const isLast = i === arr.length - 1;
      const commonClasses = "lh-solid ma0 pb3";
      const specialClasses = isLast ? "b" : "dn db-ns mid-gray";
      const seperator = isLast ? "" : html`<span aria-hidden="true" class="mv0 mh2 black-20">/<span>`;

      return html`${acc}<p class="${commonClasses} ${specialClasses}">${t}${seperator}</p>`;
    }, "")}
  </div>
</div>`

  return header;
}


// ## Page Footer



export const pageFooter = () => {
  const linkClasses = "link brand underline-hover";
  const year = new Date().getFullYear();

  return html`<footer class="[ flex flex-wrap justify-center justify-between-l pa3 pt0 ph2 ph5-ns ][ f6 brand bg-text-on-brand ]">
  <div class="[ mh1 mt3 flex flex-wrap justify-center ][ space-x-2 ]">
    <a class="${linkClasses}" href="https://www.adb.org/terms-use#copyright">© ${year}</a>
    <a class="${linkClasses}" href="https://www.adb.org/"><span class="b ttu tracked-light">Asian Development Bank</span></a>.
    <a class="${linkClasses} tracked-light" href="https://creativecommons.org/licenses/by/3.0/igo/">CC BY 3.0 IGO.</a>
  </div>
  <div class="[ mh1 mt3 flex flex-wrap justify-center ][ space-x-3 ]">
    <a class="${linkClasses}" href="https://www.adb.org/contacts">ADB Contacts</a>
    <a class="${linkClasses}" href="https://www.adb.org/site/disclosure/main">Access to Information</a>
    <a class="${linkClasses}" href="https://www.adb.org/terms-use">Terms of Use</a>
  </div>
</footer>
`
}


// ## Spinner (Loader)



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

  if (label) {
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



//## Styles


// Thanks @mootari, https://observablehq.com/@saneef/is-observable-inputs-style-able
const ns = Inputs.text().classList[0]



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




tachyonsExt({
  colors: {
    brand: mainColors[900], // or, provide and color hex code
    accent: accentColors[900], // or, provide and color hex code
    // The color of text which are usually displayed on top of the brand or accent colors.
    "text-on-brand": "#ffffff",
  },
  fonts: {
    "brand-font": `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
  }
})



