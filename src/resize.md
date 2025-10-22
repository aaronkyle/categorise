# Resize FileAttachments on the fly with [serverless-cells](https://observablehq.com/@endpointservices/serverless-cells)


<mark>FileAttachments.image(...) supports props like width or style now, rendering this library pointless</mark> (there is some minor utility that this library does it server side so traffic is minimized, but it tends to be slow so I personally would still not use this method


Often, when copy and pasting, my FileAttachments are too big for markdown. I can switch to HTML, but thats hard work. So here is a use of [Serverless cells](https://observablehq.com/@endpointservices/serverless-cells) and the CDN caching which can resize an image on the fly and caches the result.

All you need to do is decorate the url with "resize" which creates a new URL to an inline image service that does the resizing.

    ~~~js
    import {resize} from '@endpointservices/resize'
    ~~~


I DON'T THINK THIS WORKS WITH FILE ATTACHMENTS ANYMORE, the URL is not stable or something


```js
signature(resize, {

  description: "Returns a URL that serves a resized image, slow the first time, but result is cached. Your notebook must be published or link shared first."
})
```

```js echo
function resize(
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
```

```js echo
//import {signature} from '@mootari/signature'
import {signature} from '/components/signature.js'
display(signature)
```

```js echo
//import {deploy} from '@endpointservices/serverless-cells'
import {deploy} from '/components/serverless-cells.js'
display(deploy)
```

```js echo
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
```

```js echo
md`
  ## Example

  ### Too big!
  ![](${await FileAttachment("image.png").url()})

  ### Inline resizing
  
  ![](${resize(await FileAttachment("image.png").url(), 400)})
`
```

```js
//import { footer } from "@endpointservices/endpoint-services-footer"
```

```js
//footer
```


```js
import markdownit from "npm:markdown-it";

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
```