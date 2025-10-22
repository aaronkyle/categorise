import { html } from "npm:htl";
import * as isoformat from "npm:isoformat";
import json2table from "npm:json5-to-table";

const blacklistRegex = /(\.){1}/g;

function isDate(value) {
  return value instanceof Date;
}

function isObject(a) {
  // https://stackoverflow.com/a/8511350
  return typeof a === "object" && !Array.isArray(a) && a !== null;
}

function cleanseData(d, opts, path) {
  function cleanseObject(o) {
    const newObj = {};
    for (const [k, v] of Object.entries(o)) {
      const currentPath = path == null ? k : `${path}.${k}`;
      newObj[cleanKey(k)] = cleanseData(v, opts, currentPath);
    }
    return newObj;
  }

  function cleanKey(k) {
    return k.replaceAll(blacklistRegex, "_");
  }

  if (Array.isArray(d)) {
    return d.map(cleanseObject);
  }

  if (isDate(d)) {
    return typeof opts.dateFormat === "function"
      ? opts.dateFormat(d, path)
      : d.toString();
  }

  if (isObject(d)) {
    return cleanseObject(d);
  }

  return typeof opts.format === "function" ? opts.format(d, path) : d;
}

function length(x) {
  return x == null ? null : typeof x === "number" ? `${x}px` : `${x}`;
}

export function formatTable(
  data,
  props, // See https://github.com/yetrun/json5-to-table#props%E5%AE%9A%E5%88%B6%E5%B5%8C%E5%A5%97%E5%B1%9E%E6%80%A7
  opts = {},
) {
  const options = Object.assign(
    {
      // Format Date data types. Use path to selectively format.
      dateFormat: (datum, path) => isoformat.format(datum),

      // Format all values. Use path to selectively format.
      // 📝 dateFormat take precedence for Date types
      format: (datum, path) => datum,

      height: 274, // Set height of the table. Default is on the Inputs.table
      width: null, // Set width of the table.
    },
    opts,
  );

  const minHeight = 33;
  let { height, width } = options;
  const copy = cleanseData(data, options);

  height = height > minHeight ? height : null;

  const generateHTMLTableoptions = {
    attributes: {
      table: {
        // Based on Observable table styles
        style: `
max-width: initial;
${minHeight != null ? `min-height: ${length(minHeight)};` : ""}
margin: 0;
border-spacing: 0;
font-variant-numeric: tabular-nums;`,
      },
      th: {
        style: `padding: 3px 6.5px; position: sticky; top: 0; background: #fff;`,
      },
      td: {
        style: `padding: 3px 6.5px`,
      },
    },
  };

  const tableHtmlString = html({
    raw: [json2table.generateHTMLTable(copy, props, generateHTMLTableoptions)],
  });

  return html`<div
    style="overflow-x: auto;${height
      ? `max-height: ${height}px;`
      : ""}${width != null ? `width: ${length(width)};` : ""}"
  >
    ${tableHtmlString}
  </div>`;
}