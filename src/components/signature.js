// # Signature - A Documentation Toolkit
// keywords: javadoc docgen docblock
// This module exports the helpers used in the notebook version, with examples left as comments.

// NOTE: Demo calls like `signature(...)` are commented out to avoid side effects when importing this file.

// --- Imports (kept stylistically consistent with your code) ------------------------------------
import { DOM } from '/components/DOM.js';
import { html } from "htl";
import * as Promises from "/components/promises.js";
import markdownit from "npm:markdown-it";

// --- Markdown helper -------------------------------------------------------------------------
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

// --- Identifier + frontmatter helpers (moved up to avoid TDZ) ---------------------------------
// A pattern that matches notebook URLs, slugs and IDs in various formats.
// Named search groups: id, user, slug, version
const regIdentifier = new RegExp('^'
                     + '(?:(?:https:\/\/(next\\.)?observablehq\\.com)?\/)?'
                     + '(?:'
                     + '(?:d\/)?(?<id>[a-f0-9]{16})'
                     + '|'
                     + '@(?<user>[0-9a-z-_]{2,})\/(?<slug>[0-9a-z-_]{1,}(?:\/\\d+)?)'
                     + ')'
                     + '(?:@(?<version>\\d+))?'
                     + '([?#]|$)')

const parseFrontmatter = v1Source => {
  const match = v1Source.match(/^(?:[^\n]+\n){4}/);
  if(!match) return null;
  const lines = match[0].slice(0, -1).split(/\n/);
  return Object.fromEntries(lines.map(s => {
    const [, key, value] = s.match(/\/\/ ([^:]+):\s+(.+)$/);
    return [key.toLowerCase(), value];
  })
)}

// --- signature() ----------------------------------------------------------------------------
// signature(signature, { ...examples/tests... })
// (Commented out; see notebook docs.)
/*
signature(signature, {
  description: md`
Documentation template for functions. Extracts the function head from the function passed to **\`fn\`**:
- If \`fn\` is a named function, the head is returned as written. If \`name\` was set, it will replace the function name.
- If \`fn\` is an arrow function, the declaration will be reformatted and the \`function\` keyword injected. If \`name\` was set, it will be injected as the function name.
- Any other argument type is passed through unaltered.

**Note:** Javascript may infer the function name from the variable to which a function was first assigned.

All settings are optional. Available **\`options\`**:
${Object.entries({
      description: 'Rendered as Markdown if a string, otherwise passed through.',
      example:  'Single value or array of values. String values are formatted as Javascript code, everything else gets passed through.',
      name: 'Anchor name to link to. Defaults to function name.',
      scope: 'Class name to scope CSS selectors. Defaults to unique string.',
      css: 'The theme CSS. If \`scope\` is used, the CSS should start every selector with \`:scope\`. Defaults to \`signature_theme\`.',
      open: 'Boolean that controls the toggle state of the details wrapper. Set to \`null\` to disable collapsing.',
      tests: 'Object map of test functions, keyed by test name. Each function receives \`assert(condition, assertion)\`   as argument. Async functions are supported.',
      runTests: 'Boolean or Promise, controls test execution. Set to \`false\` to disable test output.',
      testRunner: 'Executes tests and builds results markup. See [\`defaultTestRunner()\`](#defaultTestRunner) for details.',
    }).map(([k,v]) => `- \`${k}:\` ${v}\n`)}`,
  example: [`
// Basic use
signature(myUsefulFunc, {
  description: "It's hard to describe how useful myUsefulFunc is. I use it all the time!"
})
  `, `
// Tests
signature(myTestedFunc, {
  tests: {
    'can retrieve data': async (assert) => {
      const data = await myTestedFunc().getData();
      assert(Array.isArray(data), 'data is array');
      assert(data.length, 'data is not empty');
    },
    'is this finished?': assert => {
      assert(myTestedFunc() !== 'todo: implement', 'actually implemented');
    },
    'Look, ma! No assert!': () => {
      try { myTestedFunc().notImplemented() }
      catch(e) { throw Error(\`Hey signature(), catch this! ${e}\`) };
    }
}})
  `,],
  tests: {
    'signature parsing': assert => {
      const test = (expect, name, fn) => {
        const sig = signature(fn, {name, formatter: ({signature:s}) => s.textContent.trim()});
        assert(expect === sig, `expected "${expect}", got "${sig}"`);
      };
      {test('function()', undefined, function(){})}
      {test('function foo1()', undefined, function foo1(){})}
      {test('function foo2()', 'foo2', function(){})}
      {test('function()', undefined, ()=>{})}
      {test('function foo3()', 'foo3', ()=>{})}
      {test('async function()', undefined, async ()=>{})}
      {test('async function foo4(a)', 'foo4', async a=>{})}
      {test('async function foo5()', undefined, async function foo5(){})}
      {test('async function foo5a()', 'foo5a', async function foo5(){})}
      {test('async function* foo6()', 'foo6', async function*(){})}
      {test('function*()', undefined, function * (){})}
      {test('function(a,b=({foo:"bar"}))', undefined, (a,b=({foo:"bar"}))=>{})}
    }
  }
})
*/

