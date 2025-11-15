# cellMap
## computes the mapping of reactive variables to higher level notebook cells, grouped by module

This is a port of an Observable notebook by <a href="https://observablehq.com/@tomlarkworthy">Tom Larkworthy</a> [@tomlarkworthy] called <a href="https://observablehq.com/@tomlarkworthy/cell-map">cellMap</a>. All mistakes and deviations from the original are my own.</div>

---

<!--
https://observablehq.com/@tomlarkworthy/cell-map
-->

```js
viewof showBuiltins = Inputs.toggle({ label: "builtins?", value: false })
```

```js
viewof showAnon = Inputs.toggle({ label: "anonymous?", value: false })
```

```js
viewof cellMapViz = {
  hash; // update links on hash change
  return Plot.plot({
    width,
    axis: null,
    y: {
      reverse: true
    },
    marks: [
      Plot.dot(
        [
          [-1, d3.min(filteredMap, (d) => d.module)],
          [1, d3.max(filteredMap, (d) => d.module) + "_"]
        ],
        {
          stroke: "none"
        }
      ),
      Plot.arrow(
        edges.filter((edge) => edge[1]),
        {
          x1: 0,
          y1: (edge) => `${edge[0].module}#${edge[0].name}`,
          x2: 0,
          y2: (edge) => `${edge[1].module}#${edge[1].name}`,
          stroke: (edge) => edge[0].module,
          headLength: 0,
          bend: 90
        }
      ),
      Plot.ruleY(new Set(filteredMap.map((cell) => cell.module + "-")), {
        y: (d) => d,
        stroke: (d) => d,
        strokeOpacity: 0.5,
        strokeDasharray: [5, 10]
      }),
      Plot.text(new Set(filteredMap.map((cell) => cell.module)), {
        x: -1,
        y: (d) => d + "_",
        fill: (d) => d,
        fontSize: 14,
        frameAnchor: "top-left",
        dy: 8,
        href: (cell) => linkTo(`${cell}`),
        ...(isOnObservableCom() && { target: "_blank" })
      }),
      Plot.text(
        filteredMap,
        Plot.pointerY({
          x: 1,
          text: (d) => `${d.module}#${d.name}`,
          y: (d) => `${d.module}#${d.name}`,
          fill: (d) => d.module,
          fontSize: 14,
          frameAnchor: "right",
          href: (cell) => {
            if (!cell) return undefined;
            return linkTo(`${cell.module}#${cell.name}`);
          },
          ...(isOnObservableCom() && { target: "_blank" })
        })
      )
    ]
  });
}
```

${cellMapViz ? `### [\`${cellMapViz?.module}#${cellMapViz?.name}\`](${linkTo(`${cellMapViz?.module}#${cellMapViz?.name}`)})` : `\`<click the above viz to pin a cell and open its dependancy graph below>\``}

