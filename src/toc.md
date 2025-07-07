```js
md`# TOC

This notebook can generate a table of contents automatically for your notebook.

\`\`\`js
import {toc} from "@bryangingechen/toc"
\`\`\`

Here’s an example:`
```

```js echo
toc()
```

```js
md`## Implementation`
```

```js echo
function toc(selector = "h1,h2,h3,h4,h5,h6") {
  return Generators.observe(notify => {
    let headings = [];

    function observed() {
      const h = Array.from(document.querySelectorAll(selector));
      if (h.length !== headings.length || h.some((h, i) => headings[i] !== h)) {
        notify(html`<b>Table of Contents</b><ul>${Array.from(headings = h, h => {
          const level = parseInt(h.tagName.slice(1));
          return Object.assign(
            html`${level > 1 ? '<ul>'.repeat(level-1) + '<li>' : '<li>'}<a href=#${h.id}>${DOM.text(h.textContent)}`,
            {onclick: e => (e.preventDefault(), h.scrollIntoView())}
          );
        })}`);
      }
    }

    const observer = new MutationObserver(observed);
    observer.observe(document.body, {childList: true, subtree: true});
    observed();
    return () => observer.disconnect();
  });
}
```

```js
md`## Hooray

It worked!`
```

```js
md`### This is a sub-section`
```

```js
md`A little text`
```

```js
md`#### A sub-sub-section?`
```

```js
md`##### A sub-sub-sub-section?`
```

```js
md`###### A sub-sub-sub-sub-section! (h6!)`
```

```js
md`### Another sub-section`
```