function signature(fn, options = {}) {
  const {
    name = typeof fn === 'function' && fn.name.length ? fn.name : null,
    description = null,
    example = null,
    open = true,
    
    tests = {},
    runTests = RUN_TESTS.promise,
    testRunner = defaultTestRunner,
    
    scope = DOM.uid('css-scope').id,
    css = signature_theme,
    formatter = defaultFormatter,
    
    signatureParser = defaultSignatureParser,
  } = options;
  
  const sig = typeof fn !== 'function' ? fn : signatureParser(fn, name);
  let testList = null;
  
  if(runTests && tests && Object.keys(tests).length) {
    const {list, run} = testRunner(tests);
    const button = html`<button>Run tests`, cta = html`<p class=cta>${button} to view results`;
    testList = html`<div class=tests>${[md`Test results:`, cta]}`;
    Promise.race([Promise.resolve(runTests), new Promise(r => button.onclick = r)])
      .then(() => (cta.replaceWith(list), run()));
  }
  
  return formatter({
    signature: typeof sig === 'string' ? code(sig) : sig,
    description: typeof description === 'string' ? md`${description}` : description,
    examples: (example == null ? [] : Array.isArray(example) ? example : [example])
      .map(v => typeof v === 'string' ? code(v) : v),
    testList,
  }, {name, open, css, scope});
}

// --- getPinnedSlug() ------------------------------------------------------------------------
// signature(getPinnedSlug, { ...examples/tests... })
/*
signature(getPinnedSlug, {
  description: 'Retrieves the currently shared or published version of the given notebook identifier.',
  example: [
    `// Notebook slug
getPinnedSlug('@mootari/signature')`,
    `// Notebook ID
getPinnedSlug('3d9d1394d858ca97')`,
  ],
  tests: {
    'custom slug': async assert => {
      assert((await getPinnedSlug('@mootari/signature')).match(/@\d+$/))
    },
    'notebook id': async assert => {
      assert((await getPinnedSlug('3d9d1394d858ca97')).match(/@\d+$/))
    },
    'pinned': async assert => {
      assert((await getPinnedSlug('@mootari/signature@545')).match(/@545$/))
    },
    'fallback unpublished': async assert => {
      assert((await getPinnedSlug('@mootari/signature@544')) === '@mootari/signature')
    },
  },
})
*/

async function getPinnedSlug(identifier) {
  const {groups} = identifier.match(regIdentifier) || {};
  if(!groups) return null;
  const {id, user, slug, version} = groups;
  const name = id || `@${user}/${slug}`;
  const path = `${id ? `d/${id}` : name}${version ? `@${version}` : ''}`;
  return fetch(`https://api.observablehq.com/${path}.js?v=1`)
    .then(r => r.text())
    .catch(e => '')
    .then(t => parseFrontmatter(t) || {})
    .then(({version: v}) => name + (v ? `@${v}` : ''));
}

// --- PINNED ---------------------------------------------------------------------------------
// signature('PINNED', { ...docs... })
/*
signature('PINNED', {
  name: 'PINNED',
  description: `Notebook slug, automatically pointing to the most recent version of the importing notebook.
    
If the notebook identifier cannot be derived from the current URL, the string \`(error: name not detectable)\`  will be set instead.`,
  example: `md\`
~~~js
import {foo} from "${PINNED}"
~~~
\`
})
*/

const PINNED = (() => {
  const match = document.baseURI.match(regIdentifier);
  if(!match) return '(error: name not detectable)';
  const {id, user, slug} = match.groups;
  return getPinnedSlug(id || `@${user}/${slug}`);
})();

// --- code() ---------------------------------------------------------------------------------
// signature(code, { ...docs... })
/*
signature(code, {
  description: `Creates syntax-highlighted output.`,
  example: `
const myCss = \`.container { background: red; }\`;
return code(myCss, {
  // Optional, defaults to Javascript. Supported languages:
  // 
  language: 'css',
  // Removes leading and trailing empty lines.
  trim: false
});`,
})
*/

function code(text, {type = 'javascript', trim = true} = {}) {
  return md`\`\`\`${type}
${!trim ? text : text.replace(/^\s*\n|\s+?$/g, '')}
\`\`\``;
}

