
///
// NEED TO IMPORT Observable-only APIs
// Inputs.input(results) → use your shim: createInput(results)
// invalidation.then(...) → use your guard: maybeInvalidation && maybeInvalidation.then(...)
// Keep the d3-require usage consistent: import {requireFromUrl} ... and const require = requireFromUrl();
// ensure you’re in a browser ES module (this import is from a CDN and won’t work in Node without a loader).
// updateUI() just calls reconcile(...) but doesn’t handle the case where a new node is returned. Either replace the host node when it differs or ensure your reconcile always morphs in place.




/* External dependencies (browser ESM): htl (html template) + nanomorph (DOM diff) */
import * as htl from "https://cdn.jsdelivr.net/npm/htl@0.3.1/+esm";
import morph from "https://cdn.jsdelivr.net/npm/nanomorph@5.4.2/+esm";
import require from "https://cdn.jsdelivr.net/npm/d3-require@1/+esm";
import * as Inputs from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.12/+esm";


// Load Observable Inputs CSS inside module
function loadInputsCSS() {
  if (document.getElementById("observablehq-inputs-css")) return;
  const link = document.createElement("link");
  link.id = "observablehq-inputs-css";
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.12/dist/index.css";
  document.head.appendChild(link);
}

// Call it once in your module
loadInputsCSS();


// Adding 'require'
//const require = requireFromUrl();

// html tagged template literal
const html = htl.html



// EXPERIMENTAL
// "Inputs.input" replacement: an EventTarget that carries a .value
function createInput(valueObj) {
  const et = new EventTarget();
  // store a reference the original used via "viewofResults.value"
  Object.defineProperty(et, "value", {
    get: () => valueObj,
    set: () => {}, // ignore external writes
  });
  return et;
}

// EXPERIMENTAL
// Optional invalidation-like promise (no-op outside Observable)
const maybeInvalidation =
  typeof invalidation !== "undefined" && invalidation && typeof invalidation.then === "function"
    ? invalidation
    : null;


