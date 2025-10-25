//# LocalFileAttachment

// Code in this notebook derived from https://observablehq.com/@mbostock/localfile
import { FileAttachment } from "observablehq:stdlib";


// ERROR: file 'empty' not found
export const AbstractFile = FileAttachment("empty").constructor.__proto__