```js
viewof detailViz = Plot.plot({
  symbol: {
    domain: ["simple", "mutable", undefined, "import", " ", "viewof"],
    legend: true
  },
  margin: 50,
  axis: null,
  width,
  height: 1000,
  marks: [
    Plot.link(
      nodes
        .filter((d) => d.parent)
        .map((n) => {
          if (variableToCell.get(n.parent.data) == variableToCell.get(n.data)) {
            n.type = variableToCell.get(n.data).type;
          } else {
            n.type = "connector";
          }
          return n;
        }),
      {
        x1: "y",
        y1: "x",
        x2: (d) => d.parent.y,
        y2: (d) => d.parent.x,
        stroke: "type",
        strokeLinecap: "round",
        strokeWidth: (d) => (d.type == "connector" ? 2 : 20),
        opacity: (d) => (d.type == "connector" ? 0.5 : 0.1),
        inset: 0
      }
    ),
    Plot.dot(nodes, {
      x: "y",
      y: "x",
      r: 10,
      fill: "white",
      symbol: (node) => variableToCell.get(node.data)?.type,
      stroke: (d) => modules.get(d.data._module)?.name,
      strokeWidth: 4,
      href: (d) => {
        const cell = variableToCell.get(d.data);
        if (!cell) return undefined;
        return linkTo(`${cell.module}#${cell.name}`);
      },
      ...(isOnObservableCom() && { target: "_blank" })
    }),
    Plot.arrow(
      nodes
        .filter((d) => d.parent)
        .flatMap((d) => d.reused.map((reused) => ({ ...d, parent: reused }))),
      {
        x1: "y",
        y1: "x",
        x2: (d) => d.parent.y,
        y2: (d) => d.parent.x,
        bend: -10,
        strokeDasharray: [1, 5],
        stroke: "red",
        opacity: 0.5,
        inset: 14
      }
    ),
    Plot.text(nodes, {
      x: "y",
      y: "x",
      text: (d) => d.data._name,
      dy: 16
    })
  ]
})
```

## cellMap

```js
Inputs.table(filteredMap, {
  layout: "auto",
  format: {
    variables: (d) => d.length
  }
})
```

## `liveCellMap`

Prefer using this variable for an always live view of the runtime state

```js
viewof liveCellMap = {
  keepalive(cellMapModule, "maintain_live_cell_map");
  return Inputs.input(await cellMap());
}
```

```js
maintain_live_cell_map = {
  runtime_variables;
  viewof liveCellMap.value = await cellMap();
  viewof liveCellMap.dispatchEvent(new Event("input"));
}
```

## cellMap function

You can call it with zero args to default to the current runtime, or pass in a subset of variables to extract the cell structure from just those.

```js
import {cellMap, liveCellMap} from "@tomlarkworthy/cell-map"
```

If you wanted to use the visualizations in your own notebooks. You would import the views e.g.

```js
import {viewof cellMapViz, viewof detailViz, detailVizTitle} from "@tomlarkworthy/cell-map"
```

and then call them in your notebooks

```js
cellMap = async (variables, _moduleMap) => {
  const map = new Map();
  if (!variables) variables = runtime._variables;
  variables = [...variables];
  if (variables.length == 0) return map;
  if (!_moduleMap) _moduleMap = await moduleMap(variables[0]._module._runtime);

  // do one module at a time
  const modules = new Map();
  variables.forEach((v) => {
    const info = _moduleMap.get(v._module);
    if (!info) {
      console.warn("Cannot find module for ", v);
      return;
    }
    if (!modules.has(info.module)) {
      modules.set(info.module, []);
    }
    modules.get(info.module).push(v);
  });

  let c = 0;

  await Promise.all(
    [...modules.keys()].map(async (m) => {
      const variables = modules.get(m);
      const cells = new Map();
      try {
        const viewofs = new Set();
        const mutables = new Set();
        const imports = new Map();

        const sources = new Map(
          await Promise.all(
            variables
              .filter((v) => v._name)
              .map(async (v) => [v._name, await importedModule(v)])
          )
        );

        const moduleNamesPromises = new Map();

        const groups = variables.reduce((groups, v) => {
          if (v._name) {
            const source = sources.get(v._name);
            if (source) {
              if (!imports.has(source)) {
                imports.set(source, []);
                moduleNamesPromises.set(
                  source,
                  findModuleName(source, _moduleMap, {
                    unknown_id: v._name
                  })
                );
              }
              imports.get(source).push(v);
            } else if (v._name.startsWith("viewof ")) {
              cells.set(v, {
                type: "viewof",
                lang: ["ojs"]
              });
              viewofs.add(v);
              groups.set(v._name, []);
            } else if (v._name.startsWith("mutable ")) {
              const vars = [];
              cells.set(v, {
                type: "mutable",
                lang: ["ojs"]
              });
              mutables.add(v);
              groups.set(v._name, vars);
            } else if (v._name.startsWith("module ")) {
              // skip these
            } else if (v._name.startsWith("dynamic ")) {
              // skip these
            } else {
              cells.set(v, {
                type: "simple",
                lang: ["ojs"]
              });
              groups.set(v._name, [v]);
            }
          } else {
            cells.set(v, {
              type: "simple",
              lang: ["ojs"]
            });
            groups.set(c++, [v]);
          }
          return groups;
        }, new Map());

        const moduleNames = new Map(
          await Promise.all(
            [...moduleNamesPromises.entries()].map(async ([k, v]) => [
              k,
              await v
            ])
          )
        );
        for (const v of viewofs) {
          const name = v._name.substring(7);
          if (groups.has(name)) {
            groups.get(v._name).push(...[v, groups.get(name)[0]]);
            groups.delete(name);
          } else {
            groups.delete(v._name);
          }
        }

        for (const v of mutables) {
          const name = v._name.substring(8);
          const intital = "initial " + name;
          if (groups.has(name) && groups.has(intital)) {
            groups
              .get(v._name)
              .push(...[groups.get(intital)?.[0], v, groups.get(name)[0]]);

            cells.delete(groups.get(intital)[0]);
            cells.delete(groups.get(name)[0]);
            groups.delete(intital);
            groups.delete(name);
          } else {
            cells.delete(groups.get(v._name)[0]);
            cells.delete(groups.get(intital)[0]);
            cells.delete(groups.get(name)[0]);
            groups.delete(v._name);
            groups.delete(intital);
            groups.delete(name);
          }
        }

        for (const [module, variables] of imports.entries()) {
          const module_name = moduleNames.get(module);
          cells.set(variables[0], {
            type: "import",
            lang: ["ojs"],
            module_name: module_name
          });
          const name = `module ${module_name}`;
          groups.set(name, variables);
        }

        map.set(
          m,
          [...groups.entries()].map(([name, variables]) => ({
            name,
            module: _moduleMap.get(variables[0]._module).name,
            ...cells.get(
              typeof name == "string" && name.startsWith("mutable")
                ? variables[1]
                : variables[0]
            ),
            variables: variables
          }))
        );
      } catch (e) {
        debugger;
        throw e;
      }
    })
  );
  return map;
}
```

### `cellMapCompat`

Migration helper from old cellMap

```js
cellMapCompat = async (module, { excludeInbuilt = true } = {}) => {
  const map = await cellMap(
    [...module._runtime._variables].filter(
      (v) => v._module == module && (!excludeInbuilt || v._type == 1)
    )
  );
  const cells = map.get(module) || [];
  return new Map(cells.map((c) => [c.name, c.variables]));
}
```

## Visualizations

```js
nodeToSymbol = (node) =>
  ({
    viewof: "triangle",
    mutable: "cross",
    import: "square",
    simple: "circle"
  }[variableToCell.get(node.data)?.type] || "diamond")