// --- RUN_TESTS ------------------------------------------------------------------------------
// signature('RUN_TESTS', { ...docs... })
/*
signature('RUN_TESTS', {
  name: 'RUN_TESTS',
  description: `Button that triggers all tests that have not run yet.`,
  example: `
import {RUN_TESTS} from "${PINNED_LIB}"
// In another cell:
RUN_TESTS
`
})
*/

const RUN_TESTS = (() => {
  const s = createStepper();
  const viewEl = html`<div><button>Run all tests`;
  viewEl.onclick = e => { e.stopPropagation(); s.next(); };
  viewEl.value = s;
  return viewEl;
})();

// --- Internals ------------------------------------------------------------------------------
const signature_theme = `
:scope {
  --line-color: #eee;
  border: 1px solid var(--line-color);
  padding: .5em 1em;
  margin-bottom: 1em;
}
:scope > div {
  border-top: 1px solid var(--line-color);
}
:scope > summary:focus {
  outline: none;
}
:scope > summary {
  padding-left: 1.2em;
  padding-top: 1em;
  position: relative;
}
:scope > summary::-webkit-details-marker {
  display: none;
}
:scope > summary:before {
  position: absolute;
  left: 0;
  content: "►";
}
:scope[open] > summary:before {
  content: "▼";
}
:scope .signature {
  display: flex;
  align-items: start;
}
:scope .signature pre {
  margin-top: 0;
}
:scope .examples .code {
  background: #f5f5f5;
  padding: .5rem;
}
:scope .link:before {
  content: "";
  display: block;
  width: 1rem;
height: 1.3rem;
  background: url(https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/png/32/link.png) center 100%/contain no-repeat;
  margin-left: .5rem;
  opacity: .3;
}
:scope .signature:hover .link:hover:before { opacity: 1}
:scope .tests .cta {
  font-style: italic;
}
:scope .tests th, :scope .tests td { padding: .25em .5em }
:scope .tests tr[data-status="pending"] { background: hsl(40,90%,90%); opacity: .5 }
:scope .tests tr[data-status="error"]   { background: hsl( 0,90%,90%)}
:scope .tests tr[data-status="success"] { background: hsl(90,90%,90%)}
`;

function createStepper() {
  let cb = ()=>{};
  const ret = {
    step: -1,
    next: () => {
      ret.step++;
      cb();
      ret.promise = new Promise(res=>cb=res);
      return ret;
    }
  };
  return ret.next();
}

// function defaultFormatter(...) { ... } (kept as your revised version)
function defaultFormatter({signature, description, examples, testList}, {name, open, scope, css}) {
  const header =
    open == null
      ? html`<div class=signature>${signature}${!name || !name.length ? '' : html`<a class=link href="#${name}">`}`
      : html`<summary class=signature>${signature}${!name || !name.length ? '' : html`<a class=link href="#${name}">`}`;

  const body = [
    !css ? '' : scope == null ? css : scopedStyle('.' + scope, css),
    header,
    description == null ? '' : html`<div class=description>${description}`,
    !examples.length ? '' : html`<div class=examples>${[
      examples.length < 2 ? md`Example:` : md`Examples:`,
      ...examples
    ]}`,
    testList || '',
  ];

  return open == null
    ? html`<div class="${scope}">${body}`
    : html`<details class="${scope}" ?open=${open}>${body}`;
}

function defaultTestRunner(tests, options = {}) {
  const {
    assert = (cond, msg = 'error') => { if(!cond) throw msg },
    formatList = items => html`<table><thead><tr><th>Name</th><th>Result</th></tr><body>${items}`,
    formatItem = (name, status, msg) => {
      const state = status == null ? 'pending' : status ? 'success' : 'error';
      const icon = { pending: '⌛', success: '✅', error: '❗'}[state];
      return html`<tr data-status=${state}>
        <td>${DOM.text(name)}</td>
        <td><span title=${state}>${icon}</span> ${msg||''}</td>`;
    },
    run = (fn, name) => fn.call(null, assert),
  } = options;
  
  const runners = Object.entries(tests).map(([name, fn]) => ({
    name,
    node: formatItem(name),
    run: async() => {
      try { await run(fn, name) }
      catch(e) { return e; }
    }
  }));

  return {
    list: formatList(runners.map(r => r.node)),
    run: () => Promise.all(runners.map(
      ({name, node, run}) => run().then(msg => node.replaceWith(formatItem(name, msg === undefined, msg)))
    ))
  };
}