//import { reconcile } from "@tomlarkworthy/reconcile-nanomorph"
//import { reconcile } from "/components/reconcile-nanomorph.js";
function reconcile(current, target, options) {
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
//display(reconcile)


const pseudouuid = () => Math.random().toString(16).substring(3)


/* ----- Exported: createSuite (UI component) ----- */

export const createSuite = ({
  name = "tests", // Set to null to turn of tap report link
  timeout_ms = 30000
} = {}) => {
  const id = pseudouuid();
  const tests = {};
  const results = {};
  const viewofResults = Inputs.input(results);
  var filter = "";
  const regex = () => new RegExp(filter);

  function updateUI() {
    reconcile(document.getElementById(id), generate());
  }

  // from https://spin.atomicobject.com/2020/01/16/timeout-promises-nodejs/
  function promiseWithTimeout(timeoutMs, promise, failureMessage) {
    let timeoutHandle;
    const timeoutPromise = new Promise((resolve, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new Error(failureMessage)),
        timeoutMs
      );
    });
    return Promise.race([promise, timeoutPromise]).then((result) => {
      clearTimeout(timeoutHandle);
      return result;
    });
  }

  async function maybeRunTest(name) {
    if (regex().test(name)) {
      results[name] = undefined;
      updateUI();
      try {
        await promiseWithTimeout(timeout_ms, tests[name](), "Timeout");
        results[name] = "ok";
        viewofResults.dispatchEvent(new Event("input", { bubbles: true }));
        updateUI();
        return results[name];
      } catch (err) {
        results[name] = err;
        viewofResults.dispatchEvent(new Event("input", { bubbles: true }));
        updateUI();
        throw err;
      }
    }
  }

  function filterChange(evt) {
    if (filter !== evt.target.value) {
      filter = evt.target.value;
      updateUI();
    }
    if (evt.keyCode === 13) {
      Object.keys(tests).map((label) => maybeRunTest(label));
    }
  }

  function generate() {
    return html`<div class="testsuite" id=${id}>
        ${name ? html`<h2 id="title{id}">${name}</h2>` : null}
        <a name="testsuite${id}"></a>
        <input key="filter"
          oninput=${(e) => e.stopPropagation()}
          onkeyup=${filterChange}
          value="${filter}"
          placeholder="test filter regex"></input>
        <table key="results" style="max-width: 100%">
          <tr><th>name</th><th>value</th></tr>
          ${Object.keys(results)
            .filter((label) => regex().test(label))
            .sort()
            .map(
              (label) => html.fragment`
                <tr><td>
                  <a href="#testresult${encodeURIComponent(label)}">
                    ${label}
                  </a>
                </td><td>${
                  results[label] ? (results[label] + "").slice(0, 200) : null
                }
                </td></tr>
              `
            )}
        </table>
        <style>
          a[name] { scroll-margin-top: 75px }
        </style>
      </div>`;
  }

  const api = {
    viewofResults: viewofResults,
    results: results,
    test: async (label, fn) => {
      // console.log(`Test scheduled: ${label}`);
      results[label] = undefined;
      const run = async () => {
        // If the user supplies a done handler in the fn, use that
        return fn.length == 1
          ? new Promise(async (resolve, reject) => {
              const done = (error) => {
                if (error) reject(error);
                else resolve();
              };
              try {
                await fn(done);
              } catch (error) {
                reject(error);
              }
            })
          : fn();
      };
      tests[label] = run;
      const result = await maybeRunTest(label);
      const color = result === "ok" ? "green" : "red";
      return html`<div class="testresult" style="font: var(--mono_fonts); color: ${color}; padding: 6px 0;">
        <a name="testresult${encodeURIComponent(label)}"></a>
        ${label}: ${result}
        <a style="float:right" href="#testsuite${id}">goto suite</a>
      </div>`;
    }
  };


  {
    // Navigation widget : anchor scrolling for local links
    const isLocalLink = (a) =>
      a instanceof HTMLAnchorElement && a.getAttribute("href").match(/^#/);
    const scrollTo = (e) => {
      let l = e.target,
        t;
      if (
        isLocalLink(l) &&
        (t = document.querySelector(`[name="${l.hash.slice(1)}"]`))
      ) {
        e.preventDefault();
        t.scrollIntoView();
      }
    };
    document.addEventListener("click", scrollTo);
    //invalidation.then(() => document.removeEventListener("click", scrollTo));
    if (maybeInvalidation) {
  maybeInvalidation.then(() => document.removeEventListener("click", scrollTo));
  }
}

  const view = html`${generate()}`;
  view.value = api;
  return view;
}


/* ----- Exported: report (TAP output) ----- */


export function report(suite, { timeout = 10000 } = {}) {
  function tap(suite) {
    // Ugly indentation here to avoid whitespace in the TAP report.
    return `TAP version 13
1..${Object.keys(suite.results).length}
${Object.keys(suite.results)
  .sort()
  .map((name, index) => {
    let status = "not ok";
    let details = "";
    if (suite.results[name] === "ok") status = "ok";

    if (status === "not ok") {
      details = `\n  ---\n  message: ${JSON.stringify(
        suite.results[name]
      ).slice(0, 1000)}`;
    }
    return `${status} ${index + 1} - ${name}${details}`;
  })
  .join("\n")}`;
  }

  // This is a bit of a crappy poll loop
  // but its only intended for http handler use
  // https://stackoverflow.com/questions/30505960/use-promise-to-wait-until-polled-condition-is-satisfied
  return new Promise(function (resolve, reject) {
    function waitForResults() {
      if (!Object.values(suite.results).includes(undefined))
        return resolve(tap(suite));
      setTimeout(waitForResults, 100);
    }
    setTimeout(waitForResults, 1000);
  });
}


const suite = createSuite({
  timeout_ms: 5000
})


const JEST_EXPECT_STANDALONE_VERSION = "24.0.2"

export const expect = (async () => {
  console.log("loding expect");
  if (window.expect) return window.expect;
  return require(`jest-expect-standalone@${JEST_EXPECT_STANDALONE_VERSION}/dist/expect.min.js`).catch(() => {
    console.log("catch returning window.expect", window.expect)
    return window.expect;
  }).then(() => {
    console.log("then returning window.expect", window.expect)
    return window.expect;
  });
})();