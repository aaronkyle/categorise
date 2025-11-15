# [aws4fetch](https://github.com/mhart/aws4fetch)

This is a port of an Observable notebook by <a href="https://observablehq.com/@tomlarkworthy">Tom Larkworthy</a> [@tomlarkworthy] called <a href="https://observablehq.com/@tomlarkworthy/aws4fetch">aws4fetch</a>. All mistakes and deviations from the original are my own.</div>

---

```
~~~js
    import {AwsClient, AwsV4Signer} from '@tomlarkworthy/aws4fetch'
~~~
```

https://observablehq.com/@tomlarkworthy/aws4fetch

```js echo
const aws4fetch = await (async () => {
  const response = await new Response(
    (
      await FileAttachment("aws4fetch.esm.js.gz").stream()
    ).pipeThrough(new DecompressionStream("gzip"))
  );

  const blob = await response.blob();
  const objectURL = URL.createObjectURL(
    new Blob([blob], { type: "application/javascript" })
  );

  try {
    return await import(objectURL);
  } finally {
    URL.revokeObjectURL(objectURL); // Ensure URL is revoked after import
  }
})();
display(aws4fetch)
```


```js
display(AwsClient)
```

```js echo
const AwsClient = aws4fetch.AwsClient
```


```js
display(AwsV4Signer)
```

```js echo
const AwsV4Signer = aws4fetch.AwsV4Signer
```