function defaultSignatureParser(fn, name = null) {
  const src = fn.toString();
  let end = 0, r = 0;
  const next = c => {
    switch(c) {
      case '(': ++r; break;
      case ')': --r; break;
      case '{':
      case '=': if(r === 0) return false;
    }
    return true;
  }
  while(end < src.length && next(src[end++]));
  
  const sig = src.substring(0, end - 1).trim(),
        [prefix, mAsync, mFunc, mGen] = sig.match(/^(async\s*)?(function\s*)?(\*)?/),
        mName = mFunc
          ? (sig.substring(prefix.length).match(/^[^(]*/) || [])[0]
          : null,
        fnName = name !== null ? name.trim()
          : mName !== null ? mName.trim()
          : '',
        offset = prefix.length + (mName !== null ? mName.length : 0),
        suffix = sig.substring(offset).trim();

  return `${
    mAsync ? 'async ' : ''
  }function${
    mGen ? '*' : ''
  }${
    fnName.length ? ` ${fnName}` : ''
  }${
    suffix[0] === '(' ? suffix : `(${suffix})`
  }`;
}

function scopedStyle(scope, css) {
  const style = html`<style>`;
  style.textContent = css.replace(/\:scope\b/g, scope); 
  return style;
}

// --- Derived constant that depends on getPinnedSlug ------------------------------------------
const PINNED_LIB = getPinnedSlug('@mootari/signature')

// --- Old docs / demo function (kept) ---------------------------------------------------------
function demoFunction(sw, sh, tw = null, th = null) {
  if(tw == null && th == null) return [sw, sh, 1];
  const ar = sw / sh;
  return tw == null || (th != null && ar < tw / th)
    ? [th * ar, th, th / sh]
    : [tw, tw / ar, tw / sw];
}

// scopedStyle('.my-shared-scope', ` ... `)
/*
// Scope is applied as a class - note the dot in the scope argument.
scopedStyle('.my-shared-scope', `
${signature_theme}
// Adds 
:scope { border: 10px solid #888 }
`)
*/

function myCustomSig(fn, options = {}) {
  return signature(fn, {scope: 'my-shared-scope', css: null, ...options});
}

// --- Testing (interactive demo, commented out) ----------------------------------------------
/*
const runType = view(DOM.select([
  'wait for interaction',
  'run immediately',
  'hide tests',
]))

signature(demoFunction, {
  description: `Scales dimensions proportionally to fit into the given width and/or height.`,
  example: `
const [width, height, scale] = scaleContain(img.naturalWidth, img.naturalHeight, 500, 500);
img.width = width;
img.height = height;
`,
  runTests: {
    'run immediately': true,
    'hide tests': false,
    'wait for interaction': RUN_TESTS.promise,
  }[runType],
  // Note: Tests contain deliberate errors to showcase the various states.
  tests: {
    'no target dimensions': assert => {
      ({}).callUndefined();
      const [w, h, s] = demoFunction(200, 150);
      assert(w === 200, 'width'); assert(h === 150, 'height'); assert(s === 1, 'scale');
    },
    'target width only': async assert => {
      await Promises.delay(3000);
      const [w, h, s] = demoFunction(200, 150, 2*200);
      assert(w === 2*200, 'width'); assert(h === 2*150, 'height'); assert(s === 2, 'scale');
    },
    'target height only': assert => {
      const [w, h, s] = demoFunction(200, 150, null, 2*150);
      assert(w === 2*200, 'width'); assert(h === 2*150, 'height'); assert(s === 2, 'scale');
    },
    'same aspect': assert => {
      const [w, h, s] = demoFunction(200, 150, 2*200, 2*150);
      assert(w === 2*200, 'width'); assert(h === 2*150, 'height'); assert(s === 2, 'scale');
    },
    'smaller aspect ratio': async assert => {
      await Promises.delay(2000);
      const [w, h, s] = demoFunction(200, 150, 3*200, 2*150);
      assert(w === 2*200, 'width'); assert(h === 2*150, 'height'); assert(s === 0, 'scale');
    },
    'greater aspect ratio': assert => {
      const [w, h, s] = demoFunction(200, 150, 3*200, 2*150);
      assert(w === 2*200, 'width'); assert(h === 2*150, 'height'); assert(s === 2, 'scale');
    },
  }
})
*/

// --- Exports --------------------------------------------------------------------------------
export {
  signature,
  getPinnedSlug,
  PINNED,
  code,
  RUN_TESTS,
  signature_theme,
  createStepper,
  defaultFormatter,
  defaultTestRunner,
  defaultSignatureParser,
  scopedStyle,
  regIdentifier,
  parseFrontmatter,
  PINNED_LIB,
  demoFunction,
  myCustomSig,
};
