//# GESI Survey | Designer UI 

import {html} from "htl";     

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


import * as Inputs from "/components/inputs_observable.js";
import { Generators } from "observablehq:stdlib";

//import {view, bindOneWay} from '@tomlarkworthy/view'
import {viewUI, bindOneWay} from '/components/view.js'


//import {juice} from "@tomlarkworthy/juice"
import {juice} from "/components/juice.js"


//import {mainColors, accentColors} from "@adb/brand"
import {mainColors, accentColors} from "/components/brand.js"

//import {tachyonsExt} from "@adb/tachyons-and-some-extras"
import {tachyonsExt} from "/components/tachyons-and-some-extras.js"



//import {pageHeader, pageFooter, buttonLabel, styles as commonComponentStyles, ns, textNodeView} from "@adb/gesi-survey-common-components"
import {pageHeader, pageFooter, buttonLabel, ns, styles as commonComponentStyles, textNodeView} from "/components/gesi-survey-common-components.js";



//## Dependencies
const randomId = () => Math.random().toString(16).substring(2)


//import { substratum } from "@categorise/substratum"



//substratum({ invalidation })



//## Wireframe


//## Config


const types = new Map([
 ["Markdown", "md"],
 ["Text", "textarea"],
 ["Checkbox", "checkbox"],
 ["Radio", "radio"],
 ["Number", "number"],
 ["Number Matrix", "table"],
 ["File", "file_attachment"],
 ["Summary", "summary"],
 ["Aggregate", "aggregate"],
  ["Section", "section"],
 ["Custom", "fallback"],
]);




const roles = ["yes", "yesno", "yesnomaybe", "ifyes", "ifno", "calculation", "scored"]











//## Input Label


const inputLabel = (label, optional) => html`<span>${label}${ optional ? ` <span class="mid-gray">Optional</span` : "" }</span>`



//### Description UI

const descriptionUI = (description, rows = 2) => viewUI`<div>
  ${['...', Inputs.textarea({label: "Description", value: description, rows})]}
  <form class="${ns}"><p class="[ align-observable-inputs ][ ma0 ][ mid-gray ]">Supports Markdown</p></form>
</div>`



//#### Fallback UI


typeof "" === 'string'




const kvRowBuilder = ({
  placeholder,
  key, value_,
  onEnter, onDelete
}) => {
  const keyInput = Inputs.text({placeholder, value: key});
  const valueInput = Inputs.text({value: value_});
  
  if (onEnter) {
    keyInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
    valueInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    keyInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && keyInput.value.length == 0) {
        onDelete(keyInput.value);
      }
    });
  }
  
  const ui = viewUI`<tr>
    <td>${['key', keyInput]}</td>
    <td>${['value_', valueInput]}</td>
  </tr>`
  return ui;
}




