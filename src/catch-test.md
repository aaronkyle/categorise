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



