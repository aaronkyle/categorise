//# Accessing a Notebook's Runtime

// This file is based on https://observablehq.com/@mootari/access-runtime



import { Mutable, Generators } from "@observablehq/stdlib";

import * as Inputs from "@observablehq/inputs";
import * as htl from "htl";

export function view(element, display) {
  if (!display) throw new Error("view(element, display): missing display()");
  // Resolve element thunk
  const el = (typeof element === "function") ? element() : element;
  display(el);

  // Wire up the generator of values
  const gen = Generators.input(el);
  let current;
  (async () => { for await (const v of gen) current = v; })();

  // Callable getter + async-iterable facade
  const getter = () => current;
  getter[Symbol.asyncIterator] = () => gen[Symbol.asyncIterator]();
  return getter;
}

/** Minimal `display` helper for non-Framework contexts */
export function display(el, parent = document.body) {
  parent.appendChild(el);
  return el;
}


//mutable recomputeTrigger = 0
const recomputeTrigger = Mutable(0)
const set_recomputeTrigger = (t) => recomputeTrigger.value = t;

const captureRuntime = new Promise(resolve => {
  const forEach = Set.prototype.forEach;
  Set.prototype.forEach = function(...args) {
    const thisArg = args[1];
    forEach.apply(this, args);
    if(thisArg && thisArg._modules) {
      Set.prototype.forEach = forEach;
      resolve(thisArg);
    }
  };
  //mutable recomputeTrigger = mutable recomputeTrigger + 1;
  set_recomputeTrigger(recomputeTrigger + 1)
})

// const runtime = captureRuntime
const runtime = await captureRuntime

const modules = () => {
  // Builtins are stored in a separate module.
  const builtin = runtime._builtin;
  // Imported modules are keyed by their define() functions, which we don't need here.
  const imports = new Set(runtime._modules.values());
  // Find all modules by retrieving them directly from the variables.
  // Derived modules are "anonymous" but keep a reference to their source module.
  const source = m => !m._source ? m : source(m._source);
  const modules = new Set(Array.from(runtime._variables, v => source(v._module)));
  // When you edit a notebook on observablehq.com, Observable defines the
  // variables dynamically on main instead of creating a separate module.
  // When embedded however the entry notebook also becomes a Runtime module.
  const main = [...modules].find(m => m !== builtin && !imports.has(m));
  
  const _imports = [...imports];
  const labels = [
    [builtin, 'builtin'],
    [main || _imports.shift(), 'main'],
    ..._imports.map((m, i) => [m, `child${i+1}`]),
  ];
  
  return new Map(labels);
}

const main = Array.from(modules).find(d => d[1] === 'main')[0]

const no_observer = () => {
  const v = main.variable();
  const o = v._observer;
  v.delete();
  return o;
}

function observed(variable = null) {
  const _observed = v => v._observer !== no_observer;
  if(variable !== null) return _observed(variable);
  const vars = new Set();
  for(const v of runtime._variables) _observed(v) && vars.add(v);
  return vars;
}

const ex_refresh = view(Inputs.button('Refresh'))

const ex_vars = (() => {
  ex_refresh();  // side effects
  return Array.from(runtime._variables).map(v => ({
    name: v._name,
    module: modules.get(v._module),
    type: [, 'normal', 'implicit', 'duplicate'][v._type],
    observed: v._observer !== no_observer,
    inputs: v._inputs.length,
    outputs: v._outputs.size
  }));
})();

const ex_vars_filters = () => view(() => {
  const unique = (arr, acc) => Array.from(new Set(arr.map(acc))).sort((a, b) => a?.localeCompare?.(b));
  const modules = unique(ex_vars, v => v.module);
  const types = unique(ex_vars, v => v.type);
  const value = this?.value ?? {};

  return Inputs.form({
    modules: Inputs.checkbox(modules, {
      label: 'Modules',
      value: value.modules ?? modules,
    }),
    types: Inputs.checkbox(types, {
      label: 'Types',
      value: value.types ?? types,
    }),
    features: Inputs.checkbox(['named', 'observed', 'inputs', 'outputs'], {
      label: 'Features',
      value: value.features ?? [],
    })
  });
});

const ex_vars_table = () => {
  const flags = (arr) => Object.fromEntries(arr.map(v => [v, true]));
  const modules = flags(ex_vars_filters.modules);
  const types = flags(ex_vars_filters.types);
  const {named, observed, inputs, outputs} = flags(ex_vars_filters.features);

  const data = ex_vars.filter(d => true
    && modules[d.module]
    && types[d.type]
    && (!named || d.name != null)
    && (!observed || d.observed)
    && (!inputs || d.inputs)
    && (!outputs || d.outputs)
  );
  return Inputs.table(data);
}

const ex_deps = () => {
  ex_refresh;
  
  const vars = Array.from(observed(), d => ({
    name: d._name,
    inputs: Array.from(d._inputs, d => d._name)
  }));
  const inputs = new Set();
  for(const {inputs: i} of vars) for(const n of i) inputs.add(n);

  return Inputs.table(
    vars.map(d => ({
      '': d.name,
      ...Object.fromEntries(d.inputs.map(n => [n, '✔️'])),
    })),
    {
      columns: ['', ...Array.from(inputs).sort((a, b) => a.localeCompare(b))],
      header: {
        '': htl.html`<em>_name`
      }
    }
  );
  
}
