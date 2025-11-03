# GESI Survey | Survey Components

Reusable code components for survey development.



```js
import markdownit from "markdown-it";
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
toc()
```

## Config

```js echo
//import {config} from '@adb/survey-slate-configuration'
import {config} from '/components/survey-slate-configuration.js'
display(config)
```

## Questions

Every cell is wrapped so we can apply cross-cutting features like visibility and numbering to all controls

### fn `questionWrapper`

```js echo
function questionWrapper({
    control,
    hidden = false,
    numbering = ""
  } = {}) {
  const hiddenVariable = variable(undefined, {name: 'hidden'})
  const wrapper = viewUI`<div class="mv3">
    ${['hidden', hiddenVariable]}
    <div class="f5 black-40 b sans-serif">
      ${['numbering', textNodeView()]}
    </div>
    ${['control', control]}
  </div>`
  hiddenVariable.addEventListener('assign', () => {
    if (hiddenVariable.value === true) {
      wrapper.style.display = 'none'
    } else if (hiddenVariable.value === false) {
      wrapper.style.display = 'block'
    } else {
      debugger;
      throw new Error("Unrecognised value for hidden")
    }
  })
  return wrapper;
}
```

### fn `reifyAttributes`

```js echo
// Special arg suffixes like _json, _md, _html are converted to real objects
function reifyAttributes(args) {
  const reifyAttribute = ([k, v]) => {
    try {
      k = k.trim()
      if (k.endsWith("_json")) {
        return [k.replace(/_json$/, ''),
                Array.isArray(v) ? v.map(v => reifyAttributes(JSON.parse("(" + v + ")")))
                                         : reifyAttributes(JSON.parse("(" + v + ")"))] 
      }
      if (k.endsWith("_eval")) {
        return [k.replace(/_eval$/, ''),
                Array.isArray(v) ? v.map(v => reifyAttributes(eval("(" + v + ")")))
                                         : reifyAttributes(eval("(" + v + ")"))]    
      }
      if (k.endsWith("_js")) {
        return [k.replace(/_js$/, ''),
                Array.isArray(v) ? v.map(v => reifyAttributes(eval("(" + v + ")")))
                                         : reifyAttributes(eval("(" + v + ")"))]    
      }
      if (k.endsWith("_md")) {
        return [k.replace(/_md$/, ''), md([v])]    
      }
      
      return [k, v]  
    } catch (err) {
      throw new Error(`Cannot reify attribute ${k} with ${v} cause ${err.message} (indicates data issue)`)
    }
  }
  if (Array.isArray(args))
    return args.map(arg => reifyAttributes(arg));
  else if (typeof args === 'object')
    return Object.fromEntries(Object.entries(args).map(reifyAttribute))
  else 
    return args
} 
```

### fn `createQuestion`

```js echo
const createQuestion = (q, index, options) => {
  const args = reifyAttributes(q);
  
  function createControl() {
    try {
      if (Object.keys(args).length == 0
         || (Object.keys(args).length == 1 && args[""] == "")) {
        return htl.html` `
      }

      if (args.content || args.md) {
        return md`${args.content || args.md}`
      }

      if (args.type === 'checkbox') {
        return checkbox({
          options: [args.title],
          ...args
        })
      }

      if (args.type === 'textarea') {
        return textarea({
          ...args
        })
      }

      if (args.type === 'radio') {
        return radio({
          ...args
        })
      }

      if (args.type === 'number') {
        return number({
          ...args
        })
      }

      if (args.type === 'table') {
        return table({
          ...args
        })
      }

      if (args.type === 'file_attachment') {
        return file_attachment({
          ...args,
          putFile: options.putFile,
          getFile: options.getFile,
        })
      }
      
      if (args.type === 'summary') {
        return summary({
          ...args
        })
      }
      
      if (args.type === 'aggregate') {
        return aggregateSummary({
          ...args
        })
      }

      if (args.type === 'overviewRadar') {
        return overviewRadar({
          ...args
        })
      }

    } catch (err) {
      console.log("Error creating question for ", q, index, options)
      console.log(err)
    }


    return htl.html`<div><mark>${index}. ${JSON.stringify(q)}</mark></div>`
  }
  
  const control = createControl();
  
  const logic = questionWrapper({
    control
  });
  logic.args = args;
  return logic
}
```

```js echo
//viewof example_q = {
const example_q = view(() => {
  return createQuestion(JSON.parse(`{"id":"viewof borrower_GESI_support_equal_pay","type":"summary","label":"Do you provide equal pay for work of equal value of women and men?","score":"1","binary":"TRUE"}`))
})
```

```js echo
example_q.numbering = "34"
```

```js echo
//viewof example_q
example_q
```

### fn `scoreQuestion`

```js echo
const scoreQuestion = (q) => {
  if (!q) return 0;
  if (q.hidden.value === true) return 0;
  if (q.args.type === 'checkbox') {
    // Max score function
    return q.control.value.reduce((maxSoFar, value) => {
      // find option with highest score
      const option = q.args.options.find(option => option.value === value)
      return Math.max(option.score, maxSoFar);
    }, /* default to minimum score */ Math.min(...q.args.options.map(option => option.score)))
  }
  if (q.args.type === 'radio') {
    const option = q.args.options.find(option => option.value === q.control.value)
    if (option) return option.score;
    else /* default to minimum score */ {
      return Math.min(...q.args.options.map(option => option.score));
    }
  };
  
  if (q.args.type === 'table') {
    // We score the table as just the total, its obviously very arbitrary but we can see if someone filled it in
    const tableValue = q.value.control;
    const rows = Object.entries(tableValue);
    const tableTotal = rows.reduce(
      (totalSoFar, [rowKey, rowData]) => {
        const elements = Object.entries(rowData);
        const rowTotal = elements.reduce(
          (rowTotalSoFar, [columnKey, value]) => {
            if (columnKey === "label") return rowTotalSoFar; // User editable tables have key label for the row name
            return rowTotalSoFar + parseInt(value);
          }, 0);
        return totalSoFar + rowTotal;
      }, 0);
    return tableTotal;
  };

  if (q.args.type === 'textarea' && q.args.score) {
    return q.value.control.length
  };
  
  if (q.args.type === 'summary') {
    return q.control.score.value;
  };
}
```

### Table

```js echo
const id = () => Math.random().toString(36).substr(2, 9); // https://gist.github.com/gordonbrander/2230317
```