```

```js
focus_variables = cellMapViz
  ? [
      ...descendants(cellMapViz.variables[0]),
      ...ascendants(cellMapViz.variables[0])
    ]
  : []
```

```js
focus_cells = new Set(focus_variables.map((v) => variableToCell.get(v)))
```

```js
descendents = d3.hierarchy(
  cellMapViz ? cellMapViz.variables[0] : [],
  (variable) => {
    return variable._inputs;
  }
)
```

```js
/**
 * Collapse duplicates to the **deepest** occurrence and record all parents.
 * Mutates the hierarchy into a DAG.
 */
function dedupeHierarchy(root) {
  const key = (n) => n.data;
  const deepest = new Map(); // datum → deepest node

  // pass-1: pick deepest representative
  root.each((n) => {
    const k = key(n);
    if (!deepest.has(k) || n.depth > deepest.get(k).depth) deepest.set(k, n);
  });
  deepest.forEach((n) => {
    n.reused = [];
  });

  // pass-2: alias shallower nodes → deepest
  root.each((n) => {
    const rep = deepest.get(key(n));
    n.name = n.data._name;
    const p = n.parent;
    if (n !== rep) {
      if (p) {
        p.children = p.children.map((c) => (c === n ? rep : c));
        if (!rep.reused.includes(p) && p == deepest.get(key(p)))
          rep.reused.push(p);
      }
    }
  });
  return root;
}
```

```js
layout = d3.tree()(descendents)
```

```js
clustered = dedupeHierarchy(layout)
```

```js
nodes = clustered.descendants().map((n) => ({ name: n.data._name, ...n }))
```

### visualize the cell ordering

```js
runtimeMap = {
  runtime_variables;
  return [...liveCellMap.values()].flat();
}
```

```js
variableToCell = new Map(
  runtimeMap.flatMap((cell) => cell.variables.map((v) => [v, cell]))
)
```

```js
filteredMap = runtimeMap.filter(filter)
```

```js
filter = (v) =>
  (showBuiltins || (v.module !== "builtin" && v.name !== "module builtin")) &&
  (showAnon || typeof v.name == "string")
```

```js
edges = filteredMap.flatMap((cell) =>
  cell.variables.flatMap((variable) =>
    variable._inputs
      .map((input) => [variableToCell.get(variable), variableToCell.get(input)])
      .filter(([source, imported]) => imported && filter(imported))
  )
)
```

```js
import { linkTo, isOnObservableCom } from "@tomlarkworthy/lopepage-urls"
```

```js
import { moduleMap, runtime } from "@tomlarkworthy/module-map"
```

```js
import {
  keepalive,
  runtime_variables,
  lookupVariable,
  thisModule,
  toObject,
  repositionSetElement,
  ascendants,
  descendants
} from "@tomlarkworthy/runtime-sdk"
```

```js
import { expect } from "@tomlarkworthy/jest-expect-standalone"
```

```js
viewof cellMapModule = thisModule()
```

```js
import { tests } from "@tomlarkworthy/tests"
```

## testing

```js echo
tests({
  filter: (t) =>
    t.name.includes("@tomlarkworthy/cell-map") || t.name.includes("main")
})
```

```js echo
const modules = moduleMap(runtime)
```

```js echo
const moduleLookup = new Map([...modules.values()].map((info) => [info.name, info]))
```

low-level variables in this module

```js
Inputs.table(
  [...runtime_variables]
    .filter((v) => v._module == cellMapModule)
    .map(toObject),
  {
    columns: [
      "_name",
      "_inputs",
      "_definition",
      "_type",
      "_reachable",
      "_observer",
      "_module"
    ],
    format: {
      _inputs: (i) => i.map((i) => i._name).join(", "),
      _observer: (i) => i.toString(),
      _module: (m) => modules.get(m).name
    }
  }
)
```

```js echo
const unreached_main_import = toObject &&
  lookupVariable("repositionSetElement", cellMapModule)
