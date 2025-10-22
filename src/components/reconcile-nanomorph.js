/// this still isn't importing correctly
/// manually included in testing.md
/// chat thinks it's related to:  this,  // <-- 'this' is undefined or unexpected here

import {html} from "htl";
import {Mutable} from "observablehq:stdlib";
//import {require} from "d3-require";

//const morph = await require('https://bundle.run/nanomorph@5.4.2')

import morph from "https://cdn.jsdelivr.net/npm/nanomorph@5.4.2/+esm";

//https://observablehq.com/@tomlarkworthy/reconcile-nanomorph


// VERIFY MUTABLE CONVERSION
//mutable msgs = ["How are you?", "I am great!, loving Observable"]
const msgs = Mutable(["How are you?", "I am great!, loving Observable"]);
const setMsgs = (newMsgs) => (msgs.value = newMsgs);


export function reconcile(current, target, options) {
  if (
    !current ||
    !target ||
    current.nodeType != target.nodeType ||
    current.nodeName != target.nodeName ||
    current.namespaceURI != target.namespaceURI
  ) {
    if (current && target && current.nodeName != target.nodeName) {
      console.log("Cannot reconcile", current.nodeName, target.nodeName);
    }
    return target;
  }
  return morph(current, target, options);
}




// VERIFY MUTABLE
(() => {
  async function sendMsg(evt) {
    if (evt.keyCode === 13) {
      console.log(msgs);
      setMsgs(msgs.concat([evt.target.value]));
    }
  }
  return html`
    ${msgs.map((msg) => html`<p>${msg}</p>`)}
    <input class="text" onkeydown=${sendMsg}></input>
    <button onclick=${() => setMsgs([])}>clear</button>
  `;
})()

// VERIFY MUTABLE
(() => {
  function sendMsg(evt) {
    if (evt.keyCode === 13) {
      console.log(msgs);
      setMsgs(msgs.concat([evt.target.value]));
    }
  }
  return reconcile(
    this,
    html`
    ${msgs.map((msg) => html`<p>${msg}</p>`)}
    <input id="chat" class="text" onkeydown=${sendMsg}></input>
    <button onclick=${() => setMsgs([])}>clear</button> 
  `
  );
})()



const attributeCreate = (() => {
  const current = html`<div></div>`;
  const target = html`<div foo="1"></div>`;
  const reconciled = reconcile(current, target);
  console.log(reconciled);
  return reconciled.getAttribute("foo") == "1";
})();


const attributeRemoved = (() => {
  const current = html`<div foo="1"></div>`;
  const target = html`<div></div>`;
  const reconciled = reconcile(current, target);
  return reconciled.getAttribute("foo") === null;
})();

const attributeUpdate = (() => {
  const current = html`<div foo="2"></div>`;
  const target = html`<div foo="1"></div>`;
  const reconciled = reconcile(current, target);
  return reconciled.getAttribute("foo") == "1";
})();


const attributesCRUD = (() => {
  const current = html`<div foo="2" bar="1"></div>`;
  const target = html`<div bar="2" baz="3"></div>`;
  const reconciled = reconcile(current, target);
  return (
    reconciled.getAttribute("foo") == null &&
    reconciled.getAttribute("bar") == "2" &&
    reconciled.getAttribute("baz") == "3"
  );
})();


const childUpdateInPlace = (() => {
  const current = html`<ul><li id="t1"> </li></ul>`;
  const target = html`<ul><li id="t1">1</li></ul>`;
  const beforeReconciliation = current.firstChild;
  const reconciled = reconcile(current, target);
  return (
    reconciled.firstChild === beforeReconciliation &&
    reconciled.firstChild.firstChild.wholeText === "1"
  );
})();

const childAdded = (() => {
  const current = html`<ul></ul>`;
  const target = html`<ul><li id="t1">1</li></ul>`;
  const reconciled = reconcile(current, target);
  return reconciled.firstChild.firstChild.wholeText === "1";
})();

const childRemoved = (() => {
  const current = html`<ul><li id="t1">1</li></ul>`;
  const target = html`<ul></ul>`;
  const reconciled = reconcile(current, target);
  return reconciled.firstChild == null;
})();

const keyedChildUpdateInPlace = (() => {
  const current = html`<ul><li id="t1"></li></ul>`;
  const target = html`<ul><li></li><li id="t1"></li></ul>`;
  const beforeReconciliation = current.firstChild;
  const reconciled = reconcile(current, target);
  return reconciled.firstChild.nextSibling === beforeReconciliation;
})();

const DOMUpdateInPlaceDOM = html`
<div id="DOMUpdateInPlace"> 
</div>
`;


const DOMUpdateInPlace = (() => {
  DOMUpdateInPlaceDOM
  
  const current = document.getElementById("DOMUpdateInPlace")
  const target = html`<div id="DOMUpdateInPlace"><p>1</p></div>`
  const reconciled = reconcile(current, target);
  return current ===  reconciled
})();

const NestedDOMUpdateInPlaceDOM = html`
<div id="NestedDOMUpdateInPlace"><p>
    <b>raw</b>
</p></div>`;

const NestedDOMUpdateInPlace = (() => {
  NestedDOMUpdateInPlaceDOM
  
  const current = document.getElementById("NestedDOMUpdateInPlace")
  const target = html`<div id="NestedDOMUpdateInPlace"><p>
    <b>new</b>
  </p></div>`
  reconcile(current, target);
  return current.textContent.includes("new")
})();