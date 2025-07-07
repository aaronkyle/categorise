# [@observablehq/inspector@5.0.1](https://github.com/observablehq/inspector)
## also see [@observablehq/inspector](https://observablehq.com/@observablehq/inspector)
```js
    import {inspect, Inspector} from '@tomlarkworthy/inspector'
```

```js
function inspect(value) {
  const root = document.createElement("DIV");
  new Inspector(root).fulfilled(value);
  const element = root.firstChild;
  element.remove();
  element.value = value; // for viewof
  return element;
}
```

```js echo
src = unzip(FileAttachment("inspector-5@1.0.1.js.gz"))
```

```js
unzip = async (attachment) => {
  const response = await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  );

  return response.blob();
}
```

```js
Inspector = {
  const objectURL = URL.createObjectURL(
    new Blob([src], { type: "application/javascript" })
  );
  try {
    return (await require(objectURL)).Inspector;
  } finally {
    URL.revokeObjectURL(objectURL); // Ensure URL is revoked after import
  }
}
```

```js
// https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/index.js#L66C10-L69C2
isnode = (value) => {
  return (
    (value instanceof Element || value instanceof Text) &&
    value instanceof value.constructor
  );
}
```

```js echo

```