```

```js echo
const reached_main_import = runtime && lookupVariable("runtime", cellMapModule)
```

<!--
NEED TO CHANGE MUTABLES
--->

```js
mutable main_mutable = "OK"
```

```js
const test_importedModule = {
  expect(modules.get(await importedModule(reached_main_import)).name).toBe(
    "@tomlarkworthy/module-map"
  );

  expect(modules.get(await importedModule(unreached_main_import)).name).toBe(
    "@tomlarkworthy/runtime-sdk"
  );

  return "ok";
}
```

```js echo
const test_findModuleName = {
  expect(
    findModuleName(await importedModule(reached_main_import), modules)
  ).toBe("@tomlarkworthy/module-map");

  expect(
    findModuleName(await importedModule(unreached_main_import), modules)
  ).toBe("@tomlarkworthy/runtime-sdk");

  return "ok";
}
```

```js echo
const test_cellmap_mutable = {
  const initialMutable =
    main_mutable &&
    (await lookupVariable("initial main_mutable", cellMapModule));
  const mutableMutable =
    main_mutable &&
    (await lookupVariable("mutable main_mutable", cellMapModule));
  const mainMutable =
    main_mutable && (await lookupVariable("main_mutable", cellMapModule));
  const mapped = await cellMap(
    [initialMutable, mutableMutable, mainMutable],
    modules
  );
  const module = mapped.get(cellMapModule);
  expect(module).toHaveLength(1);
  const mutableCell = module[0];

  expect(mutableCell.type).toBe("mutable");
  expect(mutableCell.variables).toHaveLength(3);
  return mutableCell;
}
```

### Notebook 2.0 Compatibility

<!--
NEED TO EXAMINE VIEWOF
--->


```js
const cellMapVizView = viewof cellMapViz
```

```js
const detailVizView = viewof detailViz
```


### Utilities

```js echo
const importedModule = async (v) => {
  if (
    // imported variable is observed
    v._inputs.length == 1 && // always a single dependancy
    v._inputs[0]._module !== v._module // bridging across modules
  )
    return v._inputs[0]._module;

  // Import from API
  // 'async () => runtime.module((await import("/@tomlarkworthy/exporter.js?v=4&resolutions=ab5a63c64de95b0d@298")).default)'
  /*
  if (
    v._inputs.length == 0 &&
    v._definition.toString().includes("runtime.module((await import")
  ) {
    debugger;
    v._value = await v._definition();
    return v._value;
  }*/
  if (
    // imported variable unobserved and loaded by API
    v._inputs.length == 2 && // always a single dependancy
    v._inputs[1]._name == "@variable" // bridging across modules
  ) {
    if (v._inputs[0]._value) return v._inputs[0]._value;
    else {
      return;
      //const module = await v._inputs[0]._definition();
      //debugger;
      //return module;
    }
  }

  // The inline case for live notebook
  // _definition: "async t=>t.import(e.name,e.alias,await i)"
  if (
    v._inputs.length == 1 &&
    v._inputs[0]._name == "@variable" &&
    v._definition.toString().includes("import(")
  ) {
    return await new Promise(async (resolve, reject) => {
      try {
        await v._definition({
          import: (...args) => resolve(args[2])
        });
      } catch (err) {
        if (v._definition.toString().includes("derive")) {
          console.error("Subbing derrived module for original", v);
          const derrived = await v._definition(v);
          resolve(derrived._source);
        } else {
          console.error("Cannot sourceModule for ", v);
          debugger;
          throw err;
        }
      }
    });
  }

  return null;
};
display(importedModule)
```

```js echo
const findModuleName = (module, moduleMap, { unknown_id = Math.random() } = {}) => {
  try {
    const lookup = moduleMap.get(module);
    if (lookup) return lookup.name;
    return `<unknown ${unknown_id}>`;
  } catch (e) {
    debugger;
    return "error";
  }
};
display(findModuleName)
```

```js echo
//import { hash } from "@jashkenas/url-querystrings-and-hash-parameters"
import { hash } from "/components/url-querystrings-and-hash-parameters.js";
display(hash)
```