const fallbackUIEntries = ({entries = []}) => {
  const newAttributeInput = kvRowBuilder({
    placeholder: "Add attribute",
    onEnter: () => {
      ui.entries.value.push(newAttributeInput.value)
      newAttributeInput.value = {key: "", value_: ""};
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const kvRowBuilderWithDelete = (args) => kvRowBuilder({...args, onDelete: (id) => {
    const index = ui.entries.value.find(option => option.id === id)
    ui.entries.value.splice(index, 1); // delete in-place
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})
  const ui = viewUI`<table class="ma0">
  <tr>
    <th>Attribute</th>
    <th>Value</th>
  </tr>
  ${['entries', entries.map(kvRowBuilderWithDelete), kvRowBuilderWithDelete]}
  <tfoot>
    ${newAttributeInput}
  </tfoot>
</table>`
  return ui;
}


const fallbackUI = (args = {}) => { // Main purpose is to convert into <map>format. Main UI is in fallbackUIEntries
  const entriesUI = fallbackUIEntries({
    entries: Object.entries(args).map(([k, v]) => {
      if (!v) {
        return {key: k, value_: undefined};
      } if (v.outerHTML) {
        return {key: k + "_md", value_: v.outerHTML};
      } else if (typeof v === 'object') {
        return {key: k + "_js", value_: JSON.stringify(v)};
      } else {
        return {key: k, value_: v};
      }
    })
  });
  const result = bindOneWay(Inputs.input(undefined), entriesUI, {
    transform: (entriesUi) => Object.fromEntries(entriesUi.entries.map(e => {
      return [e.key, e.value_]
    }))
  })
  const ui = viewUI`<div class="[ cell__section ][ pb3 ]">
    <form class="${ns}"><label>Attributes</label>
    ${entriesUI}
    ${['_...', result]}
    </form>
  </div>`

  return ui;
}





const optionsRowBuilder = ({
  label,
  score,
  id,
  placeholder,
  onEnter,
  onDelete,
} = {}) => {
  const labelInput = Inputs.text({value: label, placeholder})
  if (onEnter) {
    labelInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    labelInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && labelInput.value.length == 0) {
        onDelete(id);
      }
    });
  }
  return viewUI`<tr>
    <td>${['label', labelInput]}</td>
    <td>${['score', Inputs.text({value: score})]}</td>
    <td>${['id', Inputs.text({value: id})]}</td>
  </tr>`
}




//#### Include Optional Attributes

const includeOptionalAttributesUI = (option = {}, toggleLabel = "Add option to select all", defaultOptionLabel = "All of the above", showId = false) =>  {   
  const {score, label, id} = option;
  
  const showUI = Boolean(score || label);
  const toggleUI = Inputs.toggle({label: toggleLabel, value: showUI});

  let optionRow  = {
    label: viewUI`<td>${['...', Inputs.text({value: label})]}</td>`,
    score: viewUI`<td>${['...', Inputs.text({value: score})]}</td>`
  }

  if (showId) {
    optionRow.id = viewUI`<td>${['...', Inputs.text({value: id})]}</td>`
  }
  
  const table = viewUI`<table class="mt0 dn">
  <tr>
    <th>Label</th>
    <th>Score</th>
    ${showId ? html`<th>ID</th>` : ""}
  </tr>
  <tr>
    ${['...', optionRow]}
  </tr>`;

  const handler = (val) => {
    if (val) {
      table.classList.remove('dn')
      table.value.label = table.value.label || label || defaultOptionLabel;
      table.value.score = table.value.score || score;
      table.value.id = table.value.id || id;
    } else {
      table.classList.add('dn');
      table.value.label = undefined;
      table.value.score = undefined;
      table.value.id = undefined;
    }
  }
  
  bindOneWay(Inputs.input(undefined), toggleUI, {
    transform: handler
  })

  handler(showUI);
  
  return viewUI`<div>
  ${toggleUI}
  ${['...', table]}
</div>`;
}







//#### Markdown Text


const mdUI = ({content, rows = 20} = {}) => {
  return viewUI`<div class="[ cell__section ][ pb3 ]">
  ${['content', Inputs.textarea({value: content, label: "Content", rows})]}
</div>`
}


//#### Text Question (Deprecated)


const textUI = ({title,description} = {}) => {
  return viewUI`<div class="[ cell__section ][ pb2 ]">
  ${['title', Inputs.text({value: title, label: "Question"})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2">${['description', Inputs.text({label: "Description", value: description})]}</div>
  </details>
</div>`
}


//#### Radio Question

const radioUI = ({title, options = [], connections = [], description,includeAllOption} = {}) => {
  const newOptionInput = optionsRowBuilder({
    placeholder: "Add new row",
    id: randomId(),
    onEnter: () => {
      ui.value = {
        ...ui.value,
        options: [...ui.value.options, newOptionInput.value]
      }
      newOptionInput.value.label = "";
      newOptionInput.value.id = randomId();
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const radioOptionBuilderWithDelete = (args) => optionsRowBuilder({...args, onDelete: (id) => {
    ui.value = {
      ...ui.value,
      options: ui.value.options.filter(option => option.id !== id)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})
  const ui = viewUI`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
  <form class="${ns}">
    <label>Radio Options</label>
    <table class="ma0">
      <tr>
        <th>Label</th>
        <th>Score</th>
        <th>ID</th>
      </tr>
      ${['options', options.map(radioOptionBuilderWithDelete), radioOptionBuilderWithDelete]}
      <tfoot>
        ${newOptionInput}
      </tfoot>
    </table>
  </form>
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['includeAllOption', includeOptionalAttributesUI(includeAllOption)]}
      ${['description', descriptionUI(description)]}  
    </div>
  </details>
</div>`

  return ui;

}


//#### Checkbox Question



const checkboxUI = ({title, options = [], includeAllOption, includeNoneOption, description} = {}) => {
  const newOptionInput = optionsRowBuilder({
    placeholder: "Add new row",
    id: randomId(),
    onEnter: () => {
      ui.value = {
        ...ui.value,
        options: [...ui.value.options, newOptionInput.value]
      }
      newOptionInput.value.label = "";
      newOptionInput.value.id = randomId();
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const radioOptionBuilderWithDelete = (args) => optionsRowBuilder({...args, onDelete: (id) => {
    ui.value = {
      ...ui.value,
      options: ui.value.options.filter(option => option.id !== id)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})

  const selectNoneUI = includeOptionalAttributesUI(includeNoneOption, "Add option to select none", "None of the above");

  const ui = viewUI`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
  <form class="${ns}">
    <label>Checkbox Options</label>
    <table class="ma0">
      <tr>
        <th>Label</th>
        <th>Score</th>
        <th>ID</th>
      </tr>
      ${['options', options.map(radioOptionBuilderWithDelete), radioOptionBuilderWithDelete]}
      <tfoot>
        ${newOptionInput}
      </tfoot>
    </table>
  </form>
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['includeAllOption', includeOptionalAttributesUI(includeAllOption)]}
      ${['includeNoneOption', selectNoneUI]}
      ${['description', descriptionUI(description)]}
    </div>
    </div>
  </details>
</div>`

  return ui;

}


//#### Number Question

const numberUI = ({title, description, min = 0, max, step = 1} = {}) => {
  const attributes =  [
    {
      id: "min",
      label: "Minimum",
      value: min,
    },
    {
      id: "max",
      label: "Maximum",
      value: max
    },
    {
      id: "steps",
      label: "Steps",
      value: step
    }
  ];

  return viewUI`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['description', descriptionUI(description)]}
      <div class="space-y-2 w-25-ns">
        ${['...', {
          ...attributes.reduce((acc,{id, label, value}) => {
            return {...acc, [id]: Inputs.number([-Infinity, Infinity], {label, value}) }
          }, {})
        }]}
      </div>
    </div>
  </details>
</div>`;
}


//#### Textarea Question


const textareaUI = ({title, placeholder, description, rows = 4, score = false} = {}) => {
  const attributes =  [
    {
      id: "rows",
      label: "Rows",
      value: rows,
    }
  ];

  return viewUI`<div class="[ cell__section ][ ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['description', descriptionUI(description)]}
      ${['placeholder', Inputs.text({label: "Placeholder", value: placeholder})]}
      ${['score', Inputs.toggle({label: "score?", value: score})]}
      <div class="space-y-2 w-25-ns">
      ${['...', {
            ...attributes.reduce((acc,{id, label, value}) => {
              return {...acc, [id]: Inputs.number([-Infinity, Infinity], {label, value}) }
            }, {})
          }]}
      </div>
    </div>
  </details>
</div>`
}


//#### File Attachment Question

const fileAttachmentUI = ({title, description, placeholder} = {}) => {
  return viewUI`
<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['description', Inputs.text({label: "Description", value: description})]}
    ${['placeholder', Inputs.text({label: "Placeholder", value: placeholder})]}
    </div>
  </details>
</div>`
}


//#### Table Question

const tableUI = ({title, rows = [], columns = [], caption, user_rows, table_total, table_total_label} = {}) => {
  const newRowInputBuilder = (valueKey, hideTotal) => {
    const newRowInput = tableHeaderRowBuilder({
      placeholder: "Add new row",
      key: randomId(),
      hideTotal,
      onEnter: () => {
        ui.value = {
          ...ui.value,
          [valueKey]: [...ui.value[valueKey], newRowInput.value]
        }
        newRowInput.value.label = "";
        newRowInput.value.key = randomId();
        ui.dispatchEvent(new Event('input', {bubbles: true}))
      }
    })
    return newRowInput;
  };

  const tableHeaderRowBuilderWithDelete = (valueKey, hideTotal) => (args) => tableHeaderRowBuilder({...args, hideTotal, onDelete: (key) => {
    console.log("ui.value", ui.value);
    ui.value = {
      ...ui.value,
      [valueKey]: ui.value[valueKey].filter(option => option.key !== key)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})

  const ui =  viewUI`
<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
  <form class="${ns}">
    <label>Columns</label>
    <table class="ma0">
      <tr>
        <th>Label</th>
        <th>Key</th>
        <th>Total</th>
      </tr>
      ${['columns', columns.map(tableHeaderRowBuilderWithDelete("columns")), tableHeaderRowBuilderWithDelete("columns")]}
      <tfoot>
        ${newRowInputBuilder("columns")}
      </tfoot>
    </table>
  </form>
  <form class="${ns}">
    <label>Rows</label>
    <table class="ma0">
       <tr>
          <th>Label</th>
          <th>Key</th>
        </tr>
        ${['rows', rows.map(tableHeaderRowBuilderWithDelete("rows", true)), tableHeaderRowBuilderWithDelete("rows", true)]}
        <tfoot>
          ${newRowInputBuilder("rows", true)}
        </tfoot>
    </table>
  </form>
</div>

<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['user_rows', Inputs.toggle({label: "Allow to edit row labels", value: user_rows})]}
      ${['table_total', Inputs.text({label: "Label for total", value: table_total})]}
      ${['table_total_label', Inputs.text({label: "Unit for total", value: table_total_label})]}
      ${['caption', descriptionUI(caption)]}
    </div>
  </details>
</div>`

  return ui;
}



const tableHeaderRowBuilder = ({
  label,
  key,
  total,
  placeholder,
  onEnter,
  onDelete,
  hideTotal
} = {}) => {
  const labelInput = Inputs.text({value: label, placeholder})
  if (onEnter) {
    labelInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    labelInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && labelInput.value.length == 0) {
        onDelete(key);
      }
    });
  }

  const row = {
    label: viewUI`<td>${['...', labelInput]}</td>`,
    key: viewUI`<td>${['...', Inputs.text({value: key})]}</td>`
  }

  if (!hideTotal) {
    row.total = viewUI`<td>${['...', Inputs.text({value: total})]}</td>`
  }

  return viewUI`<tr>
    ${['...', row]}
  </tr>`
}


//#### Summary

const summaryUI = ({label, counter_group, counter_value, binary} = {}) => {
  return viewUI`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['label', Inputs.text({value: label, label: "Label"})]}
  ${['counter_group', Inputs.text({label: "Group", value: counter_group})]}
  ${['counter_value', Inputs.text({label: "Value", value: counter_value})]}
  ${['binary', Inputs.toggle({label: "binary?", value: binary})]}
</div>`
}


//#### Aggregate Summary



const aggregateSummaryUI = ({label, counter_group} = {}) => {
  return viewUI`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['label', Inputs.text({value: label, label: "Label"})]}
  ${['counter_group', Inputs.text({label: "Group", value: counter_group})]}
</div>`
}


//#### Section


const sectionUI = ({title} = {}) => {
  // class="[ pa3 mh-3 ][ bt bw1 b--light-silver" ]"
  return viewUI`<div class="[ cell__section pb3 ]">
  ${['title', Inputs.text({value: title, label: "Title"})]}
</div>`
}







//### connectionsUI



const connectionRowBuilder = ({
  set,
  role,
  placeholder,
  onEnter,
  onDelete
} = {}) => {
  const setInput = Inputs.text({value: set, placeholder})
  if (onEnter) {
    setInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    setInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && setInput.value.length == 0) {
        onDelete(setInput.value);
      }
    });
  }
  return viewUI`<tr>
    <td>${['set', setInput]}</td>
    <td>${['role', Inputs.select(roles, {value: role})]}</td>
  </tr>`
}

const connectionsUI = ({connections = []} = {}) => {
  const newRoleInput = connectionRowBuilder({
    placeholder: "Add new connection",
    id: randomId(),
    role: "scored",
    onEnter: () => {
      ui.value = {
        ...ui.value,
        connections: [...ui.value.connections, newRoleInput.value]
      }
      newRoleInput.value.group = "";
      newRoleInput.value.role = "scored";
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const connectionRowBuilderWithDelete = (args) => connectionRowBuilder({...args, onDelete: (group) => {
    console.log("deleting", group, ui.value.connections.filter(option => option.group !== group))
    ui.value = {
      ...ui.value,
      connections: ui.value.connections.filter(option => option.group !== group)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}))
  }})
  const ui = viewUI`<table class="ma0">
      <tr>
        <th>Group</th>
        <th>Role</th>
      </tr>
      ${['connections', connections.map(connectionRowBuilderWithDelete), connectionRowBuilderWithDelete]}
      <tfoot>
        ${newRoleInput}
      </tfoot>
    </table>`

  return ui;

}



//### typeUi


const typeUIFactories = ({
  "radio": radioUI,
  "checkbox": checkboxUI,
  "table": tableUI,
  "md": mdUI,
  "text": textUI,
  "number": numberUI,
  "textarea": textareaUI,
  "file_attachment": fileAttachmentUI,
  "summary": summaryUI,
  "section": sectionUI,
  "aggregate": aggregateSummaryUI
})

const typeUI = juice((arg0) => {
  const factory = typeUIFactories[arg0?.type];
  if (factory) {
    return factory(arg0?.result)
  }
  return fallbackUI(arg0?.result)
}, {
  "type": "[0].type"
})



typeUI({
  type: "checkbox",
    result: {
      title: "Your business focus",
      options: [{
        id: "a",
        label: "a_label",
        score: 10
      },{
        id: "b",
        label: "b_label",
        score: 8
      }],
      includeAllOption: {
        score: 5,
        label: "all"
      },
    }
  })




//### cell


const cell = ({
  id = randomId(),
  inner = {
    type: "radio",
    result: {
      
    }
  },
  connections,
  onDelete = (id) => {},
  onDown = (id) => {},
  onUp = (id) => {}
} = {}) => {
  if (![...types.values()].includes(inner.type)) {
    types.set(inner.type, inner.type)
  }
  const typeSelector = Inputs.select(types, {value: inner?.type, label: "Question Type"});
  const innerTypeUI = typeUI(inner);
  Inputs.bind(innerTypeUI.type, typeSelector);

  const ui = viewUI`<section class="[ cell ]" data-cell-type="${typeSelector.value}">
    <div class="[ cell__section ][ flex ]">
      <div>
        ${typeSelector}
      </div>

      <div class="ml-auto">
        <div class="flex space-x-2">
          ${Inputs.button(buttonLabel({ariaLabel: "Delete", iconLeft: "trash-2", iconLeftClass: "icon--danger"}), {reduce: () => onDelete(id)})}
        <div class="button-group">
          ${Inputs.button(buttonLabel({ariaLabel: "Move up", iconLeft: "arrow-up"}), {reduce: () => onUp(id)})}
          ${Inputs.button(buttonLabel({ariaLabel: "Move down", iconLeft: "arrow-down"}), {reduce: () => onDown(id)})}
        </div>
        </div>
      </div>
    </div>
    <div class="[ cell__section ][ space-y-3 ]">
      <div class="flex">${['id', Inputs.text({value: id, "label": "Question ID"})]}</div>
    </div>
    <div>${['inner', innerTypeUI]}</div>
    <div class="[ cell__section cell__section--separated ][ space-y-3 ]">
      <details>
        <summary>Connections</summary>
        <div class="pv2">${['connections', connectionsUI(connections)]}</div>
      </details>
    </div>
</section>`
  typeSelector.addEventListener('input', () => {
    ui.dataset.cellType = typeSelector.value;
  });
  return ui;
}




//### page




const page = ({
    id = randomId(),
    title,
    cells = [],
    onDelete = (id) => {},
    onUp = (id) => {},
    onDown = (id) => {},
  } = {}) => {
  const cellBuilder = (args) => cell({
    ...args,
    onDelete: (id) => {
      const index = ui.value.cells.findIndex(cell => cell.id === id);
      ui.value.cells.splice(index, 1);
      ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onDown: (id) => {
      const index = ui.value.cells.findIndex(cell => cell.id === id);
      const element = ui.value.cells[index];
      ui.value.cells.splice(index, 1);
      ui.value.cells.splice(index + 1, 0, element);
      ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onUp: (id) => {
      const index = ui.value.cells.findIndex(cell => cell.id === id);
      const element = ui.value.cells[index];
      ui.value.cells.splice(index, 1);
      ui.value.cells.splice(Math.max(index - 1, 0), 0, element);
      ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
    }
  });
  

  const ui = viewUI`<div class="[ page card ][ solid-shadow-1 space-y-3 ]">
    ${['_id', Inputs.input(id)]}
    <div class="flex justify-between">
      <div class="w-100 pr4">${['title', Inputs.text({label: "Page title", value: title})]}</div>
      
      <div class="flex space-x-2">
        ${Inputs.button(buttonLabel({ariaLabel: "Delete", iconLeft: "trash-2", iconLeftClass: "icon--danger"}), {reduce: () => onDelete(id)})}
        <div class="button-group">
          ${Inputs.button(buttonLabel({ariaLabel: "Move up", iconLeft: "arrow-up"}), {reduce: () => onUp(id)})}
          ${Inputs.button(buttonLabel({ariaLabel: "Move down", iconLeft: "arrow-down"}), {reduce: () => onDown(id)})}
        </div>
      </div>
    </div>
    <div class="box space-y-3">
      ${['cells', cells.map(cellData => cellBuilder(cellData)), cellBuilder]}
    </div>
    <div class="flex space-x-3">
      <div class="button-group">
        ${Inputs.button('Add Question', {
          reduce: () => {
            ui.value.cells.push({inner: {type: "textarea"}})
            ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
          }
        })}
        ${Inputs.button('Add Text', {
          reduce: () => {
            ui.value.cells.push({inner: {type: "md"}});
            ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
          }
        })}
      </div>
      ${Inputs.button('Add Section', {
          reduce: () => {
            ui.value.cells.push({inner: {type: "section"}});
            ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
          }
        })}
    </div>
  </div>`

  return ui;
}




//### surveyMetadata


const surveyMetadata = ({title} = {}) => viewUI`<div class="card solid-shadow-1 space-y-3">
  <h2>Survey Metadata</h2>
  ${['title', Inputs.text({value: title, label: "Survey title"})]}
</div>`




const filterCellsNotOfType = (cells, type) =>  cells.filter(c => c?.inner?.type != type)





const surveyEditor = ({metadata, pages = []} = {}) => {
  const pageBuilder = (args) => page({
    ...args,
    onDelete: (id) => {
      const index = ui.value.pages.findIndex(pages => pages.id === id);
      ui.value.pages.splice(index, 1);
      ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onDown: (id) => {
      const index = ui.value.pages.findIndex(pages => pages.id === id);
      var element = ui.value.pages[index];
      ui.value.pages.splice(index, 1);
      ui.value.pages.splice(index + 1, 0, element);
      ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onUp: (id) => {
      const index = ui.value.pages.findIndex(page => page.id === id);
      var element = ui.value.pages[index];
      ui.value.pages.splice(index, 1);
      ui.value.pages.splice(Math.max(index - 1, 0), 0, element);
      ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
    },
  })

  const summary = viewUI`<p class="ma0">
    ${['questions', textNodeView("0 questions")]} across ${['pages', textNodeView("0 pages")]}.
  </p>`

  const updateSummary = () => {
    // console.log('updateSummary');
    const pages = ui.value?.pages?.length ||  0;
    const questions = ui.value?.pages?.reduce((count, page) => {
      const cells = filterCellsNotOfType(page.cells || [], 'section');
      return count + cells.length
    }, 0);

    summary.value.pages = pages === 1 ? "1 page" : `${pages} pages`;
    summary.value.questions = questions === 1 ? "1 question" : `${questions} questions`;
  }

  const ui = viewUI`<div class="space-y-3">
  ${['metadata', surveyMetadata(metadata)]}
  
  <div class="space-y-3">
    ${['pages', pages.map(pageBuilder), pageBuilder]}
  </div>
  <div>
    ${Inputs.button('Add Page', {
      reduce: () => {
        ui.value.pages.push({
          title: "page " + randomId()
        });
        ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
      }
    })}
  </div>

  <div class="sticky bottom-1">
    ${summaryCard(summary, html`<div class="flex space-x-2">${Inputs.button('Preview')} ${Inputs.button('Save')}`)}
  </div>
</div>`

  ui.addEventListener('input', updateSummary);

  // When values assigned to `viewof surveyEditor().value`, without dispatching `input` event
  // call `viewof surveyEditor().applyValueUpdates()` to update UIs like summary.
  ui.applyValueUpdates = () => {
    updateSummary();
  };
  updateSummary();

  return ui;
}









//## Settings Card

const settingsCard = () => {
  return viewUI`<div class="[ card card--compact ][ solid-shadow-1 ]">
  <div class="[ space-y-3 ]">
    <h2 class="mt0 f4">Settings</h2>
    ${['showResults', Inputs.toggle({label: "Show results to respondents"})]}
  </div>
`
}



//## Summary Bar

const summaryCard = (title, actionsHtml) => {
  const actions = actionsHtml ? html`<div>${actionsHtml}` : "";

  return html`<div class="[ card card--compact ][ b--light-blue solid-shadow-1 ]">
  <div class="[ flex flex-wrap justify-between items-center ][ f6 mid-gray ]">
    <p class="ma0">${title}</p>
    ${actions}
  </div>
`
}







//## UI Builders

//### surveyEditor



//viewof anotherSurveyEditorData = {
const anotherSurveyEditorDataElement = (() => {
  return Inputs.input({
    metadata: {
      title: "Another Demo Survey"
    },
    pages: [{
      title: "page1",
      cells: [{
        id: "a-md-question-type",
        inner: {
          type: "md",
          result: {
            content: "_Hello world_"
          }
        }
      }]
    }, {
      title: "page2"
    }]
  });
})();
const anotherSurveyEditorData = Generators.input(anotherSurveyEditorDataElement);








//## Styles


const tachyons = tachyonsExt({
  colors: {
    brand: mainColors[900], // or, provide and color hex code
    accent: accentColors[900], // or, provide and color hex code
    // The color of text which are usually displayed on top of the brand or accent colors.
    "text-on-brand": "#ffffff",
  },
  fonts: {
    "brand-font": `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
  }
})

const styles = html`${commonComponentStyles}
<style>
.mh-3 {
  margin-right: calc(-1 * var(--spacing-medium));
  margin-left: calc(-1 * var(--spacing-medium));
}

tr:not(:last-child) {
  border: 0;
}

.cell {
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-2);
}

.cell[data-cell-type="section"] {
  margin-left: -1rem;
  margin-right: -1rem;
  border-top-width: 0.25rem;
  border-left-width: 0;
  border-right-width: 0;
  border-radius: 0;
}

.cell__section {
  padding-top: var(--spacing-medium);
  padding-left: var(--spacing-medium); 
  padding-right: var(--spacing-medium); 
}

.cell__section--separated {
  padding-top: var(--spacing-extra-small);
  padding-bottom: var(--spacing-extra-small);
  border-top: 1px solid var(--border-color-light);
}

.cell__section summary {
  color: #555; /* mid-gray */
  cursor: pointer;
  font-size: .875rem; /* .f6 */
}

.align-observable-inputs {}

@media screen and (min-width: 30em) {
  .align-observable-inputs {
    margin-left: calc(var(--label-width) + var(--length2));
  }
}
</style>`;


//### Styles for the demo


html`
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style type="text/css" media="screen, print">
  body {
    font-family: var(--brand-font);
  }
</style>
`


export {
  md,
  types,
  roles,
  randomId,
  descriptionUI,
  includeOptionalAttributesUI,
  optionsRowBuilder,
  mdUI,
  textUI,
  radioUI,
  checkboxUI,
  numberUI,
  textareaUI,
  fileAttachmentUI,
  tableUI,
  summaryUI,
  aggregateSummaryUI,
  sectionUI,
  connectionsUI,
  typeUI,
  cell,
  page,
  surveyMetadata,
  filterCellsNotOfType,
  surveyEditor,
  settingsCard,
  summaryCard,
  styles,
  // re-exported shared components if desired:
  pageHeader,
  pageFooter,
  buttonLabel,
  ns,
  commonComponentStyles,
  tachyons,
  textNodeView
};
