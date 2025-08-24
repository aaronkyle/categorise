# TOC

This notebook can generate a table of contents automatically for your notebook.

\`\`\`js
import {toc} from "@bryangingechen/toc"
\`\`\`

Here’s an example:

```js echo
display(toc())
```

## Implementation

```js echo
//added/
import {DOM} from "/components/DOM.js";
import {Generators} from "npm:@observablehq/stdlib";
```

```js echo
function toc(selector = "h2,h3,h4,h5,h6") {
  return Generators.observe(notify => {
    let headings = [];

    function observed() {
      const h = Array.from(document.querySelectorAll(selector));
      if (h.length !== headings.length || h.some((heading, i) => headings[i] !== heading)) {
        headings = h;
        const tocContent = document.createElement('div');
        tocContent.innerHTML = `<b>Contents</b>${generateTOC(headings)}`;
        notify(tocContent);
      }
    }

    function generateTOC(headings) {
      return `<ul>${headings.map(h => {
        const level = parseInt(h.tagName.slice(1));
        return `${'<ul>'.repeat(level - 1)}<li><a href="#${h.id}">${h.textContent}</a></li>${'</ul>'.repeat(level - 1)}`;
      }).join('')}</ul>`;
    }

    const observer = new MutationObserver(observed);
    observer.observe(document.body, {childList: true, subtree: true});
    observed();
    return () => observer.disconnect();
  });
}
```



## Hooray

It worked!

### This is a sub-section

A little text

#### A sub-sub-section?

##### A sub-sub-sub-section?

###### A sub-sub-sub-sub-section! (h6!)

### Another sub-section
