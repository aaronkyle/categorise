# Indented ToC



```js
import * as DOM from "/components/DOM.js"
```

This notebook can generate a Table of Contents (ToC), with indentations, automatically for your notebook.

This notebook is a fork of [Bryan Hughes’s Intended ToC](https://observablehq.com/@nebrius/indented-toc) with option to **exclude headings from selected DOM elements.**

_Note:_ Clicking on links in Safari doesn't work because [scrollIntoView in an iFrame doesn't really work correctly](https://www.javaer101.com/en/article/11885549.html)`


```js
toc({
  headers: "h2,h3,h4",
  hideStartingFrom: "Implementation"
})
```

## Usage

Import this notebook with:

      \`\`\`js
      import {toc} from "@saneef/indented-toc"
      \`\`\`


### Basic Example

You can create the table of contents for a notebook with the following call:

      \`\`\`JavaScript
      toc()
      \`\`\`

This call produces the following ToC for this notebook:


```js
toc()
```

### Customizing Included Header Levels
If you don't like which header levels are included in the ToC by default, you can customize which header levels to include:

      \`\`\`JavaScript
      toc("h2,h3,h4")
      \`\`\`

or:

      \`\`\`JavaScript
      toc({
        headers: "h2,h3,h4"
      })
      \`\`\`

This call produces the following ToC for this notebook:


```js
const selected_headers_toc = toc({
  headers: "h2,h3,h4"
})
```

${selected_headers_toc}

### Hiding an Appendix
If your notebooks are like mine, you might have a section titled "appendix," "implementation," or similar section to house implementation details. You can hide this section with the following call:

      \`\`\`JavaScript
      toc({
        hideStartingFrom: "Implementation"
      })
      \`\`\`

This call produces the following ToC for this notebook:


```js
const hide_appednix_toc = toc({
  hideStartingFrom: "Implementation"
})
```

${hide_appednix_toc}


### Customizing or Hiding the Title
If you would like to change the title, you can change it with:

      \`\`\`JavaScript
      toc({
        title: "My Table of Contents"
      })
      \`\`\`

This call produces the following ToC for this notebook:


```js
const retitled_toc = toc({
  title: "My Table of Contents"
})
```

${retitled_toc}


You can also hide the title by passing in \`null\` for the title value:

      \`\`\`JavaScript
      toc({
        title: null
      })
      \`\`\`

This call produces the following ToC for this notebook:


```js echo
const hide_title_toc = toc({
  title: null
})
```

${hide_title_toc}

### Excluding headings with a DOM element
If you would like to ignore headings with a DOM element.
      \`\`\`html
      <div class="ignore-in-toc">
        <h2>Not important heading</h2>
      </div>
      \`\`\`

      \`\`\`JavaScript
      toc({
        exclude: ".ignore-in-toc"
      })
      \`\`\`

This call produces the following ToC for this notebook:


```js echo
const exclude_toc = toc({
  exclude: ".ignore-in-toc"
})
```

${exclude_toc}

### Bringing it All Together
All of the options can be combined together to create a more highly customized ToC

    \`\`\`JavaScript
    toc({
      headers: "h2,h3,h4",
      title: "My ToC",
      hideStartingFrom: "Implementation"
    })
    \`\`\`

This call produces the following ToC for this notebook:


```js echo
const combined_toc = toc({
  headers: "h2,h3,h4",
  title: "My ToC",
  hideStartingFrom: "Implementation"
})
```

${combined_toc}

## API

The \`toc\` method has the following signature:

    \`\`\`TypeScript
    function toc(
      options?: string | { headers?: string, title?: string | null, hideStartingFrom?: string, exclude?: string}
    ): MutationObserver
    \`\`\`

Note: This signature is written using TypeScript syntax.

Options has the following defaults:
- headers = "h1,h2,h3",
- hideStartingFrom = null,
- title = "Table of Contents"


## Implementation

```js echo
function toc(options = {}) {
  if (typeof options === "string") options = { headers: options };

  const {
    headers = "h1,h2,h3",
    hideStartingFrom = null,
    title = "Table of Contents",
    exclude
  } = options;

  return Generators.observe((notify) => {
    let previousHeadings = [];
    let renderedEmptyToC = false;

    const ensureId = (el) => {
      if (el.id) return el.id;
      const base = (el.textContent || "").trim().toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-")
        .replace(/^\-|\-$/g, "") || "section";
      let id = base, i = 1;
      while (document.getElementById(id)) id = `${base}-${i++}`;
      el.id = id;
      return id;
    };

    function observed() {
      let currentHeadings = Array.from(document.querySelectorAll(headers));

      if (exclude) {
        currentHeadings = currentHeadings.filter((h) => !h.closest(exclude));
      }

      // Nothing to render
      if (!currentHeadings.length) {
        if (!renderedEmptyToC) {
          notify(html`<div>Unable to generate ToC: no headings found</div>`);
          renderedEmptyToC = true;
        }
        return;
      }

      // Bail if unchanged
      if (
        currentHeadings.length === previousHeadings.length &&
        !currentHeadings.some((h, i) => previousHeadings[i] !== h)
      ) return;

      renderedEmptyToC = false;
      previousHeadings = currentHeadings.slice();

      // Determine the leftmost level (e.g., 2 for h2)
      const startIndentation = headers
        .split(",")
        .map((h) => parseInt(h.replace(/h/gi, ""), 10))
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b)[0] ?? 1;

      // Build the nested list
      const container = document.createElement("div");
      const frag = document.createDocumentFragment();

      if (title) frag.append(html`<b>${DOM.text(title)}</b>`);

      let currentIndentation;
      let ulStack = [];

      const openUl = () => {
        const ul = document.createElement("ul");
        (ulStack[ulStack.length - 1] ?? frag).appendChild(ul);
        ulStack.push(ul);
      };
      const closeUl = () => { ulStack.pop(); };

      for (const h of currentHeadings) {
        if (hideStartingFrom && h.textContent === hideStartingFrom) break;

        const nodeIndentation = parseInt(h.tagName[1], 10);

        if (typeof currentIndentation === "undefined") {
          currentIndentation = startIndentation;
          // open lists until we reach the first heading level
          while (nodeIndentation > currentIndentation) {
            openUl();
            currentIndentation++;
          }
          if (ulStack.length === 0) openUl(); // at least one UL
        } else {
          while (currentIndentation < nodeIndentation) {
            openUl();
            currentIndentation++;
          }
          while (currentIndentation > nodeIndentation) {
            closeUl();
            currentIndentation--;
          }
          if (ulStack.length === 0) openUl(); // safety
        }

        const id = ensureId(h);
        const li = html`<li><a href="#${id}">${DOM.text(h.textContent)}</a></li>`;
        li.onclick = (e) => {
          // preserve anchor while making scrolling smooth
          // (browser default jump works too if you prefer)
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView();
          history.replaceState(null, "", `#${id}`);
        };
        ulStack[ulStack.length - 1].append(li);
      }

      // Close down to the start level
      while ((currentIndentation ?? startIndentation) > startIndentation) {
        closeUl();
        currentIndentation--;
      }

      container.append(frag);
      notify(container);
    }

    const observer = new MutationObserver(observed);
    observer.observe(document.body, { childList: true, subtree: true });
    observed();
    return () => observer.disconnect();
  });
}
```

## Appendix

```js
html`<div class="ignore-in-toc">
  <h2>A level 2 heading</h2>
</div>`
```