```js echo
function table({
  value = undefined,
  title = undefined,
  user_rows = false,
  columns = [],
  rows = [],
  grandTotalLabel = "units",
  grandTotal,
  caption = undefined
} = {}) {
  const total = textNodeView()
  const subtotals = columns.reduce((acc, c) => {
    acc[c.key] = textNodeView()
    return acc;
  }, {});
  
  const rowBuilder = (row) => {
    const labelInput = Inputs.text({value: row.label, placeholder: row.placeholder});
    
    const removeRow = (key) => {
      console.log("DELETE ROW", table.value)
      table.value = Object.fromEntries(Object.entries(table.value)
                                       .filter(([id, row]) => row.label !== key));
      table.dispatchEvent(new Event('input', {bubbles: true}));
    }

    const deleteBtn = Inputs.button('Delete', {
      reduce: () => removeRow(labelInput.value),
      disabled: !labelInput.value
    });
    const deleteBtnEl = deleteBtn.querySelector('button');
    deleteBtnEl.classList.add('secondary-button');
    
    if (row.onEnterPressed) {
      labelInput.addEventListener('keyup', (evt) => {
        if (evt.keyCode === 13) {
          row.onEnterPressed(evt);
        }
      });
    }
    return viewUI`<tr>
          <th>${user_rows ? ['label', labelInput] : md`${row.label}`}</th>
          ${['...', Object.fromEntries(columns.map(
            column => [column.key, viewUI`<td>
              ${['...', htl.html`<input type="number" value="${row?.[column.key] || 0}" min="0">`]}
            </td>`]))]}
          ${user_rows ? viewUI`<td>${deleteBtn}</td>` : ''}
        </tr>`
  }
  const newRow = cautious((done) => {
    return rowBuilder({
      placeholder: "add a new row",
      onEnterPressed: (evt) => {
        table.value = {
          ...table.value,
          [id()]: newRow.value
        }
        newRow.value.label = ""
        table.dispatchEvent(new Event('input', {bubbles: true}))
        done(evt);
      }
    });
  }, {nospan: true});
  
  
  let table = viewUI`<div>
    <h2>${title}</h2>
    <div class="table-ui-wrapper">
      <table class="table-ui">
        <thead class="bb bw1 b--light-gray">
          <th></th>
          ${columns.map(column => viewUI`<th>${column.label}</th>`)}
        </thead>
        <tbody>
          ${['...', {}, rowBuilder]}
        </tbody>
        <tfoot class="bt bw1 b--light-gray">
          ${user_rows ? newRow : ''}
          ${columns[0].total ?
            viewUI`<tr>
              <th>Sub-Totals:</th>
              ${columns.map(c => viewUI`<td><div class="subtotal"><strong>${subtotals[c.key]} ${c.total}</strong></div></td>`)}
            </tr>`
          : null}
          ${grandTotal ?
            viewUI`<tr>
              <th><h3>${grandTotal}</h3></th>
              <td colspan="${columns.length}"><h3>${total} ${grandTotalLabel}</h3></td>
            </tr>`
          : null}
        </tfoot>
      </table>
    </div>
    <div class="table-ui-caption">${caption}</div>
  </div>`
  
  // Set rows from value
  // if the table is not editable with preconfigured with rows & columns
  // the rows and column definitions are the source of truth
  // as we might want to change them in the definitions
  // So the passed-in value can only affect intersecting data
  const structuredValue = Object.fromEntries(
    rows.map(row => [row.key, Object.fromEntries(
      columns.map(col => [col.key,
                          value?.[row.key]?.[col.key] || 0]
                 ).concat([["label", row.label]])
    )])
  );
  if (value && user_rows) {
    table.value = value
  } else {
    table.value = structuredValue
  }
  
  
  function recomputeTotals() {
    let totalSum = 0;
    Object.keys(subtotals).forEach(k => {
      let sum = 0;
      Object.keys(table.value).forEach(key => {
        sum += Number.parseInt(table.value[key][k])
      })
      subtotals[k].value = sum
      totalSum += sum
    })
    total.value = totalSum;
  }
  
  table.addEventListener('input', () => {
    recomputeTotals()
  })
  recomputeTotals()
  return table
}
```

```js echo
exampleTable
```

```js echo
const tableStyles = html`<style>
form.${ns} {
  width: auto;
}

.table-ui-wrapper {
  overflow-x: auto;
}

.table-ui {
  width: 100%;
  border-collapse: collapse;
}

.table-ui td,
.table-ui th {
  padding: 0.25rem 0.5rem 0.25rem 0;
  vertical-align: middle;
}

.table-ui th {
  text-align: left;
}

.table-ui th > * {
  margin: 0;
}

.table-ui td > input[type=number] {
  width: 60px;
}

.table-ui .subtotal {
  padding: 0.25rem 0;
}

.table-ui th .${ns}-input {
  min-width: 120px;
}

/* Match Observable Input description styles */
.table-ui-caption {
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 3px;
}

/* Don't reduce font size lower than 0.85rem with <small> */
.table-ui-caption small {
  font-size: 0.85rem;
}
</style>`
```

```js echo
//viewof exampleTable = table({
const exampleTable = view(table({
  value: {
   board: {
    w: 10,
    m:1, 
    unknown: 3, 
   }
  },
  title: "Workforce Gender Data",
  columns: [
    {key: "w", label:"Women", total: "women"},
    {key: "m", label:"Men", total: "male"},
    {key: "unknown", label: "No Data", total: "no data"}
  ],
  rows: [
    {key: "board", label: "Board"},
    {key: "management", label: "Management"},
    {key: "tech", label: "Technical / Engineering Staff"},
    {key: "staff", label: "Non-Technical Staff"},
    {key: "admin", label: "Administrative / Support Staff"},
    {key: "customerservice", label: "Customer Service Staff"},
    {key: "other", label: "Other Staff"},
    {key: "day", label: "Non-Contractual/Informal Day Workers <br><small>(e.g., for food preparation, laundry, cleaners)</small>"}
  ],
  grandTotal: "Total Workforce:",
  grandTotalLabel: htl.html`<br>people`,
  caption: md`<small>_Please enumerate the sex distribution and number of persons with disabilities in your workforce—ensuring to avoid double counting. If you find that this format does not adequately reflect your organization, please submit your data separately to ADB. If you have information for multiple years, please also submit separately.
._</small>`
}))
```

```js
//viewof userEditableTableExample = createQuestion({
const userEditableTableExample = view(createQuestion({
  type: 'table',
  value: {
    "indigenous": {label: "Indigenous Peoples", w: 3, m: 12, unknown: 5, other: 4}
  },
  columns_eval: `[{key: "w", label:"Women / Female", total: "women"}, {key: "m", label:"Men / Male", total: "men"}, {key: "other", label: "Third Gender", total: "third gender"}, {key: "unknown", label: "No Data", total: "no data"}]`,
  rows_eval: `[{key: "indigenous", label:"Indigenous Peoples"}, {key: "disabled", label:"Workers with Disabilities (under Indian law)"},{key: "userdefined1", label:"TODO user editable"}]`,
  user_rows: true,
  table_total_label: '<br>people',
  caption_md: `<small>_**Excluded and Vulnerable Groups** ...._</small>`
}))
```

```js echo
userEditableTableExample
```

```js
//viewof basicTable = table({
const basicTable = view(table({
  value: {
    "cool": {label:"very cool", c1: "27"}
  },
  columns: [{key: "c1", label: "c1"}],
  user_rows: true}))
```

```js echo
//viewof prefilledUserEditableTable = table({
const prefilledUserEditableTable = view(table({
  columns: [{key: "w", label:"Women"}, {key: "m", label:"Men"},{key: "unknown", label: "No Data"}],
  rows: [{key: "orthopedic", label: "Orthopedic"},{key: "vision", label: "Vision"},{key: "hearing", label: "Hearing"},{key: "speech", label: "Speech"},{key: "learning", label: "Learning/Reading (e.g., dyslexia)"}]
}))
```

```js echo
basicTable
```

```js echo
Inputs.button("backwrite", {
  reduce: () => {
    //viewof basicTable.value = {"r1": {label: "r1", "c1": "3"}, "r2": {label: "r2", "c1": "2"}};
    basicTable.value = {"r1": {label: "r1", "c1": "3"}, "r2": {label: "r2", "c1": "2"}};
    //viewof basicTable.dispatchEvent(new Event('input', {bubbles: true}))
    basicTable.dispatchEvent(new Event('input', {bubbles: true}))
  }
})
```

```js
//viewof tableTests = createSuite({
const tableTests = view(createSuite({
  name: "Table tests",
  timeout_ms: 1000
}))
```

```js echo
//viewof testTable = table({columns: [{key: "c1"}], user_rows: true});
const testTable = view(table({columns: [{key: "c1"}], user_rows: true}));
```

```js echo
tableTests.test("Table initial value readable (user editable)", () => {
  const testTable = table({columns: [{key: "c1"}], user_rows: true, value: {r1: {label: "testRow", c1: "2"}}});
  expect(testTable.value).toEqual({r1: {label: "testRow", c1: "2"}})
})
```

```js echo
tableTests.test("Table initial value readable (non-user editable)", () => {
  const testTable = table({columns: [{key: "c1"}], rows: [{key: "r1"}], value: {r1: {c1: "2"}}});
  expect(testTable.value).toEqual({r1: {c1: "2"}})
})
```

```js echo
tableTests.test("Table initial default value readable (non-user editable)", () => {
  const testTable = table({columns: [{key: "c1"}], rows: [{key: "r1"}]});
  expect(testTable.value).toEqual({r1: {c1: "0"}})
})
```

