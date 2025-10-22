# Detect notebook runtime errors with *catchAll((cellName, reason) => {...})*


<div class="tip">
  This notebook ports to Observable Framework a notebook by Tom Larkworthy
  <a href="https://observablehq.com/@tomlarkworthy" target="_blank" rel="noopener noreferrer">@tomlarkworthy</a> called <a href="https://observablehq.com/@tomlarkworthy/catch-all" target="_blank" rel="noopener noreferrer">Detect notebook runtime errors with <code>catchAll((cellName, reason) =&gt; {...})</code> </a>. <br/>
  All mistakes and deviations from the original are my own.
</div>

```
+--------------------------------------------------------------+
|  — The following text/narrative is from the original —       |
+--------------------------------------------------------------+
```

<span style="font-size: 300px; padding-left: 100px">🚨</span>

<!--
https://observablehq.com/@tomlarkworthy/catch-all
-->


*catchAll* registers a callback that will be informed of any uncaught cell errors in the notebook. 

---
Usage:

```
   ~~~js
   import {catchAll} from '@tomlarkworthy/catch-all'
   ~~~
```

### Change Log

- 2022-06-26, removed mootari/access-runtime and inspected cells instead. This loses the cellName, but does track new cells being added
  

#### note

You can pass an *invalidation* promise as the 2nd argument to clean up the observers, this is needed if you expect to be calling *catchAll* more than once.

### Demo

<!--
// FIGURE OUT HOW TO LINK TO MUTABLE SO THAT ITS VALUE CHANGES
// const errorTriggerEl = Mutable(null);
-->

```js echo
//viewof errorTrigger = Inputs.button(md`throw an error`, { required: true })

// Expose the input element separately from the view so that we can use it to dispatch events and add listeners
const errorTriggerElement = Inputs.button(html`throw an error`, { required: true });

const errorTrigger = view(Inputs.bind(Inputs.button(html`throw an error`, { required: true }), errorTriggerElement));
```

```js echo
display(errorTrigger);
```

```js
// For testing
// This displays as true where we use the pattern of separating an input element with DOM from the generator.
//display(errorTriggerElement.dispatchEvent(new Event("input")))
```


```js echo
//const errorCell = (() => {
//  errorTrigger;
  // Errors thrown here are picked up by catchAll
//  throw new Error("An error " + Math.random().toString(16).substring(3));
//})();

// Experimental:  We're updating the Mutable here.  This allows the errorLog to accumulate errors but it doesn't work with the testing portion. We'll need to revisit this approach later....

const errorCell = (() => {
  try {
    // make this cell depend on errorTrigger
    if (errorTrigger) {
      throw new Error("An error " + Math.random().toString(16).slice(3));
    }
    return "Click the button to throw.";
  } catch (reason) {
    // call the setter function for the Mutable
    appendError({ cellName: "errorCell", reason: String(reason) });
    throw reason; // show the error message
  }
})();

display(errorCell)
```


```js echo
display(errorLog);
```

```js echo
view(Inputs.table(errorLog))
```



### Implementation

```js echo
const catchAll = (handler, invalidation) => {
  const listener = () => handler("unknown", error); // `error` is the latest reactive value
  errorSource.addEventListener("input", listener);
  if (invalidation) invalidation.then(() => {
    errorSource.removeEventListener("input", listener);
  });
};
display(catchAll);
```


```js echo
display(errorLog);
```


```js echo
let errorLog = Mutable([]);
const appendError = (entry) => (errorLog.value = [...errorLog.value, entry]);
```

```js echo
// update the mutable using .value
catchAll((cellName, reason) => {
  errorLog.value = errorLog.value.concat({
    cellName,
    reason
  });
}, invalidation)
```



```js echo
// In the original notebook, this element is defined as a 'viewof'

const error = (() => {
  const view = Inputs.input();

  const notify = (event) => {
    view.value = event.detail.error;
    view.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const processInspectorNode = (el) => {
    el.addEventListener("error", notify);
  };

  // Attach to current cells
  [...document.querySelectorAll(".observablehq").values()].forEach(
    processInspectorNode
  );
  // Watch for new cells
  const root = document.querySelector(".observablehq-root");
  if (root) {
    const observer = new MutationObserver((mutationList, observer) => {
      for (const mutation of mutationList) {
        [...mutation.addedNodes].forEach(processInspectorNode);
      }
    });
    observer.observe(root, {
      childList: true
    });
    invalidation.then(observer.disconnect);
  }
  return view;
})();
display(error);
```





### Tests and CI

We load the testing framework asynchronously to avoid statically depending on test libraries in production use. We can externally check these tests pass with [healthcheck](https://webcode.run/observablehq.com/@endpointservices/healthcheck?target=%40tomlarkworthy%2Fcatch-all&excludes=errorCell&wait=5) which is passed to an external monitoring solution (see [howto-monitoring](https://observablehq.com/@tomlarkworthy/howto-monitoring)).

Continuous integration is important for a library like this where API changes in Observable can easily break the implementation.

```js echo
const testing = (async () => {
  
  errorTrigger, catchAll;

  const [{ Runtime }, { default: define }] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"),
    import("https://api.observablehq.com/@tomlarkworthy/testing.js?v=3")
  ]);

  const module = new Runtime().module(define);
  const entries = await Promise.all(
    ["expect", "createSuite"].map((n) => module.value(n).then((v) => [n, v]))
  );

   return Object.fromEntries(
    await Promise.all(
      ["expect", "createSuite"].map((n) => module.value(n).then((v) => [n, v]))
    )
  );
})();
```

```js echo
display(testing)
```

```js echo
const suite = view(testing.createSuite())
```

<!---
Investigate MUTABLE and use of .value
--->

```js
display(errorLog.length)
```

```js echo
suite.test("Errors are logged", async (done) => {
//  const numErrors = mutable errorLog.length;
  const numErrors = errorLog.length;
  errorTriggerElement.dispatchEvent(new Event("input")); // trigger an error
  setTimeout(() => {
//    const newNumErrors = mutable errorLog.length;
    const newNumErrors = errorLog.length;
    testing.expect(newNumErrors - numErrors).toBeGreaterThan(0);
    done();
  }, 500);
})

```


```js
//import { footer } from "@endpointservices/footer"
```

```js
//footer
```
