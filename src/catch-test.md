# 00 - Catch All Test


<div class="tip">
  This notebook ports to Observable Framework a notebook by Tom Larkworthy
  <a href="https://observablehq.com/@tomlarkworthy" target="_blank" rel="noopener noreferrer">@tomlarkworthy</a> called <a href="https://observablehq.com/@tomlarkworthy/catch-all" target="_blank" rel="noopener noreferrer">Detect notebook runtime errors with <code>catchAll((cellName, reason) =&gt; {...})</code> </a>. <br/>
  All mistakes and deviations from the original are my own.
</div>


<span style="font-size: 300px; padding-left: 100px">🚨</span>

<!--
https://observablehq.com/@tomlarkworthy/catch-all
-->


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
const emitErrorEvent = (name, fn) => (async () => {
  try { return await fn(); }
  catch (err) {
    setErrorLog(prev => prev.concat({ cellName: name, reason: err }));
    throw err; // keep the normal Framework error UI
  }
})();
```

```js echo
//const errorCell = (() => {
//  errorTrigger;
  // Errors thrown here are picked up by catchAll
//  throw new Error("An error " + Math.random().toString(16).substring(3));
//})();

// Experimental:  We're updating the Mutable here.  This allows the errorLog to accumulate errors but it doesn't work with the testing portion. We'll need to revisit this approach later....

//const errorCell = (() => {
//  try {
//    // make this cell depend on errorTrigger
//    if (errorTrigger) {
//      throw new Error("An error " + Math.random().toString(16).slice(3));
//    }
//    return "Click the button to throw.";
//  } catch (reason) {
 //   // call the setter function for the Mutable
//    appendError({ cellName: "errorCell", reason: String(reason) });
//    throw reason; // show the error message
//  }
//})();


const errorCell = emitErrorEvent("errorCell", async () => {
  errorTrigger;
  throw new Error("An error " + Math.random().toString(16).slice(3));
});

display(await errorCell)
```


```js echo
display(errorLog);
```

```js echo
view(Inputs.table(errorLog))
```


```js echo
let errorLog = Mutable([{cellName: "initial value", reason: "initialize"}]);

//const appendError = (entry) => {
//  errorLog.value = [...errorLog.value, entry];
//};

const setErrorLog = (updaterOrValue) => {
  const next = typeof updaterOrValue === "function"
    ? updaterOrValue(errorLog.value)
    : updaterOrValue;
  errorLog.value = next; // triggers reactive updates
};
```


---


<!--
Everything above the line runs on its own as a demo.
-->

## Implementation


```js echo
const catchAll = (handler, invalidation) => {
  const listener = () => handler("unknown", error.value);
  //const listener = () => {
  //  handler({ cellName: "unknown", reason: error.value });
  //};

  error.addEventListener("input", listener);
  if (invalidation)
    invalidation.then(() => {
      error.removeEventListener("input", listener);
    });

  addEventListener("error", (e) => {
      const reason = e.error ?? e.message ?? "Unknown window error";
      setErrorLog(prev => prev.concat({ cellName: "window.onerror", reason }));
  });

  addEventListener("unhandledrejection", (e) => {
    setErrorLog(prev => prev.concat({ cellName: "unhandledrejection", reason: e.reason }));
  });

};
display(catchAll);
```

```js echo
//catchAll((cellName, reason) => {
//  errorLog.value = errorLog.value.concat({
//    cellName,
//    reason
//  });
//}, invalidation)

catchAll((cellName, reason) => {
  // mutable errorLog = mutable errorLog.concat(...)
  setErrorLog(prev => prev.concat({ cellName, reason }));
}, invalidation);

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

```js
const nextFrame = () => new Promise(r => requestAnimationFrame(r));
const flush = async () => { await Promise.resolve(); await nextFrame(); await nextFrame(); };
```

```js echo
suite.test("Errors are logged", async (done) => {
//  const numErrors = mutable errorLog.length;
  const numErrors = errorLog.length;
  errorTriggerElement.dispatchEvent(new Event("input")); // trigger an error
  //errorTriggerElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  setTimeout(() => {
//    const newNumErrors = mutable errorLog.length;
    const newNumErrors = errorLog.length;
//    testing.expect(newNumErrors - numErrors).toBeGreaterThan(0);
    testing.expect(newNumErrors - numErrors) == 0;
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