```js echo
tableTests.test("Table initial default value readable (user editable)", () => {
  const testTable = table({columns: [{key: "c1"}], rows: [{key: "r1", label: "r1"}], user_rows: true});
  expect(testTable.value).toEqual({r1: {c1: "0", label:"r1"}})
})
```

```js echo
tableTests.test("Table backwriting loads data which can be retreived later (user editable)", () => {
  //viewof testTable.value = {r1: {label: "testRow", c1: "2"}};
  testTable.value = {r1: {label: "testRow", c1: "2"}};
  //expect(viewof testTable.value).toEqual({r1: {label: "testRow", c1: "2"}})
  expect(testTable.value).toEqual({r1: {label: "testRow", c1: "2"}})
})
```

```js echo
tableTests.test("Table backwriting loads data which can be retreived later (non-user editable)", () => {
  const testTable = table({columns: [{key: "c1"}], rows: [{key: "r1"}]})
  testTable.value = {r1: {label: "testRow", c1: "2"}};
  expect(testTable.value).toEqual({r1: {c1: "2"}})
})
```

```js echo
// this non-obvious bug was hit in prod
tableTests.test("Table backwriting overwrite initial value", () => {
  const testTable = table({columns: [{key: "c1"}], user_rows: true});
  testTable.value = {r1: {label: "testRow", c1: "2"}};
  expect(testTable.value).toEqual({r1: {label: "testRow", c1: "2"}})
})
```

### File attachment

