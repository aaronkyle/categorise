# TOC

This notebook can generate a table of contents automatically for your notebook.


```js
import markdownit from "npm:markdown-it";
```

```js
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


      \`\`\`js
      import {toc} from "@bryangingechen/toc"
      \`\`\`

Here’s an example:

```js echo
//toc()
const document_toc = toc("h1,h2,h3,h4,h5,h6")
```

${document_toc}

## Implementation

```js echo
function toc(selector = "h1,h2,h3,h4,h5,h6") {
  return Generators.observe(notify => {
    let headings = [];

    function observed() {
      const h = Array.from(document.querySelectorAll(selector));
      // if (h.length !== headings.length || h.some((h, i) => headings[i] !== h)) {
      //   notify(html`<b>Table of Contents</b><ul>${Array.from(headings = h, h => {
      //     const level = parseInt(h.tagName.slice(1));
      //     return Object.assign(
      //       html`${level > 1 ? '<ul>'.repeat(level-1) + '<li>' : '<li>'}<a href=#${h.id}>${DOM.text(h.textContent)}`,
      //       {onclick: e => (e.preventDefault(), h.scrollIntoView())}
      //     );
      //   })}`);
        if (h.length !== headings.length || h.some((heading, i) => headings[i] !== heading)) {
        headings = h;
        const tocContent = document.createElement('div');
        tocContent.innerHTML = `<b>Contents</b>${generateTOC(headings)}`;
        notify(tocContent);
      }
    }

// newly added for porting to Framework
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
