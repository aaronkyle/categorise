# URL querystrings and hash parameters

\`location.search\` and \`location.hash\` are now available for use in your notebooks (by being passed down from the parent frame). For example, click [this link](${
  new URL(document.baseURI).pathname
}?one=1&two=2) to add a querystring to this notebook’s URL.

The value of \`location.search\` is: \`${location.search}\``


And we can use the normal \`hashchange\` event to respond to changes in \`location.hash\`, which is currently: \`${hash}\`.

```js echo
const hash = Generators.observe(notify => {
  const hashchange = () => notify(location.hash);
  hashchange();
  addEventListener("hashchange", hashchange);
  return () => removeEventListener("hashchange", hashchange);
})
```

This is Markdown with some simple hashful links:

- [#simple](${document.baseURI}#simple) 
- [#hashful](${document.baseURI}#hashful) 
- [#links](${document.baseURI}#links)`
```

In general, you can use \`document.baseURI\` from within a notebook to get the browser’s current URL:

```js echo
document.baseURI
```
