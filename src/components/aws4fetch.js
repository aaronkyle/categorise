
//# aws4fetch
// Code is derived from https://observablehq.com/@tomlarkworthy/aws4fetch

//# [aws4fetch](https://github.com/mhart/aws4fetch) (export)



export const aws4fetch = await (async () => {
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
})()

export const AwsClient = aws4fetch.AwsClient

export const AwsV4Signer = aws4fetch.AwsV4Signer
