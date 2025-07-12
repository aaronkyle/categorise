//import { require as d3require } from "npm:d3-require";
import { require as d3require } from "d3-require";
import {FileAttachment} from "observablehq:stdlib";

// Unzips a gzipped FileAttachment
export const unzip = async (attachment) => {
  const response = await new Response(
    (await attachment.stream()).pipeThrough(new DecompressionStream("gzip"))
  );
  return response.blob();
};

export const src = await unzip(FileAttachment("/components/inspector-5@1.0.1.js.gz"));

// Creates an Inspector view
export function inspect(value) {
  const root = document.createElement("DIV");
  new Inspector(root).fulfilled(value);
  const element = root.firstChild;
  element.remove();
  element.value = value; // for viewof
  return element;
};

// Creates an Inspector view
export const Inspector = (await (async () => {
  const objectURL = URL.createObjectURL(
    new Blob([src], { type: "application/javascript" })
  );
  try {
    return (await d3require(objectURL)).Inspector;
  } finally {
    URL.revokeObjectURL(objectURL);
  }
})());



// Utility to test if a value is a DOM node (used by Observable Inspector)
// https://github.com/observablehq/inspector/blob/dba0354491fae7873d72f7cba485c356bac7c8fe/src/index.js#L66C10-L69C2
export const isnode = (value) => {
  return (
    (value instanceof Element || value instanceof Text) &&
    value instanceof value.constructor
  );
};
