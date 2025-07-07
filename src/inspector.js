import { require as d3require } from "npm:d3-require";

// Async unzip function using DecompressionStream API
export const unzip = async (attachment) => {
  const response = await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  );
  return response.blob();
};

// Load Inspector class dynamically from gzipped JS source (provided as a Blob)
export const loadInspector = async (src) => {
  const objectURL = URL.createObjectURL(new Blob([src], { type: "application/javascript" }));
  try {
    return (await d3require(objectURL)).Inspector;
  } finally {
    URL.revokeObjectURL(objectURL);
  }
};

// Create an HTML view of a value using the Inspector
export const inspect = async (value, InspectorClass) => {
  const root = document.createElement("div");
  new InspectorClass(root).fulfilled(value);
  const element = root.firstChild;
  element.remove();
  element.value = value; // for viewof compatibility
  return element;
};

// Utility to test if a value is a DOM node (used by Observable Inspector)
export const isnode = (value) =>
  (value instanceof Element || value instanceof Text) &&
  value instanceof value.constructor;
