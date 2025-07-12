# [aws4fetch](https://github.com/mhart/aws4fetch)

<!--
https://observablehq.com/@tomlarkworthy/aws4fetch
-->
```
~~~js
    import {AwsClient, AwsV4Signer} from '@tomlarkworthy/aws4fetch'
~~~
```

```js echo
display(await FileAttachment("/components/aws4fetch.esm.js.gz").stream()
    ).pipeThrough(new DecompressionStream("gzip"))
```

```js echo
const aws4fetch = await (async () => {
  const response = await new Response(
    (
      await FileAttachment("/components/aws4fetch.esm.js.gz").stream()
    ).pipeThrough(new DecompressionStream("gzip"))
  );

  const blob = await response.blob();
  const objectURL = URL.createObjectURL(
    new Blob([blob], { type: "application/javascript" })
  );

  try {
    return await import(objectURL);
  } finally {
    URL.revokeObjectURL(objectURL);
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
