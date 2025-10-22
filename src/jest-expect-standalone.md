# jest-expect-standalone@24.0.2

<div class="tip">
  This notebook ports to Observable Framework a notebook by Tom Larkworthy
  <a href="https://observablehq.com/@tomlarkworthy" target="_blank" rel="noopener noreferrer">@tomlarkworthy</a> called <a href="https://observablehq.com/@tomlarkworthy/jest-expect-standalone" target="_blank" rel="noopener noreferrer">jest-expect-standalone@24.0.2</a>. <br/>
  All mistakes and deviations from the original are my own.
</div>

```
    ~~~js
    import {expect} from "@tomlarkworthy/jest-expect-standalone"
    ~~~
```

```js echo
const expect = await ( async () => {
  const blob = await unzip(
    FileAttachment("jest-expect-standalone-24.0.2.js.gz")
  );

  const objectURL = URL.createObjectURL(
    new Blob([blob], { type: "application/javascript" })
  );
  try {
    await import(objectURL);
    return window.expect;
  } finally {
    URL.revokeObjectURL(objectURL);
  }
})();
display(expect)
```

```js echo
const unzip = async (attachment) =>
  await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  ).blob();
display(unzip)
```
