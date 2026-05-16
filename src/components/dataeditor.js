//# Data Editor 

// 1) Imports

import { Generators } from "observablehq:stdlib";

import * as Inputs from "/components/inputs_observable.js";
import _ from "npm:lodash";

//import { view } from "@tomlarkworthy/view"
import { viewUI } from "/components/view.js"

import * as htl from "/components/htl@0.3.1.js";

const html = htl.html


// 2) Markdown setup
import markdownit from "npm:markdown-it";

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

// 3) UI toggles (independent utilities; keep if you plan to export/use them)

const selectableElement = Inputs.toggle({
  label: "select?",
  value: true
});
const selectable = Generators.input(selectableElement);


const deletableElement = Inputs.toggle({
  label: "delete?",
  value: true
});
const deletable = Generators.input(deletableElement);

// 4) Drag/drop style constants
const bottomBorder = 'solid 1px #ddd'
const topBorder = 'solid 1px transparent'
const dragBorder = 'solid 3px blue'


// 5) Helpers
function getTr(target) {
  if (!target) return false;
  while (
    target.nodeName.toLowerCase() != 'tr' &&
    target.nodeName.toLowerCase() != 'table'
  ) {
    target = target.parentNode;
  }
  if (
    target.nodeName.toLowerCase() == 'table' ||
    target.parentNode.nodeName.toLowerCase() == 'thead'
  ) {
    return false;
  } else {
    return target;
  }
}


function reset(li) {
  if (li) {
    li.style['border-top'] = topBorder;
    li.style['border-bottom'] = bottomBorder;
  }
}


const handle = (() => {
  const template = document.createElement("template");
  // Attaching the SVG as file had problems, we we jsut put it in as a literal for now
  // https://github.com/observablehq/feedback/issues/202
  template.content.appendChild(
    html`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`
  );
  return () => template.content.cloneNode(true);
})();


// 6) Main component