```js echo
const file_attachment = (options) => {
  const row = file => viewUI`<li>${['name', textNodeView(file.name)]}
      ${download(async () => {
        return new Blob(
          [await options.getFile(file.name)], 
          {type: "*/*"}
        )
      }, file.name, "Retrieve")}`
  
  let ui = viewUI`<div class="sans-serif">
    <p class="b">Existing files</p>
    <ul class="uploads">
      ${['uploads', [], row]}
    </ul>
    ${viewroutine(async function*() {
      while (true) {
        const filesView = file({
          ...options,
          multiple: true
        });
        yield* ask(filesView);
        // A bug with file means files have to be collected from a nested value, rather than the result of ask.
        const toUpload = filesView.input.files; 
        let uploaded = false;
        const uploads = [...toUpload].map(async file => {
          await options.putFile(file.name, await file.arrayBuffer())
          console.log("push", file.name)
          ui.value.uploads = _.uniqBy(ui.value.uploads.concat({name: file.name}), 'name');
          ui.dispatchEvent(new Event('input', {bubbles: true}))
          return;
        })

        Promise.all(uploads).then(() => uploaded = true);

        while (!uploaded) {
          yield md`uploading .`
          await new Promise(resolve => setTimeout(resolve, 100));
          yield md`uploading ..`
          await new Promise(resolve => setTimeout(resolve, 100));
          yield md`uploading ...`
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    })
  }</div>`;
  
  // Initial list contents
  ui.value.uploads = options?.value?.uploads || [];
  return ui;
}
```

```js echo
//viewof exampleFileAttachment = {
const exampleFileAttachment = view(() => {
  return createQuestion({
    "id":"GESI_national_law_files",
    "type":"file_attachment",
    "title":"File Attachments",
    "placeholder":"No file chosen.",
    "description":"If you would like to share your policy, please upload it here.",
    "value":{"uploads":[{"name":"IMG_20210801_095401.jpg"}]}
  }, 
  0, {
    putFile: () => {},
    getFile: () => {},
  })
})
```

```js echo
exampleFileAttachment
```

### Clearable Radio


```js echo
//viewof radioExamples2 = radio({
const radioExamples2 = view(radio({
  title: "A very long non sensical question to check the wrapping and layout of this component? A very long non sensical question.",
  options: [ 
    {score: "0", value: "chill", label:"cool"},
    {score: "0", value: "win-win", label:"Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution. User generated content in real-time will have multiple touchpoints for offshoring"}
  ],
  value: "cool",
  description: "A slightly long and meaningless description to go with the options"
}))
```

```js echo
radioExamples2
```

```js
//viewof radioExample = radio({
const radioExample = view(radio({
  options: ["cool", "not cool"]
}))
```

```js echo
radioExample
```

```js echo
//!!!!!
//!!!!!
viewof radioExample
```

```js echo
const radio = (args) => {
  const base = radioBase(args || {});
  const radios = base.querySelectorAll('input[type=radio]');

  const buttonClass = "[ secondary-button ][ m2 ]";
  const buttonInactiveClass = "dn";
  const button = html`<button class="${args.value ? "" : buttonInactiveClass} ${buttonClass}">Clear selection</button>`;

  base.dataset.formType = "clearable-radio";
  
  const clearHandler = (e) => {
    // Hide clear button
    button.classList.add(buttonInactiveClass);
    
    Array.from(radios).forEach(r => { r.checked = false })
    base.value = undefined;
    base.dispatchEvent(new Event('input', {bubbles: true}))
  }

  const inputChangeHandler = (e) => {
    if (base.value !== undefined) {
      // Show clear button
      button.classList.remove(buttonInactiveClass);
    }
  }
  
  button.addEventListener('click', clearHandler);
  base.addEventListener('input', inputChangeHandler);
  invalidation.then(() => {
    base.removeEventListener('input', inputChangeHandler);
    button.removeEventListener('click',clearHandler)
  });

  const labels = base.querySelectorAll('label');
  const lastLabel = Array.from(labels)[labels.length  - 1];
  if (lastLabel && lastLabel.parentNode) {
    lastLabel.parentNode.insertBefore(button, lastLabel.nextSibling);
  }
  
  return base;
}
```

### textarea

```js echo
//viewof exampleTextarea = textarea({
const exampleTextarea = view(textarea({
  title: "title",
  description: "description",
  placeholder: "placeholder"
}))
```

### Checkbox++

Includes a scoring function that has to be accessed through the view


```js echo
const checkbox = (options) => {
  const allValues = options.options.map(o => o.value)
  if (options.includeNoneOption) {
    options.options.unshift({
      value: "NONE",
      label: options.includeNoneOption.label || (typeof options.includeNoneOption === 'string' ? options.includeNoneOption : "None of the below."),
      score: options.includeNoneOption.score
    })
  }
  if (options.includeAllOption) {
    options.options.push({
      value: "ALL",
      label: options.includeAllOption.label || (typeof options.includeAllOption === 'string' ? options.includeAllOption : "All of the above."),
      score: options.includeAllOption.score})
  }
  const base = checkboxBase(options);
  
  const ui = viewUI`<div>
    ${['...', base]}
  </div>`
  
  const form = ui.querySelector("form")
  base.dataset.formType = "checkbox-plus-plus";
  let allSelected = (options.value || []).includes("ALL");
  let noneSelected = (options.value || []).includes("NONE");
  
  base.addEventListener('input', evt => {
    console.log(evt, evt.target.elements, allValues)
    const allInput = form.querySelector(`input[value=ALL]`);
    const noneInput = form.querySelector(`input[value=NONE]`);
      
    // If all the values are selected ALL should be too
    if (evt.target.value.includes('ALL') && !allSelected) {
      console.log("A")
      // User ticks ALL
      allSelected = true
      allValues.forEach(v => {
        const input = form.querySelector(`input[value='${v}']`)
        input.checked = true
      })
      if (noneInput) noneInput.checked = false;
      form.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('ALL') && allSelected) {
      console.log("B")
      // User unticks ALL
      allSelected = false
      allValues.forEach(v => {
        const input = form.querySelector(`input[value='${v}']`)
        input.checked = false
      })
      form.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (evt.target.value.includes('ALL') && allSelected && !allValues.every(v => evt.target.value.includes(v))) {
      console.log("C")
      // An unticked option exists while ALL was ticked (so ALL should untick)
      allSelected = false
      allInput.checked = false
      allInput.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('ALL') && !allSelected && allValues.every(v => evt.target.value.includes(v))) {
      console.log("D")
      // All options are ticked while ALL was unticked (so ALL should tick)
      allSelected = true
      allInput.checked = true
      allInput.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (evt.target.value.includes('NONE') && !noneSelected) {
      console.log("E")
      // User ticks NONE (=> all options should untick)
      noneSelected = true
      allValues.forEach(v => {
        const input = form.querySelector(`input[value='${v}']`)
        input.checked = false
      })
      if (allInput) allInput.checked = false
      form.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('NONE') && noneSelected) {
      console.log("F")
      // User unticks NONE
      noneSelected = false
    } else if (evt.target.value.includes('NONE') && noneSelected && allValues.some(v => evt.target.value.includes(v))) {
      console.log("G")
      // An option exists while NONE was ticked (so NONE should untick)
      noneSelected = false
      const input = form.querySelector(`input[value=NONE]`)
      input.checked = false
      input.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('NONE') && !noneSelected && allValues.every(v => !evt.target.value.includes(v))) {
      console.log("H")
      // Nothing is ticked and NONE is unticked (so NONE should tick)
      noneSelected = true
      const input = form.querySelector(`input[value=NONE]`)
      input.checked = true
      input.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    }
  })
  
  return ui
}
```

```js
//viewof exampleCheckboxPlus = checkbox({
const exampleCheckboxPlus = view(checkbox({
  includeNoneOption: {label: "none of the below", score: 0},
  includeAllOption: {label: "all of the above", score: 4},
  options: [
    { 
      value: 'a',
      label: "option A", 
      score: 1},
    {value: 'b', label: "option B", score: 2}
  ], 
  value: ['a', 'ALL', 'b']
}))
```

```js echo
exampleCheckboxPlus
```

```js echo
//viewof exampleCheckboxWithSpaces = checkbox({
const exampleCheckboxWithSpaces = view(checkbox({
  includeNoneOption: {label: "", score: 0},
  includeAllOption: {label: "YES ALL", score: 4},
  options: [
    {value: 'a b', label: "A", score: 1},
    {value: 'b', label: "B", score: 2}
  ], 
  value: ['a b'],
  description: "A slightly long and meaningless description to go with the options"
}))
```

```js echo
exampleCheckboxWithSpaces
```

```js
//viewof checkboxTests = createSuite({
const checkboxTests = view(createSuite({
  name: "checkbox tests",
  timeout_ms: 1000
}))
```

```js echo
//viewof testCheckboxAll = checkbox({
const testCheckboxAll = view(checkbox({
    includeAllOption: {label: "ALL"},
    options: [
      {value: 'a', label: "A"},
      {value: 'b', label: "B"}
    ],
  }))
```

```js echo
testCheckboxAll
```

```js echo
function check(checkbox, value, checked = true) {
  const option = checkbox.querySelector(`input[value=${value}]`);
  if (!option) throw new Error("Could not find " + value + " in options");
  option.checked = checked
  option.dispatchEvent(new Event('change', {bubbles: true}))
}
```

```js echo
checkboxTests.test("Tick ALL cascades", async (done) => {
  //check(viewof testCheckboxAll, "a", false)
  check(testCheckboxAll, "a", false)
  //check(viewof testCheckboxAll, "b", false)
  check(testCheckboxAll, "b", false)
  //check(viewof testCheckboxAll, "ALL", true)
  check(testCheckboxAll, "ALL", true)
  await new Promise((resolve) => {
    //expect(viewof testCheckboxAll.value).toEqual(["a", "b", "ALL"])
    expect(testCheckboxAll.value).toEqual(["a", "b", "ALL"])
    done()
  })
})
```

```js echo
checkboxTests.test("Tick a and b cascades to ALL", () => {
  //check(viewof testCheckboxAll, "ALL", false)
  check(testCheckboxAll, "ALL", false)
  //check(viewof testCheckboxAll, "a", true)
  check(testCheckboxAll, "a", true)
  //check(viewof testCheckboxAll, "b", true)
  check(testCheckboxAll, "b", true)
  //expect(viewof testCheckboxAll.value).toEqual(["a", "b", "ALL"])
  expect(testCheckboxAll.value).toEqual(["a", "b", "ALL"])
})
```

```js echo
checkboxTests.test("Untick ALL cascades", () => {
  //check(viewof testCheckboxAll, "a", true)
  check(testCheckboxAll, "a", true)
  //check(viewof testCheckboxAll, "b", true)
  check(testCheckboxAll, "b", true)
  //check(viewof testCheckboxAll, "ALL", true)
  check(testCheckboxAll, "ALL", true)
  //expect(viewof testCheckboxAll.value).toEqual(["a", "b", "ALL"])
  expect(testCheckboxAll.value).toEqual(["a", "b", "ALL"])
  //check(viewof testCheckboxAll, "ALL", false)
  check(testCheckboxAll, "ALL", false)
  //expect(viewof testCheckboxAll.value).toEqual([])
  expect(testCheckboxAll.value).toEqual([])
})
```

```js echo
checkboxTests.test("Untick a cascades to ALL", () => {
  //check(viewof testCheckboxAll, "a", true)
  check(testCheckboxAll, "a", true)
  //check(viewof testCheckboxAll, "b", true)
  check(testCheckboxAll, "b", true)
  //check(viewof testCheckboxAll, "ALL", true)
  check(testCheckboxAll, "ALL", true)
  //expect(viewof testCheckboxAll.value).toEqual(["a", "b", "ALL"])
  expect(testCheckboxAll.value).toEqual(["a", "b", "ALL"])
  //check(viewof testCheckboxAll, "a", false)
  check(testCheckboxAll, "a", false)
  //expect(viewof testCheckboxAll.value).toEqual(["b"])
  expect(testCheckboxAll.value).toEqual(["b"])
})
```

```js echo
///viewof testCheckboxAll.querySelector("form").dispatchEvent(new Event('input', {bubbles: true}))
testCheckboxAll.querySelector("form").dispatchEvent(new Event('input', {bubbles: true}))
```

```js echo
//viewof testCheckboxAll.querySelector("input[value=ALL]")
testCheckboxAll.querySelector("input[value=ALL]")
```

### Summary

```js echo
const colorBoxStyle = html`<style>
  .color-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: #ccc;
    height: 2rem;
    width: 2rem;
    border-radius: .25rem;
    font-weight: bold;
    color: white;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .color-box--lg {
    height: 2.5rem;
    width: 2.5rem;
  }
</style>`
```

```js echo
const summary = ({
  sourceId,
  link,
  label,
  score,
  binary = false, // for tick box scores
  counter_group,
  counter_value = undefined
} = {}) => {
  counter_value = counter_value && Number.parseInt(counter_value)
  const counterName = `yiwkmotksl-${counter_group}`;
  if (!window[counterName]) { // Initialize counter if its not been started
      window[counterName] = counter_value || 1;
  }
  counter_value = counter_value || window[counterName]; // Ensure we have a counter value
  window[counterName] = counter_value + 1; // Increment counter now we used it
  
  const colorVar = variable(scoreColor(score, binary));
  const linkVar = variable(link);
  const sourceIdVar = variable(sourceId);
  const textColorVar = variable(contrastTextColor(colorVar))
  const scoreToLabel = score => binary ? score > 0 ? '✔️' : '?' : score;
  const ui = viewUI`<div class="[ flex items-center mv2 ][ sans-serif ]">
  <div class="[ flex items-center]  w-100">
    ${["_link", linkVar]}
    ${["_sourceId", sourceIdVar]}
    <a class="b" style="flex: 0 0 8em" href=${link}
      onclick=${() => {
        console.log("clicked:", sourceIdVar.value)
        document.question = sourceIdVar.value
      }}>
      ${['numbering', textNodeView(`${counter_group || ''} ${counter_value || ''}.`)]}
    </a> 
    <div class="[mid-gray ]" style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis;white-space: nowrap;">
      ${['label', textNodeView(label)]}
    </div>
    <div class="color-box f6"
         style="background-color: ${['color', colorVar]};
                color: ${['text-color', textColorVar]};
                position: relative;
                top: -5px;">
      <span>${['score', textNodeView(scoreToLabel(score))]}<span>
    </div>
  </div>
</div>
`
  

  ui.calculate = (scores) => {
    ui.value.score = scoreToLabel(d3.sum(scores));
    ui.score.dispatchEvent(new Event('input', {bubbles: true}))
  }
  
  bindOneWay(colorVar, ui.score, {
    transform: () => {
      return scoreColor(ui.value.score, binary);
    }
  })
  
  colorVar.addEventListener('assign', () => {
    ui.querySelector(".color-box").style['background-color'] = colorVar.value;
    ui.querySelector(".color-box").style['color'] = contrastTextColor(colorVar.value);
  })

  linkVar.addEventListener('assign', () => {
    ui.querySelector("a").href = linkVar.value
  })
  
  return ui;
}
```

```js echo
//viewof exampleSummary = summary({
const exampleSummary = view(summary({
  label: `Accomodate needs for PWQ`,
  score: 2,
  counter_value: 2,
  counter_group: 'Answer',
}))
```

```js echo
//Inputs.bind(Inputs.range([0, 5], {label: 'score', step: 0.1}), viewof exampleSummary.score)
Inputs.bind(Inputs.range([0, 5], {label: 'score', step: 0.1}), exampleSummary.score)
```

```js echo
//viewof exampleSummaryNext = summary({
const exampleSummaryNext = view(summary({
  label: `Policy/commitment to increasing LGBTI+ and excluded and vulnerable in the energy sector Policy/commitment to increasing LGBTI+ and excluded and vulnerable in the energy sector`,
  score: 2,
  counter_group: 'Question +',
}))
```

```js echo
//viewof exampleBinarySummary = summary({
const exampleBinarySummary = view(summary({
    label: `Binary score`,
    score: 0,
    binary: true,
  }))
```

```js echo
const contrastTextColor = (color) => d3.lab(color).l < 70 ? "#fff" : "#000"
```

```js echo
const binaryScoreColor = (score) => score > 0 || score === '✔️' ? "#ffbccb" : '#0000ff'
```

```js echo
const scoreColor = (score, binary = false) => binary ? binaryScoreColor(score) : d3.scaleLinear()
    .domain([0, 0.1, 1, 2, 3, 4, 5])
    // Earlier 0 -> '#EEEEEE', '#0000EA','#7F17D9','#CF2B92','#E577B8','#F6BECB' <- 5
    // Color scale from https://colorbrewer2.org/#type=sequential&scheme=YlGn&n=5
    .range([
  '#0000ff', // '#EEEEEE', // 0
  '#4800ff', // '#ffffcc', // 0.1
  '#5d00ff', // '#ffffcc', // 1
  '#8900e1', // '#c2e699', // 2
  '#e00095', // '#78c679', // 3
  '#f66fbb', // '#31a354', // 4
  '#ffbccb', // '#006837'  // 5
]).clamp(true)(score);
```

### Aggregate Summary

```js echo
FileAttachment("image@1.png").image()
```

```js echo
//viewof exampleAggregateSummary = aggregateSummary({
const exampleAggregateSummary = view(aggregateSummary({
  label: 'Organizational Policies',
  score: 3.08423423423422,
  set: 'org'
}))
```

```js echo
//Inputs.bind(Inputs.range([0, 5], {label: 'score', step: 0.1}), viewof exampleAggregateSummary.score)
Inputs.bind(Inputs.range([0, 5], {label: 'score', step: 0.1}), exampleAggregateSummary.score)
```

```js echo
aggregateSummary({
  label: 'Organizational Policies and a very long label to stress test this component',
  set: 'org'
})
```

```js echo
const aggregateSummaryStyle = html`<style>
  .aggregate-summary {}  
</style>`
```

```js echo
//viewof exampleAggregateSummary.link.value = "#bar"
exampleAggregateSummary.link.value = "#bar"
```

```js echo
const aggregateSummary = ({
  sourceId,
  link,
  label,
  score = 0,
  prependScoreLevel = "L"
} = {}) => {
  const scoreLevel = (score) => Math.ceil(score);
  const colorVar = variable(scoreColor(score));
  const linkVar = variable(link);
  const sourceIdVar = variable(sourceId);
  const textColorVar = variable(contrastTextColor(colorVar))
  const ui = viewUI`<div class="[ aggregate-summary ][ flex items-center mv2 ][ sans-serif ]">
  <div class="flex items-center w-100">
    ${["_link", linkVar]}
    ${["_sourceId", sourceIdVar]}
    <a class="[ aggregate-summary__title ][ b lh-title ][ pr3 ]"
       href=${link}
       onclick=${(evt) => {
         console.log("clicked:", sourceIdVar.value);
         if (window.location.hash === linkVar.value) {
           // Bugfix, if we are on the same page the hashchange does not fire
           // but we still want to scroll to the question
           // unfortunately the click also scrolls, so we need to trigger scrolling
           // after a small delay
           setTimeout(() => {
             // window.dispatchEvent(new HashChangeEvent("hashchange"));
             document.getElementById(sourceIdVar.value).scrollIntoView();
           }, 100);
         } else {
          document.question = sourceIdVar.value
         }
      }}>

      ${['label', textNodeView(label)]}
    </a>
    <div class="[ aggregate-summary__score ][ mid-gray mr-auto ]">
      ${['score', textNodeView(+score.toFixed(2))]}
    </div>
  </div>
  <div class="color-box color-box--lg" style="background-color: ${['color', colorVar]}; color: ${['text-color', textColorVar]}">
    <span>${['prependScoreLevel', textNodeView(prependScoreLevel)]}${['level', textNodeView(scoreLevel(score))]}<span>
  </div>
</div>`
  
  ui.calculate = (scores) => {
    ui.value.score = +d3.mean(scores).toFixed(2);
    ui.value.level = scoreLevel(ui.value.score);
    ui.score.dispatchEvent(new Event('input', {bubbles: true}))
  }
  
  bindOneWay(colorVar, ui.score, {
    transform: () => {
      return scoreColor(ui.value.score);
    }
  });
  
  colorVar.addEventListener('assign', () => {
    ui.querySelector(".color-box--lg").style['background-color'] = colorVar.value;
    ui.querySelector(".color-box").style['color'] = contrastTextColor(colorVar.value);
  })

  linkVar.addEventListener('assign', () => {
    ui.querySelector("a").href = linkVar.value
  })
  
  return ui;
}
```

### OverviewRadar

```js echo
import {radarChart} from '@adb/radar-chart'
```

#### DataViz wrangling -- Convert value to Object

First, we need to get the existing radar chart into a form compatible with the components. the _radarComponent_ takes the scores as an array, but it is better for persistence to be an object. See https://observablehq.com/@tomlarkworthy/adapting-dataviz for an explanation of the techniques used here

```js echo
const pivotedRadarChart = ({
  maxValue = undefined,
  margin,
  value = {},
} = {}) => radarChart(
  Object.entries(value || {}).map(([attribute, value]) => ({
    attribute, value
  })), {
    maxValue,
    margin
  }
)
```

```js echo
//viewof v = pivotedRadarChart({
const v = view(pivotedRadarChart({
  value: {f1: 4, f2: 3, f4: 5}
}))
```

#### DataViz wrangling -- Add backwritability and fixed field list

Next we need the value to be back-writable, which we can use juice to acheive (see https://observablehq.com/@tomlarkworthy/adapting-dataviz). We also introduce the concept of labelled fields

```js echo
//import {juice} from '@tomlarkworthy/juice'
import {juice} from '/components/juice.js'
```

```js echo
const overviewRadar = ({
  value = {},
  fields = {}
} = {}) => {
  const ui = juice(
    pivotedRadarChart,
    Object.fromEntries(
      Object.entries(fields).map(([code, label]) => [code, `[0].value['${label}']`])))({
    // Initial value is the field values overwritten with passed in values
    value: Object.assign(
      Object.fromEntries(Object.entries(fields).map(([code, label]) => [label, 0])),
      Object.fromEntries(Object.entries(value).map(([code, value]) => [fields[code], value]))),
    maxValue: 5,
    margin: 100
  });

  const shouldCalculateOverall = Object.keys(fields).includes("overall");

  Object.defineProperty(ui, "calculate",{
    value: (scores, {set} = {}) => {
      ui.value[set] = d3.mean(scores);
      // recalc overall
      if (shouldCalculateOverall) {
        ui.value["overall"] = d3.mean(
          Object
            .keys(ui.value)
            .filter(k => k !== "overall")
            .map(k => ui.value[k])
        );
      }
    },
    enumerable: true
  });
  return ui;
}
```

```js echo
//viewof exampleSampleOverview = overviewRadar({
const exampleSampleOverview = view(overviewRadar({
  value: {
    overall: 4,
    external: 1,
    internal: 2,
    mainstream: 3,
    organizational: 4,
  },
  fields: {
    overall: "Overall",
    external: "External Operations",
    internal: "Internal Operations",
    mainstream: "Mainstreaming Factors",
    organizational: "Organizational Policies",
  }
}))
```

```js echo
exampleSampleOverview
```

```js echo
//Inputs.bind(Inputs.range([0, 5], {step: 1, label:"external"}), viewof exampleSampleOverview.external)
Inputs.bind(Inputs.range([0, 5], {step: 1, label:"external"}), exampleSampleOverview.external)
```

```js echo
//Inputs.bind(Inputs.range([0, 5], {step: 1, label:"internal"}), viewof exampleSampleOverview.internal)
Inputs.bind(Inputs.range([0, 5], {step: 1, label:"internal"}), exampleSampleOverview.internal)
```

### Pagination

```js echo
//viewof samplePagination1 = pagination({
const samplePagination1 = view(pagination({
  previous: 'prev',
  next: 'next',
  hashPrefix: "foo"
}))
```

```js echo
//viewof samplePagination2 = pagination({
const samplePagination2 = view(pagination({
  previous: 'prev',
  previousLabel: "Previous",
  hashPrefix: "foo"
}))
```

```js echo
//viewof samplePagination3 = pagination({
const samplePagination3 = view(pagination({
  next: 'next',
  nextLabel: 'Next',
  hashPrefix: "foo"
}))
```

```js echo
//viewof samplePagination4 = {
const samplePagination4 = view(() => {
  const p = pagination({
  previous: 'prev',
  next: 'next',
  hashPrefix: "foo"
});

  return html`<div style="overflow-y: auto; height: 300px;">
  <div class="[ bg-light-gray ]">
    <div style="height: 400px"></div>
    <div class="[ bg-white pa2 ][ sticky bottom-0 ]">
      ${p}
    </div>
  </div>
</div>`;
})
```

```js echo
const pagination = ({previous, next, hashPrefix = "", previousLabel = "← Go back", nextLabel ="Proceed →"} = {}) => {
  const prevLink = previous ? html`<a class="[ pagination_previous ][ brand no-underline underline-hover ]" href="#${hashPrefix}${previous}">${previousLabel}</a>` : "";
  const nextLink = next ? html`<a class="[ pagination_next ][ ml-auto pv2 ph3 br1 ][ bg-brand text-on-brand hover-bg-accent no-underline ]" href="#${hashPrefix}${next}">${nextLabel}</a>` : "";

  return html`<nav class="[ pagination ][ f5 ][ flex items-center ]">
  ${prevLink} ${nextLink}
</nav>`
}
```

## Component Styles

```js echo
const ns = Inputs.text().classList[0]
```

```js echo
const styles = html`<style>
  ${colorBoxStyle.innerHTML}
  ${aggregateSummaryStyle.innerHTML}
  ${tableStyles.innerHTML}
  ${formInputStyles.innerHTML}
</style>`
```

### Inputs

```js echo
const formInputStyles = html`<style>
/* For @jashkenas/inputs */
/* Important seems to be the only way to override inline styles */
form label[style] {
  font-size: 1rem !important;
  display: block !important;
}

form div div,
form label[style] {
  line-height: var(--lh-copy, 1.3) !important; /* .lh-copy */
  margin: 0 !important;
}

form div + label[style], 
form label[style] + label[style], 
form label[style] + button + div,
form label[style] + div { 
  margin-top: var(--spacing-small, .5rem) !important;
} 

form textarea[style] {
  width: 100% !important;
}

form[data-form-type="checkbox-plus-plus"] label[style] ,
form[data-form-type="clearable-radio"] label[style] {
  display: grid !important;
  grid-template-columns: 1em auto;
  gap: var(--spacing-extra-small, .25rem);
  align-items: start;
}

form[data-form-type="clearable-radio"] input[type="radio"],
form[data-form-type="checkbox-plus-plus"] input[type="checkbox"] {
  margin-left: 0 !important;
  margin-top: 0.25rem !important;
}

form[data-form-type="clearable-radio"] div {
  grid-template-columns: 1fr minmax(120px, max-content);
  grid-gap: 0 1rem;
  grid-auto-flow: column;
}

form[data-form-type="clearable-radio"] div > *  {
  grid-column: 1;
}

form[data-form-type="clearable-radio"] div > div:first-child,
form[data-form-type="clearable-radio"] div > div:last-child {
  grid-column: 1/-1;
}

form[data-form-type="clearable-radio"] div > button  {
  grid-column: 2;
  align-self: start;
  justify-self: end;
}

form[data-form-type="clearable-radio"] div > button {
  margin-top: .5rem;
}

@media screen and (min-width: 30em) {
  form[data-form-type="clearable-radio"] > div {
    display: grid;
  }
}

.secondary-button {
  font-size: .875rem; /* .f6 */
  border: 1px solid currentColor;
  padding: var(--spacing-extra-small);
  color: var(--brand) !important;
  background-color: white;
  font-family: var(--brand-font);
  border-radius: var(--border-radius-1);
}

.secondary-button:hover,
.secondary-button:focus,
.secondary-button:active {
  background-color: #f4f4f4; /* near-white */
}

.secondary-button[disabled] {
  color: #999 !important; 
  background-color: white;
  cursor: not-allowed;
}

/* For @observable/inputs */
form.${ns} label {
  display: block;
}
</style>`
```

### surveyView

the surveyView function builds a complete survey. The implementation is loaded dynamically from an external notebook so we can radically change the styling programmatically.

note: currently we statically load all styling notebooks to provide the chooser, we beleive observable is switching to dynamic notebooks soon so we will wait for that feature to launch to cut down on the bundle size.

```
source: "@adb/gesi-survey-styling"
```

```js echo
import {surveyView as gesiSurveyView} from "@adb/gesi-survey-styling"
```

```js echo
import {surveyView as slateSurveyView} from "@adb/survey-slate-styling"
```

```js echo
const surveyView = async function(style, questions, layout, config, answers, options) {
  if (style === "@adb/gesi-survey-styling") return gesiSurveyView(questions, layout, config, answers, options)
  if (style === "@adb/survey-slate-styling") return slateSurveyView(questions, layout, config, answers, options)
  else {
    console.log(`Unknown survey style specified '${style}'`);
    return slateSurveyView(questions, layout, config, answers, options)
  }
}
```

## Logic

### Bind logic

```js echo
const setTypes = ["", "yes", "yesnomaybe", "ifyes", "ifno"]
```

```js echo
const expandSets = (layout) => layout.reduce((acc, row, index) => {
  const sets = row.set.split(",")
  const roles = row.role.split(",")
  if (sets.length != roles.length) throw new Error(`${row.cell_name} is mismatched in sets and roles: ${JSON.stringify(row)}`)
  sets.forEach((set, i) => acc.push({
    ...row,
    index,
    set: set.trim(),
    role: roles[i].trim()
  }))
  return acc;
}, [])
```

```js echo
d3.group(expandSets(example_multi_set_layout), d => d['set'], d => d['role']);
```

```js echo
example_multi_set_layout
```

```js echo
example_aggregate_scores_layout
```

```js echo
example_multi_set_questions
```

```js echo
example_aggregate_scores_layout
```

```js echo
function bindLogic(controlsById, layouts) {
  const cellOrder = layouts.reduce((acc, layout, index) => {
    acc[layout.id] = index
    return acc;
  }, {})
  
  const layoutByCodeByType = d3.group(expandSets(layouts), d => d['set'], d => d['role']);
  [...layoutByCodeByType.keys()].forEach(code => {
    const layoutByType = layoutByCodeByType.get(code);
    
    let conditionQuestion = undefined;
    let answer = undefined;
    
    if (layoutByType.has("yes")) {
      if (layoutByType.get("yes").length > 1) throw new Error("Only one yes per set code") 
      const id = layoutByType.get("yes")[0].id;
      conditionQuestion = controlsById.get(id);
      answer = (v) => v ? "yes" : "no"
    }
    
    // detect conditionals questions
    if (layoutByType.has("yesno")) {
      if (conditionQuestion) throw new Error("Only one condition question per set code") 
      const id = layoutByType.get("yes")[0].id;
      conditionQuestion = controlsById.get(id);
      answer = (v) => {
        if (/^yes/i.exec(v)) return "yes";
        if (/^no/i.exec(v)) return "no";
        return "maybe"
      }
    }
    
    if (layoutByType.has("yesnomaybe")) {
      if (conditionQuestion) throw new Error("Only one condition question per set code") 
      const id = layoutByType.get("yesnomaybe")[0].id;
      conditionQuestion = controlsById.get(id);
      answer = (v) => {
        if (/^yes/i.exec(v)) return "yes";
        if (/^no/i.exec(v)) return "no";
        return "maybe"
      }
    }
    // conditionals
    if (conditionQuestion) {
      if (layoutByType.has("ifyes")) {
        layoutByType.get("ifyes").forEach(layout => {
          const question = controlsById.get(layout.id)
          if (question) bindOneWay(question.hidden, conditionQuestion.control, {
            transform: (v) => !(answer(v) === "yes")
          });
        })
      }

      if (layoutByType.has("ifno")) {
        layoutByType.get("ifno").forEach(layout => {
          const question = controlsById.get(layout.id)
          if (question) bindOneWay(question.hidden, conditionQuestion.control, {
            transform: (v) => !(answer(v) === "no")
          });
        })
      }
    }  
    
    
    // wire up calculations
    (layoutByType.get("calculation") || []).forEach(calculationLayout => {
      const calculationQuestion = controlsById.get(calculationLayout.id);
      
      const scoredQuestions = [...layoutByType.entries()]
        .filter(([type, layouts]) => type !== "calculation") 
        .flatMap(([type, layouts]) => layouts.map(l => {
          const q = controlsById.get(l.id)
          q.args.id = l.id
          return q;
        }));
      
      const calculate = () => {
        const scores = scoredQuestions.map(q => scoreQuestion(q));
        calculationQuestion.control.calculate(scores, {
          set: code
        });
      };
        
      try {
        calculate();
      } catch (err) {
        console.error(`Problem updating calculation '${calculationLayout.id}', reason: ${err.message}`)
        throw err
      }
      
      try {
        // Calculate the back links and numbering
        const firstIndex = Math.min(...scoredQuestions.map(q => cellOrder[q.args.id]));
        const firstId = layouts[firstIndex].id;
        const question = controlsById.get(firstId);
        
        // If the calculation is numbered, back write numbering to the inputs
        if (calculationQuestion.control.numbering) {
          question.numbering.value = calculationQuestion.control.numbering.value;
        }
        // If the calculation can contain a link, link it back to the section the score is derived from
        if (calculationQuestion.control.link) {
          calculationQuestion.control.link.value = "#" + question.section;
        }
        // If the calculation can point to a source question, link it back to where it was scored from
        if (calculationQuestion.control.sourceId) {
          calculationQuestion.control.sourceId.value = firstId;
        }
      } catch (err) {
        debugger;
      }
      
      
      scoredQuestions.forEach(q => {
        q.control.addEventListener('input', calculate);
        invalidation.then(() => q.control.removeEventListener('input', calculate))
      })
    
    })
  })
}
```

```js echo
function exampleLogic(questions, layout) {
  const controlsById = new Map(questions.map(q => [q.id, createQuestion(q)]))
  bindLogic(controlsById, layout)
  return viewUI`<div>
    ${['questions', [...controlsById.values()]]}
  `
}
```

### Example 1: yes, ifyes, ifno

```js echo
const example_yes_ifyes_layout = [{
  id: "open",
  role: "yes",
  set: "a",
}, {
  id: "expand1",
  role: "ifyes",
  set: "a",
}, {
  id: "expand2",
  role: "ifno",
  set: "a",
}] 
```

```js echo
const example_yes_ifyes_questions = [{
  id: "open",
  type: "checkbox",
  options: ["Electricity Generation"]
}, {
  id: "expand1",
  type: "textarea",
  placeholder: "Specifiy type(s) of generation project.",
  rows:  1,
}, {
  id: "expand2",
  type: "textarea",
  placeholder: "Explain why not",
  rows:  1,
}] 
```

```js echo
exampleLogic(example_yes_ifyes_questions, example_yes_ifyes_layout)
```

### Example 2: yesnomaybe, ifyes, ifno

```js echo
const example_yesnomaybe_ifyes_layout = [{
  id: "open",
  role: "yesnomaybe",
  set: "a",
}, {
  id: "expand1",
  role: "ifyes",
  set: "a",
}, {
  id: "expand2",
  role: "ifno",
  set: "a",
}] 
```

```js echo
const example_yesnomaybe_ifyes_questions = [{
  id: "open",
  type: "radio",
  options: ["Yes.", "no", "dunno"]
}, {
  id: "expand1",
  type: "textarea",
  placeholder: "Specifiy type(s) of generation project.",
  rows:  1,
}, {
  id: "expand2",
  type: "textarea",
  placeholder: "Explain why not",
  rows:  1,
}] 
```

```js echo
exampleLogic(example_yesnomaybe_ifyes_questions, example_yesnomaybe_ifyes_layout)
```

### Example 3: score

```js echo
const example_score_layout = [{
  id: "score",
  role: "scored",
  set: "A0.",
}, {
  id: "output",
  role: "calculation",
  set: "A0.",
}] 
```

```js echo
const example_score_questions = [
  JSON.parse(`{"id":"score","type":"radio","title":"If yes:","options_eval":["{value:\\"a\\",score: \\"3\\", label: \\"We have a technical skills training program for our officials and staff.\\"}","{value:\\"b\\",score: \\"4\\", value:\\"b\\",label: \\"We implement a technical skills training program, still less than 60%.\\"}","{value:\\"c\\",score: \\"5\\", label: \\"We implement a technical skills training program for our officials and staff, 60% or more have been trained.\\"}"],"description":"Please select the statement that best describes your organization."}`),
  {
    id: "output",
    type: "summary",
    counter_group: "A",
    counter_value: 0,
    label: "this is the sum of the scores: ",
  }
]
```

```js echo
//viewof exampleScoreGroup = exampleLogic(example_score_questions, example_score_layout)
const exampleScoreGroup = view(exampleLogic(example_score_questions, example_score_layout))
```

```js echo
md`### Example 3b: scored conditional`
```

```js echo
const example_scored_conditional_questions = [{
  id: "open",
  type: "radio",
  options: ["Yes.", "no", "dunno"]
}, {
  id: "expand1",
  type: "radio",
  options: [
    {score: "5", label: "5", value: 'yes'}, 
    {score: "4", label: "4", value: 'no'},
    {score: 3, label: "3", value: 'unknown'}]

}, {
  id: "expand2",
  type: "radio",
  options: [
    {score: "5.1", label: "5.1", value: 'yes'}, 
    {score: "4.1", label: "4.1", value: 'no'},
    {score: 3.1, label: "3.1", value: 'unknown'}]

},
  {
    id: "output",
    counter_group: "count",
    type: "summary",
    label: "this is the sum of the scores: ",
  }
]
```

```js echo
const example_scored_conditional_layout = [{
  id: "open",
  role: "yesnomaybe",
  set: "a",
}, {
  id: "expand1",
  role: "ifyes",
  set: "a",
}, {
  id: "expand2",
  role: "ifno",
  set: "a",
}, {
  id: "output",
  role: "calculation",
  set: "a",
}] 
```

```js echo
//viewof exampleScoredConditionalGroup = exampleLogic(example_scored_conditional_questions, example_scored_conditional_layout)
const exampleScoredConditionalGroup = view(exampleLogic(example_scored_conditional_questions, example_scored_conditional_layout))
```

### Example 4: multiple sets

```js echo
const example_multi_set_layout = [{
  id: "open",
  role: "yesnomaybe, scored",
  set: "a, A1.",
}, {
  id: "expand1",
  role: "ifyes,scored",
  set: "a, A1.",
}, {
  id: "expand2",
  role: "ifno,scored",
  set: "a, A1.",
}, {
  id: "score",
  role: "calculation",
  set: "A1.",
}] 
```

```js echo
const example_multi_set_questions = [{
  id: "open",
  type: "radio",
  options: [
    {score: "5", label: "Yes.", value: 'yes'}, 
    {score: "4", label: "Nope", value: 'no'},
    {score: 3, label: "Don't know.", value: 'unknown'}]
}, {
  id: "expand1",
  type: "textarea",
  placeholder: "Specifiy type(s) of generation project.",
  rows:  1,
}, {
  id: "expand2",
  type: "textarea",
  placeholder: "Explain why not",
  rows:  1,
}, {
  id: "score",
  type: "summary",
  label:  "overall score: ",
}] 
```

```js echo
//viewof exampleMultiSetGroup = exampleLogic(example_multi_set_questions, example_multi_set_layout)
const exampleMultiSetGroup = view(exampleLogic(example_multi_set_questions, example_multi_set_layout))
```

### Example 5: aggregate scores

```js echo
const example_aggregate_scores_layout = [{
  id: "q1",
  role: "scored",
  set: "1",
}, {
  id: "q2",
  role: "scored,scored",
  set: "2,aggregate",
}, {
  id: "s1",
  role: "calculation,scored",
  set: "1,aggregate",
}, {
  id: "s2",
  role: "calculation",
  set: "2",
}, {
  id: "aggregate",
  role: "calculation",
  set: "aggregate",
}] 
```

```js echo
const example_aggregate_scores_questions = [{
  id: "q1",
  type: "radio",
  options: [
    {score: "5", label: "Yes.", value: 'yes'}, 
    {score: "4", label: "Nope", value: 'no'},
    {score: 3, label: "Don't know.", value: 'unknown'}]
}, {
  id: "q2",
  type: "radio",
  options: [
    {score: "5", label: "Yes.", value: 'yes'}, 
    {score: "4", label: "Nope", value: 'no'},
    {score: 3, label: "Don't know.", value: 'unknown'}]
},{
  id: "s1",
  type: "summary",
  label:  "score 1: ",
},{
  id: "s2",
  type: "summary",
  label:  "score 2: ",
},{
  id: "aggregate",
  type: "aggregate",
  label:  "aggregate of 1 & 2: ",
}] 
```

```js echo
//viewof exampleAggregateScoreGroup = {
const exampleAggregateScoreGroup = view(()=> {
  return exampleLogic(example_aggregate_scores_questions, example_aggregate_scores_layout)
})
```

### Example 6: Scored Tables

```js echo
exampleLogic([{
  id: "t1",
  type: 'table',
  value: {
    "indigenous": {label: "Indigenous Peoples", w: 3, m: 12, unknown: 5, other: 4}
  },
  user_rows: true,
  columns_eval: `[{key: "w", label:"Women / Female", total: "women"}, {key: "m", label:"Men / Male", total: "men"}, {key: "other", label: "Third Gender", total: "third gender"}, {key: "unknown", label: "No Data", total: "no data"}]`,
  rows_eval: `[{key: "r1", label:"row"},{key: "r2", label:"row"}]`,
  table_total_label: '<br>people',
},{
  id: "s1",
  type: "summary",
  label:  "This is the table score",
},{
  id: "s2",
  type: "summary",
  binary: true,
  label:  "But is the score non-zero?",
}], [{
  id: "t1",
  role: "scored",
  set: "1",
}, {
  id: "s1",
  role: "calculation",
  set: "1",
}, {
  id: "s2",
  role: "calculation",
  set: "1",
}])
```

### Example 7: Scored Radar

```js echo
const example_radar_scores_layout = [{
  id: "s1",
  role: "scored",
  set: "internal",
}, {
  id: "s2",
  role: "scored",
  set: "external",
},  {
  id: "s3",
  role: "scored",
  set: "mainstream",
},{
  id: "r",
  role: "calculation,calculation,calculation",
  set: "internal,external,mainstream",
}] 
```

```js echo
const example_radar_scores_questions = [{
  id: "s1",
  type: "radio",
  title: "internal",
  options: [
    {score: "0", label: "0", value: '0'}, 
    {score: "1", label: "1", value: '1'},
    {score: "2", label: "2", value: '2'}]
}, {
  id: "s2",
  type: "radio",
  title: "external",
  options: [
    {score: "0", label: "0", value: '0'}, 
    {score: "1", label: "1", value: '1'},
    {score: "2", label: "2", value: '2'}]
}, {
  id: "s3",
  type: "radio",
  title: "mainstreaming",
  options: [
    {score: "0", label: "0", value: '0'}, 
    {score: "1", label: "1", value: '1'},
    {score: "2", label: "2", value: '2'}]
}, {
  id: "r",
  type: "overviewRadar",
  fields: {
    overall: "Overall",
    external: "External Operations",
    internal: "Internal Operations",
    mainstream: "Mainstreaming Factors",
    organizational: "Organizational Policies",
  }
}] 
```

```js echo
//viewof exampleRadarScoreGroup = {
const exampleRadarScoreGroup = view(() => {
  return exampleLogic(example_radar_scores_questions, example_radar_scores_layout)
})
```

## Styles for use within Notebook

Including Tachyons for the demo here

```js echo
// This config needs to be part of account or survey config
const brandConfig = ({
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
```

```js echo
() => {
  loadStyles(brandConfig)
  return md`*Install CSS styles for use within Observable even if \`surveyView\` is not executed*`
}
```

```js echo
const stylesForNotebooks = html`<style>
a[href].pagination_next {
  color: var(--text-on-brand) !important;
}

a[href].pagination_next:hover {
  text-decoration: none;
}`
```

## Imports

```js echo
//import {checkbox as checkboxBase, textarea, radio as radioBase, text, number, file} from "@jashkenas/inputs"
import {checkbox as checkboxBase, textarea, radio as radioBase, text, number, file} from "/components/inputs.js";
display(checkboxBase);
display(textarea);
display(radioBase);
display(text);
display(number);
```

```js echo
//import {view, bindOneWay, variable, cautious} from '@tomlarkworthy/view'
import {viewUI, bindOneWay, variable, cautious} from '/components/view.js';
display(viewUI);
display(bindOneWay);
display(variable);
display(cautious)
```

```js echo
import {viewroutine, ask} from '@tomlarkworthy/viewroutine'
display(viewroutine)
display(ask)
```

```js echo
//import {toc} from "@nebrius/indented-toc"
import {toc} from "/components/indented-toc.js";
display(toc)
```

```js echo
//import {download} from '@mbostock/lazy-download'
import {download} from '/components/lazy-download.js'
display(download)
```

```js echo
//import {mainColors, accentColors} from "@adb/brand"
import {mainColors, accentColors} from "/components/brand.js";
display(mainColors);
display(accentColors)
```

```js echo
//import {loadStyles} from "@adb/tachyons-and-some-extras"
import {loadStyles} from "/components/tachyons-and-some-extras.js"
display(loadStyles)
```

```js echo
//import {textNodeView} from "@adb/gesi-survey-common-components"
import {textNodeView} from "/components/gesi-survey-common-components.js"
display(textNodeView)
```

```js echo
//import {createSuite, expect} from '@tomlarkworthy/testing'
import {createSuite, expect} from '/components/testing.js'
display(createSuite)
display(expect)
```

---

```js
//import { substratum } from "@categorise/substratum"
```

```js
//substratum({ invalidation })
```
