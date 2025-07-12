# [@observablehq/inspector@5.0.1](https://github.com/observablehq/inspector)
## also see [@observablehq/inspector](https://observablehq.com/@observablehq/inspector)


<!--
https://observablehq.com/@tomlarkworthy/inspector
-->

```
~~~js
    import {inspect, Inspector} from '@tomlarkworthy/inspector'
~~~
```



```js echo
import {require as d3require} from "npm:d3-require";
display(d3require)
```


```js echo
const unzip = async (attachment) => {
  const response = await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  );

  return response.blob();
};
display(unzip)
```

```js echo
const src = unzip(FileAttachment("/components/inspector-5@1.0.1.js.gz"));
display(unzip)
```



```js echo
function inspect(value) {
  const root = document.createElement("DIV");
  new Inspector(root).fulfilled(value);
  const element = root.firstChild;
  element.remove();
  element.value = value; // for viewof
  return element;
};
display(inspect)
```



```js echo
const Inspector = (await (async () => {
  const objectURL = URL.createObjectURL(
    new Blob([src], { type: "application/javascript" })
  );
  try {
    return (await d3require(objectURL)).Inspector;
  } finally {
    URL.revokeObjectURL(objectURL);
  }
})());
display(Inspector)
```

```js
// https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/index.js#L66C10-L69C2
const isnode = (value) => {
  return (
    (value instanceof Element || value instanceof Text) &&
    value instanceof value.constructor
  );
};
display(isnode)
```
