// # jest-expect-standalone@24.0.2
// Code in this notebook derived from https://observablehq.com/@tomlarkworthy/jest-expect-standalone

export const unzip = async (attachment) =>
  await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  ).blob();
display(unzip)

export const expect = await ( async () => {
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