function dataEditor(
  data,
  options = {
    select: true,
    delete: true
  }
) {
  if (options.select !== false) options.select = true;
  if (options.delete !== false) options.delete = true;

  let dragging = null;
  let dragover = null;
  const selected = Inputs.input({});
  if (!options.tableclass)
    options.tableclass = options.tableClass || "dataeditor";
  if (!options.columns) options.columns = Object.keys(data[0]);

  const row = (row) => {
    const rowEl = viewUI`<tr style="border-top: ${topBorder}; border-bottom: ${bottomBorder}"">
      <td draggable="true">
        ${handle()}
      </td>
      ${
        options.select
          ? html`<td><input class="rowselect" type="checkbox" style="vertical-align: baseline; margin-right: 8px"/></td>`
          : ""
      }
      ${
        options.delete
          ? htl.html`<td><button style="width:30px; height:30px;" onclick=${() => {
              const index = [...table.data].findIndex(
                (e) => e === getTr(rowEl)
              );
              table.splice(index, 1);
              table.dispatchEvent(new Event("input", { bubbles: true }));
            }}>❌</button></td>`
          : ""
      }
      
        ${[
          "...",
          Object.fromEntries(
            options.columns.map((column, ci) => [
              column,
              viewUI`<td class="col-${column}">${[
                "...",
                (options.format || {})[column]
                  ? options.format[column](row[column])
                  : Inputs.text({ value: row[column], disabled: true })
              ]}
              </td>`
            ])
          )
        ]}
    </tr>`;
    return rowEl;
  };

  const table = viewUI`<table class=${options.tableclass} >
    <!-- ${["selected", selected]} -->
  <style>
    .${options.tableclass} {
      overflow-y: scroll;
      max-height: 400px;
      table-layout: fixed;
      display: block;
      max-width: 900px;
      width: 900px;
    }

    .${options.tableclass} th {
      position: sticky;
      top: 0;
      background-color: white;
    }
    .${options.tableclass} thead > tr {
      position: sticky;
      top: 0;
    }
    ${options.stylesheet}
  </style>
  <thead>
    <tr>
    <th style="width:20px;"></th>
    ${options.select ? html`<th style="width:20px;"></th>` : ""}
    ${options.delete ? html`<th style="width:40px;"></th>` : ""}
    ${options.columns.map(
      (column, ci) => viewUI`<th style=${{
        width: (options?.width || {})[column]
      }}>
        ${column}
      </th>`
    )}
    </tr>
  </thead>
  <tbody>
    ${["data", data.map(row), row]}
  </tbody></table>`;

  table.addEventListener("input", (evt) => {
    const checkboxes = [...table.querySelectorAll(".rowselect")];
    Object.keys(selected.value).forEach((i) => {
      console.log(i);
      if (i >= checkboxes.length || !checkboxes[i].checked) {
        delete selected.value[i];
      }
    });
    checkboxes.map((c, i) => {
      if (c.checked) selected.value[i] = true;
    });
  });

  function splice(index, numDelete, ...items) {
    const newData = [...table.data];
    newData.splice(
      index,
      numDelete,
      ...items.map((item, itemIndex) => row(item))
    );
    table.data.value = newData.map((sv) => sv.value);
  }

  function ondragstart(event) {
    var target = getTr(event.target);
    dragging = target;
    if (event.dataTransfer) event.dataTransfer.setData("text/plain", null);
  }

  function ondragover(event, eventTarget, clientY) {
    event.preventDefault();
    var target = getTr(eventTarget || event.target);
    if (!target) {
      reset(dragover);
      dragover = undefined;
    }
    var bounding = target.getBoundingClientRect();
    var offset = bounding.y + bounding.height / 2;

    reset(dragover);
    dragover = target;

    if ((clientY || event.clientY) - offset > 0) {
      target.style["border-bottom"] = dragBorder;
      target.style["border-top"] = topBorder;
      target.inserting = "below";
    } else {
      target.style["border-top"] = dragBorder;
      target.style["border-bottom"] = bottomBorder;
      target.inserting = "above";
    }
  }

  function ondragleave(event) {
    reset(dragover);
    dragover = null;
  }

  function ondrop(event) {
    event.preventDefault();
    const index = [...table.data].findIndex((e) => e === dragging);
    const newData = [
      ...[...table.data].slice(0, index),
      ...[...table.data].slice(index + 1, table.data.length)
    ];

    if (dragover.inserting === "below") {
      const insert = newData.findIndex((e) => e === dragover.nextSibling);
      newData.splice(insert === -1 ? newData.length : insert, 0, dragging);
    } else {
      const insert = newData.findIndex((e) => e === dragover);
      newData.splice(insert, 0, dragging);
    }
    reset(dragover);
    dragover = null;
    debugger;
    table.data.value = _.cloneDeep(newData.map((row) => row.value));
    const newEvent = new Event("input", { bubbles: true });
    newEvent.isUser = true;
    table.dispatchEvent(newEvent);
  }

  function ontouchstart(event) {
    if (event.target.draggable) {
      ondragstart(event);
    }
  }

  function ontouchmove(event) {
    if (dragging) {
      const target = document.elementFromPoint(
        event.touches[0].clientX,
        event.touches[0].clientY
      );
      if (target) {
        ondragover(event, target, event.touches[0].clientY);
      } else {
        reset(dragover);
        dragover = null;
      }
    }
  }

  function ontouchend(event) {
    if (dragging) {
      if (dragover) {
        ondrop(event);
      }
      ondragleave(event);
    }
    dragging = null;
  }

  return Object.assign(table, {
    splice,
    ondragstart,
    ondragover,
    ondragleave,
    ondrop,
    oninput,
    ontouchstart,
    ontouchmove,
    ontouchend
  });
}



// 7) “Add item” UI factory (fix the stray token and make it a const)
let newItem = () => {
  const newItem = viewUI`
    ${[
      "name",
      Inputs.text({
        label: "name",
        placeholder: "enter item name"
      })
    ]}
    ${[
      "qty",
      Inputs.range([0, 100], {
        label: "qty",
        value: 1,
        step: 1
      })
    ]}
    ${[
      "type",
      Inputs.select(["fruit", "vegetable"], {
        label: "type"
      })
    ]}
    ${Inputs.button("Add Item", {
      reduce: () => {
        // NOTE: requires an 'example' view/input object in the surrounding scope.
        example.data = [...example.data, newItem.value];
        example.dispatchEvent(new Event("input", { bubbles: true }));
      }
    })}
  `;
  return newItem;
};

// 8) Exports (named)
export {
  md,
  dataEditor,
  newItem,
  // optional utilities, if you want to import them elsewhere:
  selectableElement,
  selectable,
  deletableElement,
  deletable,
  topBorder,
  bottomBorder,
  dragBorder,
  getTr,
  reset,
  handle
};