//# Resize FileAttachments on the fly with [serverless-cells](https://observablehq.com/@endpointservices/serverless-cells)


//import {signature} from '@mootari/signature'
import {signature} from '/components/signature.js'

//import {deploy} from '@endpointservices/serverless-cells'
import {deploy} from '/components/serverless-cells.js'

import markdownit from "markdown-it";

// --- Markdown helper -------------------------------------------------------------------------
const Markdown = new markdownit({html: true});

function md(strings) {
  let string = strings[0];
  for (let i = 1; i < arguments.length; ++i) {
    string += String(arguments[i]);
    string += strings[i];
  }
  const template = document.createElement("template");
  template.innerHTML = Markdown.render(string);
  return template.content.cloneNode(true);
}


function convert(src, width, height, mime) {
  return new Promise(resolve => {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height || ((img.height * canvas.width) / img.width);

      var ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high"
      // Resize
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // https://stackoverflow.com/questions/47913980/js-convert-an-image-object-to-a-jpeg-file
      canvas.toBlob(async (data)=> {
        resolve(await data.arrayBuffer())
      }, mime, 0.75);
    };
    img.src = src;
  });
}

export function resize(
  src,               // URL of an image
  width = 640,       // Desired width
  height = undefined // Desired height, undefined scales by aspect ratio
) {
  // One cool thing about serverless cells and its code sharing is we can define the backend
  // inline with the front end.
  const backend = deploy("resizer", async (req, res) => {
    const params = JSON.parse(decodeURIComponent(req.query.params))
    const mime = "image/jpeg"
    res.header("content-type", mime);
    res.header("cache-control", "public, max-age=604800, immutable") // Remember
    res.send(await convert(params.src, params.width, params.height, mime))
  })
  
  return `${backend.href}?params=${encodeURIComponent(JSON.stringify({
    src, width, height
  }))}` 
}


