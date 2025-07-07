# [aws4fetch](https://github.com/mhart/aws4fetch)
```js
    import {AwsClient, AwsV4Signer} from '@tomlarkworthy/aws4fetch'
```

```js
aws4fetch = {
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
}
```

```js
AwsClient = aws4fetch.AwsClient
```

```js
AwsV4Signer = aws4fetch.AwsV4Signer
```
