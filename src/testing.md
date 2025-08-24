# Reactive Unit Testing and Reporting Framework

```js
//const url = FileAttachment("noun_test_2404407.svg").url()
```
<!--
// this is failing
<center>
<img width="30%" src=${url}></img>
</center>
-->

A test suite that updates as you fix bugs in realtime. Combines with [healthcheck](https://observablehq.com/@endpointservices/healthcheck) to create a CI.

  - Monitorable with [healthcheck](https://observablehq.com/@endpointservices/healthcheck)
  - Followable stack track from failure to implementation
  - filter tests by __regex__
  - rerun tests by pressing enter.
  - Familiar Jest expressions

Only matched tests are run, allowing you to focus on executing individual tests precisely.  


Import the suite
```
~~~js
    import {createSuite, expect} from '@tomlarkworthy/testing'
~~~
```

Create the UI

```
~~~js
    viewof suite = createSuite({
      name: "mySuite",
      timeout_ms: 1000
    })
~~~
```

Create named tests using [jest expect](https://jestjs.io/docs/en/expect).

```
~~~js
    suite.test("A passing test", () => {expect(true).toBe(true)})
~~~
```

See the [example here](https://observablehq.com/@tomlarkworthy/testing-example).


### Change log
- 2024-04-18 Added listenability with suite.viewofResults
- 2021-11-10 Remove TAP link, [healthcheck](https://observablehq.com/@endpointservices/healthcheck) is better. 
- 2020-03-23 TAP reports are now hosted by "orchestrator" cells so can be used to test serverless cell services
- 2020-02-14 Collaberation between [@chonghorizons](https://observablehq.com/@chonghorizons) and [@tomlarkworthy](https://observablehq.com/@tomlarkworthy) to add *timeout_ms* and explicit _done_() callback


## Lazy loading

You might not want testing to be a static dependancy, you can use something like the following to programatically load the testing library only if some condition is true. (thanks [@mootari](/@mootari) who donated this)

```
~~~js
testing = {
  const [{ Runtime }, { default: define }] = await Promise.all([
    import(
      "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"
    ),
    import(\`https://api.observablehq.com/@tomlarkworthy/testing.js?v=3\`)
  ]);
  const module = new Runtime().module(define);
  return Object.fromEntries(
    await Promise.all(
      ["expect", "createSuite"].map((n) => module.value(n).then((v) => [n, v]))
    )
  );
}
~~~
```


```js echo
const createSuite = ({
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
    // Navigation widget
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
    invalidation.then(() => document.removeEventListener("click", scrollTo));
  }

  const view = html`${generate()}`;
  view.value = api;
  return view;
}
```

```js echo
function report(suite, { timeout = 10000 } = {}) {
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
```

## Test Suite UI


```js
const suite = view(createSuite({
  timeout_ms: 5000
}))
```

#### The report links to an always on TAP report


```js
html`<pre>${await report(suite)}</pre>`
```

## Some Tests


```js echo
suite.test("sync pass", () => expect(true).toBe(true))
```

#### Demo of what a failing test looks like


```js echo
suite.test("sync fail", () => expect(true).toBe(false))
```

```js echo
suite.test("throw exception", () => {
  console.log("Run: Throws exception")
  expect(() => {
    throw new Error("Expected exception");
  }).toThrow();
})
```

```js echo
suite.test("asyncORIG - original function", async () => {
  console.log("Run: async function")
  await new Promise(resolve => setTimeout(resolve, 500));
  return "foo2"
})
```

### Some more async function tests

added by @chonghorizons, Feb2021`


#### Demo of timeout`


```js echo
suite.test("async0 - should fail, no resolve", async () => {
  console.log("Run: async function")
//  await new Promise(resolve => setTimeout(resolve, 1000));
  await new Promise( resolve => {});
})
```

```js echo
suite.test("async1 check returned data", async () => {
  await new Promise(resolve => setTimeout(()=>resolve("foo"), 1000))
    .then(data => {
    expect(data).toBe("foo");
  })
})
```

#### Demo of not calling _done_ will timeout


```js echo
suite.test("async2 function hanging example, should fail", done => {
  
});

// based on "unresolved" example at https://jestjs.io/docs/en/asynchronous

```

#### Demo of _done_ param is propogated as an error`

```js echo
suite.test("done arg is an error", done => {
  done(new Error("Not an error really"));
})

// based on "unresolved" example at https://jestjs.io/docs/en/asynchronous
```

#### Demo of normal errors will fail a test with _done_`


```js echo
suite.test("Failure with done raises error", async done => {
  expect(true).toBe(false);
})
```

```js echo
suite.test("async4: the data is peanut butter", () => {
  const fetchData = () => new Promise((resolve) => resolve("peanut butter"));
  return fetchData().then((data) => {
    expect(data).toBe("peanut butter");
  });
})

// adapted example from https://jestjs.io/docs/en/asynchronous
// not using await
```

## Results are listenable

```js echo
suite.viewofResults.value
```

```js
const html = htl.html
```

```js echo
//import { reconcile } from "@tomlarkworthy/reconcile-nanomorph"
//import { reconcile } from "/components/reconcile-nanomorph.js";
import morph from "https://cdn.jsdelivr.net/npm/nanomorph@5.4.2/+esm";
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
display(reconcile)
```

```js
const pseudouuid = () => Math.random().toString(16).substring(3)
```

```js echo
import {require} from "npm:d3-require";
const expect = (async () => {
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
```

```js
const JEST_EXPECT_STANDALONE_VERSION = "24.0.2"
```

```js
//import { customJsonFormatter } from "@tomlarkworthy/highlight"
```

```js
//import { footer } from "@tomlarkworthy/footer"
```

```js
//footer
```
