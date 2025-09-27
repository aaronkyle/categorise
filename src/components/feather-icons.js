// # Feather Icons
// Code in this notebook derived from https://observablehq.com/@saneef/feather-icons

//import markdownit from "npm:markdown-it";
import markdownit from "markdown-it";


const version = "4.28.0"

// const featherIcons = import(`https://cdn.skypack.dev/feather-icons@${version}?min`)
const featherIcons = await import(`https://cdn.skypack.dev/feather-icons@${version}?min`)

const icons = featherIcons.icons


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

export const getIconSvg = (name, size = 24, attrs = {}) => {
  const icon = icons[name];

  if (icon) {
    return icon.toSvg({ ...attrs, width: size, height: size });
  }
}

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
