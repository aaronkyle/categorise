# WEBcode UI

```js
import markdownit from "npm:markdown-it";
```

```js echo
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

```js echo
import {
  createLogin,
  firebase
} from "@endpointservices/endpoint-login-with-comment"
```

```js echo
import {
  deploy,
  Response,
  getContext
//} from '@endpointservices/serverless-cells'
} from '/components/serverless-cells.js';
display(deploy);
display(Response);
display(getContext)
```

```js echo
toc()
```

```js echo
const testUser = view(createLogin())
```

## Design


```js
const colors = ({
  dark: "#4A44C4",
  dark_darker: "#3933A3",
  dark_darkest: "#2B277C",

  light: "#FDF7E6",
  light_darker: "#FBF0D1",
  light_darkest: "#F9E8B8",

  alt_light: "#9DE2BF",
  alt_light_darker: "#75D6A5",
  alt_light_darkest: "#4ECB8B",

  alt_dark: "#E78AAE",
  alt_darker: "#DE5E90",
  alt_darkest: "#D53472"
})
```

### Header

```js echo
exampleHeader
```

```js echo
viewof exampleHeader = {
  const ui = serverlessCellUI(
    {
      namespace: "endpointservices",
      endpoint:
        "https://webcode.run/observablehq.com/@endpointservices/auth;authorization_endpoint"
    },
    invalidation
  );
  return ui;
}
```

```js echo
const serverlessCellUI = (config, invalidation) => {
  const userView = createLogin();
  // Normalise params
  if (typeof config?.options?.livecode === "string") {
    config.options.livecode = config.options.livecode.toUpperCase();
  }

  return viewroutine(async function* () {
    while (true) {
      if (!userView.value || userView.value.then) {
        yield* ask(
          headerLogin(
            {
              ...config,
              userView
            },
            invalidation
          )
        );
      } else {
        if (
          ((await userView.value.getIdTokenResult()).claims[
            "observablehq.com"
          ] || {})[config.namespace]
        ) {
          yield* ask(
            headerCreator(
              {
                ...config,
                userView
              },
              invalidation
            )
          );
        } else {
          yield* ask(
            headerNotCreator(
              {
                ...config,
                userView
              },
              invalidation
            )
          );
        }
      }
    }
  });
}
```

```js
const exampleHeaderActive = view(headerCreator({
  namespace: "tomlarkworthy",
  endpoint:
    "https://webcode.run/observablehq.com/@endpointservices/auth;authorization_endpoint",
  userView: createLogin()
}))
```

```js echo
const headerCreator = (config, invalidation) => {
  const ui = supress(view`
  ${style()}
  <details open class="e-header-details">
    ${["_user", Inputs.input(config.userView.value)]}
    ${["_href", variable(config.endpoint)]}
    <summary style="width: 100%;">
      ${urlTitle({
        url: config.endpoint,
        text: normalizeObservablehqEndpoint(config.endpoint)
      })}
      ${config.userView}
    </summary>
    ${tabbedPane({
      status: () => statusPane(config, invalidation),
      secrets: () => secretsPane(config, invalidation)
    })}
  </details>`);

  return ui;
}
```

```js echo
const exampleHeaderNotCreator = view(headerNotCreator(
  {
    namespace: "tomlarkworthy",
    options: {
      livecode: "PUBLIC"
    },
    endpoint:
      "https://webcode.run/observablehq.com/@endpointservices/auth;authorization_endpoint;dh4cs",
    undefined
  },
  invalidation
))
```

```js echo
const headerNotCreator = (config, invalidation) => {
  const ui = supress(
    view`
  ${style()}
  <details class="e-header-details">
    ${["_href", variable(config.endpoint)]}
    <summary style="width: 100%;">
      ${urlTitle({
        url: config.endpoint,
        text: normalizeObservablehqEndpoint(config.endpoint)
      })}
    </summary>
    ${config.userView}
    ${tabbedPane({
      status: () => publicStatusPane(config, invalidation)
    })}
    <span style="font-size: 16px">

    ${
      config?.options?.livecode === "PUBLIC"
        ? md`🔥 This endpoint has public [livecoding](https://observablehq.com/@endpointservices/livecode) enabled. Requests made to your unique URL will be tunnelled and served by *your* browser.`
        : ""
    }
    </span>
  </details>`,
    {
      ignore: (evt) => evt?.detail?.user === undefined || evt.detail.user.then
    }
  );
  return ui;
}
```

```js
const exampleHeaderLogin = view(headerLogin({
  namespace: "tomlarkworthy",
  endpoint:
    "https://webcode.run/observablehq.com/@endpointservices/auth;authorization_endpoint",
  options: {
    livecode: "PUBLIC"
  },
  invalidation
}))
```

```js echo
exampleHeaderLogin
```

```js echo
const headerLogin = (config, invalidation) =>
  supress(
    view`
  ${style()}
  <details class="e-header-details">
    ${["_href", variable(config.endpoint)]}
    <summary style="width: 100%;">
      ${urlTitle({
        url: config.endpoint,
        text: normalizeObservablehqEndpoint(config.endpoint)
      })}
    </summary>
    <p class="e-explain">💡 If you are the host of this endpoint, login to admininister and <a href="https://observablehq.com/@endpointservices/livecode">livecode</a> the endpoint</p>
    ${
      config?.options?.livecode === "PUBLIC"
        ? html`<p class="e-explain">🔥 The owner has enabled public <a href="https://observablehq.com/@endpointservices/livecode">livecoding</a>! anybody can login to start a <a href="https://observablehq.com/@endpointservices/livecode">livecode</a> session</p>`
        : ""
    }
    ${config.userView}
  </details>`,
    {
      ignore: (evt) =>
        evt?.detail?.user === undefined ||
        evt.detail.user === null ||
        evt.detail.user.then
    }
  )
```

```js echo
const headerCSS = html`<style>
  .e-box {
    font-size: 17px;
    border-radius: 16px;
    background-color: ${colors.light};
    padding: 8px;
    border: solid;
    border-width: 4px;
    border-color: ${colors.dark};
    color: ${colors.dark};
    box-shadow: 1px 2px 4px #0008;
  }

  .e-header-details > summary {
    list-style-type: none;
  }

  .e-header-details > summary::-webkit-details-marker {
    display: none;
  }

  .e-header-details > summary::before {
    content: '▶';
  }

  .e-header-details[open] > summary::before {
    content: '▼';
  }

  .e-header-details {
    font-size: 40px;
    font-family: Courier, monospace;
  }

  .e-header-details[open] > summary {
  }

</style>`
```

```js
md`### link`
```

```js
externalLinkSVG()
```

```js echo
const externalLinkSVG = () => svg`<svg style="vertical-align:top; padding-right: 10px" width=32 height=32 viewbox="-5 -5 110 110" stroke="${colors.dark}" fill="none" stroke-width="10" stroke-linejoin="round" stroke-linecap="round">
  <polyline points="85,40 85,85 15,85 15,15 60,15"/>
  <polyline points="50,50 100,0 70,0 100,0 100,30"/>
`
```

```js echo
colors
```

```js
md`#### Title`
```

```js
const exampleTitle = view(urlTitle({
  url:
    'https://webcode.run/observablehq.com/@endpointservices/auth;authorization_endpoint',
  text: '@endpointservices/auth;authorization_endpoint'
}))
```

```js echo
exampleTitle
```

```js echo
const urlTitle = ({ url, text } = {}) => {
  const ui = view`<a class="e-code-title" href=${[
    "url",
    variable(url)
  ]} target="_blank">${externalLinkSVG()}<span style="position:relative; top: 5px">${[
    "text",
    textNodeView(text)
  ]}</span></a>`;
  return ui;
}
```

```js echo
const supress = (_view, { ignore } = {}) => {
  if (ignore === undefined) ignore = (evt) => evt?.detail?.user === undefined;

  _view.addEventListener("input", (evt) => {
    if (ignore(evt)) evt.stopPropagation();
  });
  return view`<span>${["...", _view]}`;
}
```

```js echo
const titleCSS = html`<style>
  .e-code-title {
    width: 60%;
    display: inline-block;
    overflow-wrap: break-word;
    box-sizing: border-box;
    font-family: courier, monospace;
    font-size: 14px;
    border-radius: 16px;
    background-color: ${colors.alt_light};
    border-color: ${colors.alt_dark};
    padding: 8px;
    border: solid;
    border-width: 4px;
    border-color: ${colors.dark};
    color: ${colors.dark};
    box-shadow: 1px 2px 4px #0008;
  }
</style>`
```

```js
md`### Tabs`
```

```js
const tabsExample = view(tabs({
  options: ["secrets", "logs"],
  active: "logs"
}))
```

```js echo
tabsExample
```

```js echo
const tabs = ({ options = [], active } = {}) => {
  const select = (option, evt) => {
    ui.querySelector(".e-tab-active").classList.remove("e-tab-active");
    evt.target.classList.add("e-tab-active");
    ui.value = option;
    ui.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const ui = htl.html`<div class="e-tabs">
    ${options.map(option => {
      const on = option === active;
      return htl.html`<button onclick=${e => select(option, e)} class="e-tab ${
        on ? 'e-tab-active' : ''
      }">
        ${option}
        <div class="e-tab-line"></div>
      </button>`;
    })}
  </div>`;

  ui.value = active;

  return ui;
}
```

```js echo
const tabsCSS = html`<style>
  .e-tabs {
  }
  .e-tab {
    font-size: 24px;
    border: none;
    color: ${colors.dark};
    background-color: inherit;
    font-family: arial, sans-serif;
    margin-right: 10px;
    padding: 10px
  }
  .e-tab-active {
    background-color: ${colors.light};
  }
  .e-tab-line {
    position: relative;
    height: 2px;
    width: 100%;
    bottom: -8px;
    padding: 0px;
    background: inherit;
  }

  .e-tab-active .e-tab-line {
    background: ${colors.alt_dark};
  }
</style>`
```

```js
md`### Tabbed pane`
```

```js echo
viewof tabbedPaneExample = tabbedPane({
  cool: () => md`cool`,
  nocool: () => md`not cool`
})
```

```js echo
tabbedPaneExample
```

```js echo
const tabbedPane = options => {
  const keys = Object.keys(options);
  const tabsView = tabs({
    options: keys,
    active: keys[0]
  });

  let responder = null;
  tabsView.addEventListener('input', () => responder(tabsView.value));

  return view`${tabsView}${viewroutine(async function*() {
    while (true) {
      const response = new Promise(resolve => (responder = resolve));
      yield options[tabsView.value]();
      await response;
    }
  })}`;
}
```

```js
md`#### Tab Pane`
```

```js
tabPane({
  content: html`<ul><li>one</li></ul>`
})
```

```js echo
const tabPane = ({ content }) =>
  view`<div class="e-main-box">${['...', content]}</div>`
```

```js echo
const tabPaneCSS = html`<style>

  .e-main-box {
    display: flex;
    overflow-wrap: break-word;
    font-size: 0px;
    border-radius: 16px;
    background-color: ${colors.light};
    padding: 8px;
    border: none;
    color: ${colors.dark};
    box-shadow: 1px 2px 4px #0008;
  }

  @media (max-width: ${mobile}px) {
    .e-main-box {
      flex-direction: column;
    }
  }
</style>
`
```

```js
md`#### Column Pane`
```

```js echo
columnPane({
  content: htl.html`<span class="e-col-title">Title</span><ul><li>one</li><li>two`
})
```

```js echo
const columnPane = ({ content }) =>
  view`<div class="e-col-pane">${['...', content]}</div>`
```

```js echo
const colPaneCSS = htl.html`<style>

  .e-col-pane {
    width: 33%;
    font-size: 16px;
    background-color: ${colors.light};
    border: solid;
    border-radius: 8px;
    border-color: ${colors.light_darker};
    box-sizing: border-box; 
    padding: 15px;
    display: inline-block;
    vertical-align:top;
  }
  @media (max-width: ${mobile}px) {
    .e-col-pane {
      width: 100%;
    }
  }
  .e-col-title {
    font-family: arial, sans-serif;
    font-size: 24px;
    color: ${colors.dark};
    font-weight: bold;
    text-decoration: underline;
  } 
</style>`
```

```js
md`### button`
```

```js echo
const button = ({ action, label, icon, cssClass = "e-btn" } = {}) => {
  const btn = html`<button class="${cssClass}">${
    icon ? html`<span class="icon">${icon.outerHTML}<span>` : ''
  }<span class="label">${label}<span></button>`;
  btn.onclick = () => {
    btn.value = action;
    btn.dispatchEvent(new Event('input', { bubbles: true }));
  };
  return btn;
}
```

```js echo
button({
  label: 'cool'
})
```

```js echo
button({
  label: 'cool',
  cssClass: 'e-btn2'
})
```

```js echo
button({
  label: 'cool',
  cssClass: 'e-btn3'
})
```

```js
const buttonCSS = htl.html`<style>
  .e-btn {
    font-size: 18px;
    font-family: Arial, sans-serif;
    border: none;
    border-radius: 11px;
    color: ${colors.light};
    background-color: ${colors.dark};
    margin: 2px;
    padding: 3px 10px 3px 10px;
  }
  .e-btn:hover {
    color: ${colors.light_darker};
    background-color: ${colors.dark_darker};
  }
  .e-btn:active {
    color: ${colors.light_darkest};
    background-color: ${colors.dark_darkest};
  }

  .e-btn2 {
    font-size: 16px;
    font-family: Courier, monospace;
    border: solid;
    border-width: 2px;
    border-radius: 11px;
    color: ${colors.dark};
    background-color: ${colors.alt_light};
    margin: 2px;
    padding: 3px 10px 3px 10px;
  }
  .e-btn2:hover {
    color: ${colors.darker};
    background-color: ${colors.alt_light_darker};
  }
  .e-btn2:active {
    color: ${colors.darkest};
    background-color: ${colors.alt_light_darkest};
  }


  .e-btn3 {
    font-size: 18px;
    font-family: Arial, sans-serif;
    border: solid;
    border-width: 2px;
    border-radius: 11px;
    color: ${colors.dark};
    background-color: ${colors.alt_dark};
    margin: 2px;
    padding: 3px 10px 3px 10px;
  }
  .e-btn3:hover {
    color: ${colors.darker};
    background-color: ${colors.alt_darker};
  }
  .e-btn3:active {
    color: ${colors.darkest};
    background-color: ${colors.alt_darkest};
  }
</style>`
```

```js
md`### Text input`
```

```js echo
viewof exampleTextArea = textarea({ placeholder: 'enter text' })
```

```js echo
viewof exampleTextAreaReadonly = textarea({
  readOnly: true
})
```

```js echo
exampleTextArea
```

```js echo
(exampleTextAreaReadonly.text = "cool beans")
```

```js echo
const textarea = ({
  readOnly = false,
  rows = "4",
  cssClass = "e-textarea",
  placeholder = ''
} = {}) => {
  const readOnlyVar = variable(readOnly, { name: 'readonly' });
  const btn = view`<span>${['readOnly', readOnlyVar]}${[
    'text',
    html`<textarea rows="${rows}" ${
      readOnly ? 'readonly' : ''
    } placeholder="${placeholder}" class="${cssClass}">`
  ]}`;
  const updateReadonly = () => {
    btn.querySelector(`.${cssClass}`).readOnly = readOnlyVar.value;
  };

  readOnlyVar.addEventListener('assign', updateReadonly);
  updateReadonly();
  return btn;
}
```

```js echo
const textAreaCSS = html`<style>
  .e-textarea {
    font-size: 16px;
    font-family: Courier, monospace;
    border: solid;
    border-width: 2px;
    border-radius: 11px;
    color: ${colors.dark};
    width: 100%;
    background-color: ${colors.alt_light};
    margin: 2px;
    padding: 3px 10px 3px 10px;
    box-sizing: border-box; 
  }
  .e-textarea:hover:read-write  {
    color: ${colors.dark_darker};
    background-color: ${colors.alt_light_darker};
  }
  .e-textarea:focus:read-write {
    color: ${colors.dark_darkest};
    background-color: ${colors.alt_light_darkest};
  }

</style>`
```

```js
md`### Backwritable listSelector`
```

```js echo
const listRow = groupname => ({ code, content = code } = {}) => {
  const codeVariable = variable(code, { name: "code" });
  const ui = view`<tr class="e-list-row"><td class="e-list-item">
        ${['code', codeVariable]}
        <input style="display: none;" type="radio" id="${codeVariable}" name=${groupname}><label class="e-list-option" for="${codeVariable}">${[
    'content',
    textNodeView(content)
  ]}</label>
        </td></tr>`;
  codeVariable.addEventListener("assign", () => {
    ui.querySelector("input").id = codeVariable.value;
    ui.querySelector("label").htmlFor = codeVariable.value;
  });
  return ui;
}
```

```js echo
viewof exampleListRow = listRow("testGroup")({
  code: "bling",
  content: "the content"
})
```

```js echo
exampleListRow
```

```js echo
{
  viewof exampleListRow.value.code = 'fum';
  viewof exampleListRow.value.content = 'foo';
  viewof exampleListRow.dispatchEvent(new Event('input'), { bubbles: true });
}
```

```js echo
const listSelector = ({ items = [], groupname = "listSelection" } = {}) => {
  const selected = variable(undefined, { name: "selected" });

  const ui = view`<form>${[
    'selected',
    selected
  ]}<table class="e-list-table"><tbody class="e-list-tbody">${[
    "items",
    [],
    listRow(groupname)
  ]}</tbody></table>`;

  ui.value.items = items;
  selected.addEventListener('assign', s => {
    ui.querySelector(`input#${selected.value}`).checked = true;
  });

  ui.addEventListener('input', s => {
    [...ui.querySelectorAll('input')].find(el => {
      if (el.checked) {
        selected.value = el.id;
      }
    });
  });

  return ui;
}
```

```js echo
const setExampleItems = {
  viewof exampleListSelector.value.items = [
    {
      code: "brown",
      content: `brown`
    },
    {
      code: "blue",
      content: `blue`
    },
    {
      code: "green",
      content: `green`
    },
    {
      code: "red",
      content: `red`
    }
  ];
  viewof exampleListSelector.dispatchEvent(
    new Event('input', { bubbles: true })
  );
}
```

```js echo
exampleListSelector
```

```js echo
viewof exampleListSelector
```

```js
viewof exampleListSelector = listSelector({
  groupname: "eg",
  items: [
    {
      code: "red",
      content: `red`
    },
    {
      code: "green",
      content: `green`
    }
  ]
})
```

```js echo
const listSelectorCSS = htl.html`<style>
  .e-list-table {
      background-color: ${colors.light_darker};
      width: 100%;
      display: block;
      padding: 10px 5px 10px 5px;
      border-radius: 9px;
  }
  .e-list-tbody {
      width: 100%;
      display: block;
      height: 130px;       /* Just for the demo          */
      overflow-y: auto;    /* Trigger vertical scroll    */
      overflow-x: hidden;  /* Hide the horizontal scroll */
  }
  .e-list-row {
    width: 100%;
    display: block;
  }
  .e-list-item {
    box-sizing: border-box;
    padding-right: 15px;
    width: 100%;
    display: block;
  }
  .e-list-option {

    width: 100%;
    display: block;
    font-size: 16px;
    font-family: Courier, monospace;
    text-align: center;
    border: solid;
    border-width: 2px;
    border-radius: 8px;
    color: ${colors.dark};
    background-color: ${colors.alt_light};
    margin: 2px;
    padding: 2px;
  }
  .e-list-option:hover {
    background-color: ${colors.alt_light_darker};
  }
  .e-list-option:active {
    background-color: ${colors.alt_light_darkest};
  }
  input[type="radio"]:checked+label {

    margin-right: 100px;
    color: ${colors.alt_light};
    border-color: ${colors.dark};
    background-color: ${colors.dark};
    font-weight: bold;
  }

  /* width */
  .e-list-table ::-webkit-scrollbar {
    width: 20px;
  }
  /* Track */
  .e-list-table ::-webkit-scrollbar-track {
    background: ${colors.light_darkest};
    border-radius: 10px;
  }
  
  .e-list-table ::-webkit-scrollbar-thumb {
    background: ${colors.alt_darker};
    border-radius: 10px;
    width: 10px;
    height: 50px;
  }
</style>`
```

```js
md`### Secrets Pane

Also contains the logic
`
```

```js
viewof exampleSecretsPane = secretsPane(
  {
    namespace: "endpointservices",
    endpoint:
      "https://webcode.run/observablehq.com/@endpointservices/auth;authorization_endpoint",
    userView: viewof testUser
  },
  invalidation
)
```

```js
exampleSecretsPane
```

```js echo
const secretsPane = ({ namespace, endpoint, userView } = {}, invalidation) => {
  const user = userView.value;
  const ui = view`<div class='e-main-box'>
      ${["bindings", boundSecrets({ namespace, endpoint })]}
      ${["stored", storedSecrets({ namespace, endpoint })]}
      ${["edit", editSecret({ disabled: true })]}
    </div>`;

  const CREATE = "Create";
  const UPDATE = "Update";

  ui.value.stored.namespace = namespace;
  const configDoc = firestore.doc(
    `/services/http/endpoints/${encodeURIComponent(
      normalizeEndpoint(endpoint)
    )}`
  );

  // Subscribe to config changes
  invalidation.then(
    configDoc.onSnapshot((snap) => {
      const val = snap.data();
      // update bindings
      ui.value.bindings.secrets.items = Object.keys(val?.secrets || []).map(
        (name) => ({
          code: "bound_" + name,
          content: name.replace(namespace + "_", "")
        })
      );
    })
  );

  // on bind click, add the selected stored secret to the secret config
  ui.bindings.singleton.bind.addEventListener("input", () => {
    const selected = ui.value.stored.secrets.selected;
    configDoc.set(
      {
        namespace: namespace,
        secrets: {
          [selected]: true
        }
      },
      { merge: true }
    );
  });

  // on unbind click, remove the selected secret
  ui.bindings.singleton.unbind.addEventListener("input", () => {
    const selected = ui.value.bindings.secrets.selected.substring(
      "bound_".length
    );
    console.log("unbound", selected);
    configDoc.set(
      {
        namespace: namespace,
        secrets: {
          [selected]: firebase.firebase_.firestore.FieldValue.delete()
        }
      },
      { merge: true }
    );
  });

  // On stored click, open the editor
  ui.stored.singleton.secrets.addEventListener("input", () => {
    const selected = ui.value.stored.secrets.selected;
    console.log("selected", selected);
    if (selected) {
      ui.value.edit.disabled = false;
      ui.value.edit.action = UPDATE;
      ui.value.edit.name.text = selected.replace(namespace + "_", "");
      ui.value.edit.name.readOnly = true; // can't edit name of stored secrets
      ui.value.edit.secret.text = "";
      ui.value.edit.name.readOnly = true; // can't edit name of stored secrets
    } else {
      ui.value.edit.disabled = true;
    }
  });

  // On new click, open the editor
  ui.stored.singleton.new.addEventListener("input", () => {
    ui.value.edit.disabled = false;
    ui.value.edit.action = CREATE;
    ui.value.edit.name.text = "";
    ui.value.edit.name.readOnly = false;
    ui.value.edit.secret.text = "";
    ui.value.edit.name.readOnly = false;
  });

  // On save click, create/update
  ui.edit.singleton.save.addEventListener("input", async () => {
    ui.value.edit.disabled = true; // close
    ui.value.stored.secrets.items = [];

    if (ui.value.edit.action === CREATE || ui.value.edit.action === UPDATE) {
      console.log("Creating/updating new secret");
      await setSecret({
        namespace,
        name: namespace + "_" + ui.value.edit.name.text,
        value: ui.value.edit.secret.text,
        user
      });
    }
    refreshStored();
  });

  // On delete click, close the editor
  ui.edit.singleton.delete.addEventListener("input", async () => {
    ui.value.edit.disabled = true; // close
    ui.value.stored.secrets.items = [];
    if (ui.value.edit.action === UPDATE) {
      console.log("Delete secret");
      await deleteSecret({
        namespace,
        name: namespace + "_" + ui.value.edit.name.text,
        user
      });
      refreshStored();
    }
  });

  async function refreshStored() {
    const secrets = await getStoredSecrets({
      namespace,
      user
    });
    ui.value.stored.used = secrets.length;
    ui.value.stored.secrets.items = secrets
      .filter((_) => _.name.startsWith(namespace))
      .map((_) => ({
        code: _.name,
        content: _.name.replace(namespace + "_", "")
      }));
  }

  refreshStored();
  return ui;
}
```

```js echo
firestore.doc(`/services/http/endpoints/foo`).set({
  namespace: 'tomlarkworthy'
})
```

```js
md`#### Bound Secrets`
```

```js echo
viewof exampleBoundSecrets = boundSecrets({
  namespace: "tomlarkworthy",
  endpoint:
    "https://webcode.run/regions/europe-west1/observablehq.com/d/6eda90668ae03044;info"
})
```

```js echo
exampleBoundSecrets
```

```js echo
const boundSecrets = ({ namespace, endpoint } = {}) => {
  if (!namespace) throw new Error("no namespace");
  if (!endpoint) throw new Error("no endpoint");

  const ui = columnPane({
    content: view`<div class="e-col-title">Bound Secrets</div><br>
    <div class="e-info"><b>endpoint:</b> <span class="e-code">${normalizeEndpoint(
      endpoint
    )}</span>
    ${[
      'secrets',
      listSelector({
        groupname: 'boundSecrets',
        items: []
      })
    ]}
    <div>
      <span style="margin-left: auto; margin-right: 0;">${[
        'unbind',
        button({
          action: "unbind",
          label: "- unbind",
          cssClass: 'e-btn3'
        })
      ]}</span>
      <span style="float: right;">${[
        'bind',
        button({
          action: "bind",
          label: "+ bind",
          cssClass: 'e-btn3'
        })
      ]}</span>
    </div>
</div`
  });

  return ui;
}
```

```js echo
firestore.doc(`/services/http/endpoints/foo`).get()
```

```js
md`#### Stored Secrets`
```

```js echo
viewof exampleStoredSecrets = storedSecrets({
  namespace: "tomlarkworthy"
})
```

```js echo
exampleStoredSecrets
```

```js echo
const storedSecrets = ({ namespace } = {}) =>
  columnPane({
    content: view`<div class="e-col-title">Stored Secrets</div><br>
    <div class="e-info"><b>namespace:</b> <span class="e-code">${[
      'namespace',
      textNodeView(namespace)
    ]}</span>
    ${[
      'secrets',
      listSelector({
        groupname: 'storedSecrets',
        items: []
      })
    ]}
    <div>
      <span style="float: right;">${[
        'new',
        button({
          action: "new",
          label: "+ new",
          cssClass: 'e-btn3'
        })
      ]}</span>
      <p><b> Limit ${['used', textNodeView(0)]} / ${[
      'max',
      textNodeView(2)
    ]} </b></p>
    </div>
</div`
  })
```

```js
md`#### Create/edit Secret`
```

```js echo
viewof exampleEditSecret = editSecret({
  action: "Edit",
  secret: "my secret"
})
```

```js echo
exampleEditSecret
```

```js echo
const editSecret = ({ action, secret, disabled = false } = {}) => {
  const disabledVar = variable(disabled);

  const ui = columnPane({
    content: view`<div class="e-col-title">${["disabled", disabledVar]}${[
      "action",
      textNodeView(action)
    ]} Secret</div><br>
      ${["name", textarea({ rows: 1, placeholder: "enter name" })]}
      ${[
        "secret",
        textarea({
          rows: 8,
          placeholder: "enter value"
        })
      ]}
      <div>
        <span>${[
          "delete",
          button({
            action: "delete",
            label: "delete",
            cssClass: "e-btn3"
          })
        ]}</span>
        <span style="float: right;">${[
          "save",
          button({
            action: "save",
            label: "save",
            cssClass: "e-btn3"
          })
        ]}</span>
      </div>
  </div`
  });

  function updateVisibility() {
    if (disabledVar.value) ui.classList.add("hide");
    else ui.classList.remove("hide");
  }
  updateVisibility();

  disabledVar.addEventListener("assign", updateVisibility);

  return ui;
}
```

```js
md`### Status Pane`
```

```js
viewof exampleStatusPane = statusPane(
  {
    namespace: "tomlarkworthy",
    name: "test",
    endpoint:
      "https://webcode.run/observablehq.com/@tomlarkworthy/serverless-cell-dashboard;test",
    options: {
      livecode: "PUBLIC"
    }
  },
  invalidation
)
```

```js echo
exampleStatusPane
```

```js echo
const statusPane = (
  { namespace, endpoint, name, user, options = {} } = {},
  invalidation
) => {
  const ui = view`<div class='e-main-box'>
      ${[
        "livecode",
        liveCoding({
          namespace,
          endpoint,
          livecode: options.livecode,
          livecodepublic: options.livecode === "PUBLIC"
        })
      ]}
      ${["apiKey", apiKey({ namespace, endpoint })]}
    </div>`;

  const configDoc = firestore.doc(
    `/services/http/endpoints/${encodeURIComponent(
      normalizeEndpoint(endpoint)
    )}`
  );

  let destroyChannel = undefined;
  let currentLiveMode = undefined;

  async function updateDebugChannel(livemode) {
    console.log("updateDebugChannel", livemode);
    if (livemode === currentLiveMode) return;
    else {
      currentLiveMode = livemode;
      if (currentLiveMode) {
        destroyChannel = await createChannel({
          endpoint,
          name,
          namespace,
          correlation: getCorrelation(endpoint),
          newRequestCallback: (req) => {
            ui.value.livecode.tunnelled++;
          }
        });
      } else {
        if (destroyChannel) {
          destroyChannel();
          destroyChannel = undefined;
        }
      }
    }
  }
  invalidation.then(() => updateDebugChannel(false));

  // Subscribe to config changes
  invalidation.then(
    configDoc.onSnapshot((snap) => {
      const val = snap.data();
      console.log("config", val);
      // update bindings
      ui.value.livecode.livemode =
        val?.flags?.livemode === undefined ? true : val.flags.livemode;

      updateDebugChannel(ui.value.livecode.livemode);
      ui.value.apiKey.apiKey = val?.api_key === undefined ? "" : val?.api_key;

      // Sync hardcoded secrets into record
      (options.secrets || []).forEach((secret) => {
        if (!(val.secrets || {})[secret]) {
          configDoc.set(
            {
              namespace,
              secrets: {
                [secret]: "hardcoded"
              }
            },
            { merge: true }
          );
        }
      });
    })
  );

  ui.livecode.singleton.addEventListener("input", () => {
    console.log("update config");
    configDoc.set(
      {
        namespace,
        flags: {
          livemode: ui.livecode.singleton.livemode.value
        }
      },
      { merge: true }
    );
  });

  ui.apiKey.singleton.apiKey.addEventListener("input", () => {
    console.log("update config");
    configDoc.set(
      {
        namespace,
        api_key: ui.apiKey.singleton.apiKey.value
      },
      { merge: true }
    );
  });

  return ui;
}
```

### Public Status Page

```js echo
publicStatusPane(
  {
    namespace: "tomlarkworthy",
    name: "test",
    endpoint:
      "https://webcode.run/observablehq.com/@tomlarkworthy/serverless-cell-dashboard;test;fsesa",
    options: {
      livemode: "PUBLIC"
    }
  },
  invalidation
)
```

```js echo
publicStatusPane = (
  { namespace, endpoint, name, user, options = {} } = {},
  invalidation
) => {
  const ui = view`<div class='e-main-box'>
      ${[
        "livecode",
        liveCoding({
          namespace,
          endpoint,
          livecode: options.livecode || options.livecode === "PUBLIC",
          livecodepublic: options.livecode === "PUBLIC"
        })
      ]}
      <div class="e-col-pane">
        <div class="e-col-title">Limited Access</div>
        <p class="e-explain"><i>
        ${md`⚠️ You do not have administration rights on this endpoint because you are not signed in as **${namespace}**, [fork](https://observablehq.com/@observablehq/fork-share-merge) into your own namespace if you want to performed privilidged operations. If you are a team member of **${namespace}**, you must scan for team access when logging in.`}
        </i></p>
      </div>
    </div>`;

  let destroyChannel = undefined;
  let currentLiveMode = undefined;

  async function updateDebugChannel(livemode) {
    console.log(`set livemode to ${livemode} from ${currentLiveMode}`);
    if (livemode === currentLiveMode) return;
    else {
      currentLiveMode = livemode;
      if (currentLiveMode) {
        destroyChannel = await createChannel({
          endpoint,
          name,
          namespace,
          correlation: getCorrelation(endpoint),
          newRequestCallback: (req) => {
            ui.value.livecode.tunnelled++;
          }
        });
      } else {
        if (destroyChannel) {
          destroyChannel();
          destroyChannel = undefined;
        }
      }
    }
  }
  invalidation.then(() => updateDebugChannel(false));

  ui.livecode.singleton.addEventListener("input", () => {
    updateDebugChannel(ui.livecode.singleton.livemode.value);
  });
  updateDebugChannel(ui.livecode.singleton.livemode.value);

  return ui;
}
```

#### Live Coding

```js echo
viewof exampleLiveCoding = liveCoding({
  livecode: "PUBLIC",
  endpoint:
    "https://webcode.run/regions/europe-west1/observablehq.com/d/6eda90668ae03044;info"
})
```

```js echo
exampleLiveCoding
```

```js echo
const liveCoding = ({ livecode } = {}) => {
  const ui = columnPane({
    content: view`<div class="e-col-title">Livecoding</div>
      <p class="e-explain"><i><a target="_blank" href="https://observablehq.com/@endpointservices/livecode">Livecoding</a> tunnels production traffic to <b>your</b> browser so you can run and debug the latest serverside code reactively.</i></p>
      <p class="e-explain">⚠️ tab must be in <a target="_blank" href="https://github.com/observablehq/feedback/issues/458">foreground</a> to livecode</p>
      <p class="e-explain"><b>tunnelled: ${[
        "tunnelled",
        textNodeView(0)
      ]}</b></p>
      ${[
        "livemode",
        Inputs.toggle({
          label: "enable livecoding",
          value: livecode === undefined ? true : livecode,
          disabled: livecode === false
        })
      ]}
      ${[
        "livemodepublic",
        Inputs.toggle({
          label: "⚠️ enable public livecoding",
          value: livecode === "PUBLIC",
          disabled: true
        })
      ]}
      <p class="e-explain"><i>Public livecode is enabled through an <a target="_blank" href="https://observablehq.com/@endpointservices/webcode-docs#options">option</a>. </i></p>
  </div`
  });

  return ui;
}
```

#### API key

```js
viewof apiKeyExample = apiKey()
```

```js echo
apiKeyExample
```

```js echo
const apiKey = ({ apiKey = undefined } = {}) => {
  const ui = columnPane({
    content: view`<div class="e-col-title">API Key</div><br>
      <p class="e-explain"><i><a target="_blank" href="https://webcode.run">PRO members</a> can attach an <a href="https://observablehq.com/@observablehq/api-keys" target="_blank">API Key</a> to team notebook endpoints to make them publically reachable. The API Key and source code remain secret.</i></p>
      ${[
        "apiKey",
        Inputs.text({
          type: "password",
          label: "API key",
          value: apiKey
        })
      ]}
  </div`
  });

  return ui;
}
```

```js
const textNodeView = (value = '') => {
  const node = document.createTextNode(value);
  return Object.defineProperty(node, 'value', {
    get: () => node.textContent,
    set: val => (node.textContent = val),
    enumerable: true
  });
}
```

```js
md`### Generic Styles

has to be last so modifiers are applied last
`
```

```js echo
const mobile = 739
```

```js echo
const style = () => html`<style>
  ${titleCSS.innerHTML}
  ${buttonCSS.innerHTML}
  ${textAreaCSS.innerHTML}
  ${listSelectorCSS.innerHTML}
  ${tabPaneCSS.innerHTML}
  ${colPaneCSS.innerHTML}
  ${tabsCSS.innerHTML}
  ${headerCSS.innerHTML}

  .e-info {
    font-size: 14px;
    color: ${colors.dark};
    font-family: arial, sans-serif;
  }

  .e-explain {
    font-size: 14px;
    color: black;
    font-family: arial, sans-serif;
  }

  .hide {
    display: none;
  }
</style>`
```

```js
md`## Implementation`
```

```js echo
normalizeEndpoint(
  "https://webcode.run/regions/foo/observablehq.com/@endpointservices/secrets;foo;fxd"
)
```

```js echo
getCorrelation(
  "https://webcode.run/regions/foo/observablehq.com/@endpointservices/secrets;default"
)
```

```js
const normalizeEndpoint = (endpoint, { excludeCorrelation = true } = {}) => {
  const tripHost = endpoint.replace(
    /https:\/\/webcode.run\/(regions\/([^/]*)\/)?/,
    ""
  );
  if (excludeCorrelation) {
    // Look for two semi colon entries and leave the first
    return tripHost.replace(/(;[^;/]+)(;[^;/]+)/, (match, $1) => $1);
  } else {
    return tripHost;
  }
}
```

```js echo
const getCorrelation = (endpoint) =>
  /(?:;[^;/]+)(?:;(?<correlation>[^;/]+))/.exec(endpoint)?.groups?.correlation
```

```js echo
const normalizeObservablehqEndpoint = endpoint =>
  endpoint.replace(
    /https:\/\/webcode.run\/(regions\/([^/]*)\/)?observablehq.com\//,
    ''
  )
```

```js echo
normalizeObservablehqEndpoint(
  "https://webcode.run/regions/foo/observablehq.com/@endpointservices/secrets;foo"
)
```

```js
md`### Secrets`
```

```js
const SECRET_API = "https://webcode.run/observablehq.com/@endpointservices/secrets"
```

```js
const secretClient = async (user, path, method = 'GET', body = undefined) => {
  const response = await fetch(SECRET_API + path, {
    method,
    headers: {
      idtoken: await user.getIdToken()
    },
    body
  });
  if (response.status >= 400)
    throw new Error(`${response.status}, ${await response.text()}`);
  if (response.status == 200) return await response.json();
  if (response.status == 204) return;
  throw new Error(`Unexpected code ${response.status}`);
}
```

```js
const getStoredSecrets = async ({ namespace, user } = {}) =>
  await secretClient(user, `/subdomains/${namespace}/secrets`)
```

```js echo
const setSecret = async ({ user, namespace, name, value }) =>
  secretClient(
    user,
    `/subdomains/${namespace}/secrets/${name}`,
    "PUT",
    JSON.stringify(btoa(value))
  )
```

```js echo
const deleteSecret = async ({ user, namespace, name }) =>
  secretClient(user, `/subdomains/${namespace}/secrets/${name}`, "DELETE")
```

### Live code

```js echo
/**
Channel used by webcode to signal remote request for the current page to handle.
*/
async function createChannel({
  endpoint,
  name,
  namespace,
  correlation = undefined,
  newRequestCallback = () => {}
} = {}) {
  database.goOnline();
  const sessionId = correlation || (await randomId(32));
  console.log(`New livecode session: ${sessionId}`);

  const configDoc = firestore.doc(
    `/services/http/endpoints/${encodeURIComponent(
      normalizeEndpoint(endpoint)
    )}`
  );

  // Try and keep the online flag online, by add a precense handler to automatically
  // set it to null if we lose the connection.
  database
    .ref(`services/http/debug/${sessionId}/status`)
    .on("value", async (snap) => {
      if (snap.val() === null) {
        // delete everything if we lose a connection
        database
          .ref(`services/http/debug/${sessionId}`)
          .onDisconnect()
          .remove();
        database.ref(`services/http/debug/${sessionId}/status`).set({
          state: "online",
          href: html`<a href="">`.href,
          endpoint,
          started: { ".sv": "timestamp" }
        });
      }
    });

  if (!correlation) {
    // indicate in dynamic config we have a debugging channel open
    // Note, another device may switch it, for now, we don't want a tug of war so we shall
    // let it be lost
    await configDoc.set(
      {
        namespace,
        debugger: {
          // path: database.ref(`services/http/debug/${sessionId}`).path.toString()
          path: database
            .ref(`services/http/debug/${sessionId}`)
            .toString()
            .replace(
              "https://endpointservice-eu.europe-west1.firebasedatabase.app",
              ""
            )
        }
      },
      { merge: true }
    );
  }

  // Read! listen to inbound requests and respond.
  database
    .ref(`services/http/debug/${sessionId}/requests`)
    .on("child_added", async (snap) => {
      const req = snap.val();
      if (snap.child("response").val()) return; // Skip if response seen
      newRequestCallback(req.request);
      window["@endpointservices.status"] = (status) =>
        snap.child("status").ref.set(status);
      window["@endpointservices.header"] = (key, value) =>
        snap.child(`headers/${key}`).ref.set(value);
      window["@endpointservices.write"] = (chunk) =>
        snap.child("writes").ref.push(chunk);

      // send it to the named endpoint
      const context = getContext();
      context.secrets = req?.context?.secrets || {}; // Copy secrets over wire
      try {
        const res = await window["deployments"][name](req.request, context);
        snap.child("response").ref.set(JSON.stringify(res));
      } catch (err) {
        const res = new Response();
        res
          .status(500)
          .send("<pre>\n" + (err.stack || err.message) + "\n</pre>");
        snap.child("response").ref.set(JSON.stringify(res.toData()));
      }
    });
  return () => {
    console.log(`End livecode session: ${sessionId}`);
    database.ref(`services/http/debug/${sessionId}/status`).off("value");
    database
      .ref(`services/http/debug/${sessionId}/requests`)
      .off("child_added");
    database.ref(`services/http/debug/${sessionId}/status`).remove();
  };
}
```

```js echo
const firestore = firebase.firestore()
```

```js echo
const database = () => {
  const db = firebase.database();
  db.goOffline();
  return db;
}
```

```js echo
//import { view, variable, cautious } from '@tomlarkworthy/view'
import { viewUI, variable, cautious } from '/components/view.js';
display(viewUI);
display(variable);
display(cautious)
```

```js echo
//import { viewroutine, ask } from '@tomlarkworthy/viewroutine'
import { viewroutine, ask } from '/components/viewroutine.js'
display(viewroutine);
display(ask)
```

```js echo
//import { toc } from "@nebrius/indented-toc"
import { toc } from "/components/indented-toc.js";
display(toc)
```

```js echo
//import { randomId } from '@tomlarkworthy/randomid'
import { randomId } from '/components/randomid.js';
display(randomId)
```

```js
//import { footer } from "@endpointservices/endpoint-services-footer"
```

```js
//footer
```
