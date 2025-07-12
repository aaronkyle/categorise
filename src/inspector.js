import { require as d3require } from "npm:d3-require";

// Unzips a gzipped FileAttachment
export const unzip = async (attachment) => {
  const response = await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  );
  return response.blob();
};

// Load Inspector class dynamically from gzipped JS source (provided as a Blob)
export const loadInspector = async (src) => {
  const objectURL = URL.createObjectURL(
    new Blob([src], { type: "application/javascript" })
  );
  try {
    return (await d3require(objectURL)).Inspector;
  } finally {
    URL.revokeObjectURL(objectURL);
  }
};

// Utility to test if a value is a DOM node (used by Observable Inspector)
// https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/index.js#L66C10-L69C2
export const isnode = (value) => {
  return (
    (value instanceof Element || value instanceof Text) &&
    value instanceof value.constructor
  );
};

// Creates an Observable-compatible Inspector view
export function inspect(value, InspectorClass) {
  const root = document.createElement("div");
  new InspectorClass(root).fulfilled(value);
  const element = root.firstChild;
  element.remove();
  element.value = value; // For viewof
  return element;
}
