# 00 - Catch All Test


<div class="tip">
This notebook ports a notebook by Tom Larkworthy [@tomlarkworthy] called [Detect notebook runtime errors with catchAll((cellName, reason) => {...})](https://observablehq.com/@tomlarkworthy/catch-all).  All mistakes and deviations from the original are my own.
</div>


<!--
// FIGURE OUT HOW TO LINK TO MUTABLE SO THAT ITS VALUE CHANGES
// const errorTriggerEl = Mutable(null);
-->

```js echo
// ORIGINAL
//viewof errorTrigger = Inputs.button(md`throw an error`, { required: true })

// PATTERN WERE I EXPOSE THE DOM SEPARATELY
// This approach doesn't work because the error button won't generate a new error
// Seems to be because the generator or view is always running
const errorTriggerElement = Inputs.button(html`throw an error`, { required: true });

// The generator serves no purpose here.
const errorTriggerGenerator = Generators.input(errorTriggerElement);

const errorTrigger = view(Inputs.bind(Inputs.button(html`throw an error`, { required: true }), errorTriggerElement));
```

```js echo
display(errorTrigger);
```

```js echo
display(errorTrigger.value);
```

```js echo
// This displays as true where we use the pattern of separating an input element with DOM from the generator.
display(errorTriggerElement.dispatchEvent(new Event("input")))
```

```js echo
//EXPERIMENTAL (not working)
// This doesn't take us any further in getting around the generator always running
//const errorTriggerBound = Inputs.bind(Inputs.button(html`throw an error`, { required: true }), errorTriggerElement)
```

```js echo
//EXPERIMENTAL (not working)
// This doesn't take us any further in getting around the generator always running
//const errorTriggerBoundDisplay = view(await errorTriggerBound)
```


```js echo
// With the separation of the DOM element and the generator, working in this cell is tricky.  The Element is not reactive.  The generator always runs.
// Look into setting up a separate input using bind and listening for that.
const errorCell = (() => {
  // Neither when linking this to errorTrigger not errorTrigger element does this work.
  errorTrigger;
  // Errors thrown here are picked up by catchAll
  throw new Error("An error " + Math.random().toString(16).substring(3));
})();
display(errorCell)
```

```js echo
const catchAll = (handler, invalidation) => {
  const listener = () => handler("unknown", error.value);

  // Listen on the element
//  error.addEventListener("input", listener);
// this doesn't work because no cells resolve.
  error.addEventListener("input", listener);
  if (invalidation)
    invalidation.then(() => {
//      error.removeEventListener("input", listener);
  error.removeEventListener("input", listener);
    });
};
display(catchAll)
```


```js echo
const errorLog = Mutable([]);

catchAll((cellName, reason) => {
  errorLog.value = errorLog.value.concat({
    cellName,
    reason
  });
}, invalidation)
```



```js echo
display(errorLog);
```

```js echo
// Experimenting here in changing to an element that later gets rendered as a view of generated.  So far this approach doesn't seem to work because a subsequent call to display(error) doesn't resolve (spinning wheel).

const error = (() => {
// When I try to use errorElement in 'catchAll`, the cells get locked up and stop rendering.

//const error = (() => {
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
//display(errorElement)
//display(error);

// removing this - prevented everything from rendering
//const errorGenerator = Generators.input(errorElement)
//const error = Generators.input(errorElement)

// this one didn't render downstream elements (spinning arrow)
//const error = view(errorElement)

// testing this just for fun
//const error = Inputs.bind(errorGenerator, errorElement)
```