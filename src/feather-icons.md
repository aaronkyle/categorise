# Feather Icons

<div class="tip">
  This notebook ports to Observable Framework a notebook by Saneef H. Ansari
  <a href="https://observablehq.com/@saneef" target="_blank" rel="noopener noreferrer">@saneef</a> called <a href="https://observablehq.com/@saneef/feather-icons" target="_blank" rel="noopener noreferrer">Feather Icons</a>. <br/>
  All mistakes and deviations from the original are my own.
</div>

[Feather Icons](https://feathericons.com/) is a open source collection of SVG icons.

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

```js
md`## Usage

### Show some icon

~~~js
     html\`\${getIconSvg("arrow-up-right")}\`
~~~

This will give you icon at the default size, 24x24: ${getIconSvg(
  "arrow-up-right"
)}

You can provide size as second argument:
~~~js
    html\`\${getIconSvg("arrow-up-right", 16)}\`
~~~
to get icon with 16x16 size: ${getIconSvg("arrow-up-right", 16)}. This will set the \`width\` and \`size\` attributes on the \`<svg>\` tag. You  'll still be able to override using CSS.

You can change color using CSS \`color\` property on parent:
~~~js
    html\`<span style="color: orange">\${getIconSvg("arrow-up-right")}</span>\`
~~~
to get colored icon: <span style="color: orange">${getIconSvg(
  "arrow-up-right"
)}</span>
`
```

```js echo
() => {
  let iconRows = "";

  for (const [name, icon] of Object.entries(icons)) {
    const defaultSized = getIconSvg(name);
    const description = icon.tags.join(", ");
    iconRows += `|${defaultSized}|${name}|${description}|\n`;
  }

  return md`## Available Icons

|Icon|Name|Description|
|:--:|:---|:---|
${iconRows}`;
}
```

```js echo
const getIconSvg = (name, size = 24, attrs = {}) => {
  const icon = icons[name];

  if (icon) {
    return icon.toSvg({ ...attrs, width: size, height: size });
  }
}
```

```js echo
const version = "4.28.0"
```

## Imports

```js
const featherIcons = import(`https://cdn.skypack.dev/feather-icons@${version}?min`)
```

```js
const icons = featherIcons.icons
```

## Credits

This notebook is based on [@nikita-sharov](https://observablehq.com/@nikita-sharov)'s [Feather Icons](https://observablehq.com/@nikita-sharov/feather-icons)
