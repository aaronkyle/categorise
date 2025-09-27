/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/@observablehq/inputs@0.12.0/dist/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import {
    html as e
} from "https://cdn.jsdelivr.net/npm/htl@0.3.1/+esm";
import {
    format as t,
    parse as n
} from "https://cdn.jsdelivr.net/npm/isoformat@0.2.1/+esm";

function i(e) {
    return null == e ? null : "number" == typeof e ? `${e}px` : `${e}`
}

function r(e) {
    return {
        "--input-width": i(e)
    }
}
const o = {
    bubbles: !0
};

function a(e) {
    e.preventDefault()
}

function l({
    currentTarget: e
}) {
    (e.form || e).dispatchEvent(new Event("input", o))
}

function u(e) {
    return e.checkValidity()
}

function s(e) {
    return e
}
let c = 0;

function f() {
    return "inputs-3a86ea-" + ++c
}

function d(t, n) {
    if (t) return t = e`<label>${t}`, void 0 !== n && (t.htmlFor = n.id = f()), t
}

function p(t = "≡", {
    label: n = "",
    value: r,
    reduce: o,
    disabled: u,
    required: c = !1,
    width: f
} = {}) {
    const p = "string" == typeof t || t instanceof Node;
    p ? (c || void 0 !== r || (r = 0), void 0 === o && (o = (e = 0) => e + 1), u = new Set(u ? [t] : []), t = [
        [t, o]
    ]) : (c || void 0 !== r || (r = null), u = new Set(!0 === u ? Array.from(t, (([e]) => e)) : u || void 0));
    const m = e`<form class=inputs-3a86ea>`;
    m.addEventListener("submit", a);
    const v = {
            width: i(f)
        },
        h = Array.from(t, (([t, n = s]) => {
            if ("function" != typeof n) throw new TypeError("reduce is not a function");
            return e`<button disabled=${u.has(t)} style=${v} onclick=${e=>{m.value=n(m.value),l(e)}}>${t}`
        }));
    return (n = d(n, p ? h[0] : void 0)) && m.append(n), m.append(...h), m.value = r, m
}

function m(e) {
    return Array.isArray(e) ? e : Array.from(e)
}

function v(e) {
    return !!e && "function" == typeof e[Symbol.iterator]
}

function h(e) {
    return v(e.columns) ? e.columns : e.schema && v(e.schema.fields) ? Array.from(e.schema.fields, (e => e.name)) : "function" == typeof e.columnNames ? e.columnNames() : void 0
}

function $(e) {
    return null == e ? "" : `${e}`
}
const y = N((e => {
        const t = b(e);
        return e => null == e ? "" : "number" == typeof e ? t(e) : e instanceof Date ? k(e) : `${e}`
    })),
    b = N((e => t => 0 === t ? "0" : t.toLocaleString(e))),
    g = y(),
    w = b();

function x(e) {
    const t = e.toString(),
        n = t.length;
    let i, r = -1;
    e: for (let e = 1; e < n; ++e) switch (t[e]) {
        case ".":
            r = i = e;
            break;
        case "0":
            0 === r && (r = e), i = e;
            break;
        default:
            if (!+t[e]) break e;
            r > 0 && (r = 0)
    }
    return r > 0 ? t.slice(0, r) + t.slice(i + 1) : t
}

function k(e) {
    return t(e, "Invalid Date")
}

function N(e) {
    let t, n = N;
    return (i = "en") => i === n ? t : t = e(n = i)
}

function A(e, t) {
    return E(t) - E(e) || (e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN)
}

function S(e, t) {
    return E(t) - E(e) || (t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN)
}

function E(e) {
    return null != e && !Number.isNaN(e)
}
const O = ([e]) => e,
    z = ([, e]) => e;

function j({
    multiple: e,
    render: t,
    selectedIndexes: n,
    select: i
}) {
    return function(r, {
        locale: o,
        keyof: u = (r instanceof Map ? O : s),
        valueof: c = (r instanceof Map ? z : s),
        format: f = (e => (t, n, i) => e(u(t, n, i)))(y(o)),
        multiple: d,
        key: p,
        value: v,
        disabled: h = !1,
        sort: $,
        unique: b,
        ...g
    } = {}) {
        if ("function" != typeof u) throw new TypeError("keyof is not a function");
        if ("function" != typeof c) throw new TypeError("valueof is not a function");
        if ("function" != typeof f) throw new TypeError("format is not a function");
        void 0 !== e && (d = e), $ = function(e) {
            if (void 0 === e || !1 === e) return;
            if (!0 === e || "ascending" === e) return A;
            if ("descending" === e) return S;
            if ("function" == typeof e) return e;
            throw new TypeError("sort is not a function")
        }($);
        let w = +d;
        void 0 === v && (v = void 0 !== p && r instanceof Map ? w > 0 ? Array.from(p, (e => r.get(e))) : r.get(p) : void 0), b = !!b;
        let x = (r = m(r)).map(((e, t) => [u(e, t, r), t]));
        void 0 !== $ && x.sort((([e], [t]) => $(e, t))), b && (x = [...new Map(x.map((e => [q(e[0]), e]))).values()]);
        const k = x.map(z);
        !0 === d ? w = Math.max(1, Math.min(10, k.length)) : w > 0 ? d = !0 : (d = !1, w = void 0);
        const [N, E] = t(r, k, function(e, t, n, i, r) {
            const o = new Set(void 0 === n ? [] : i ? m(n) : [n]);
            if (!o.size) return () => !1;
            const a = new Set;
            for (const n of t) o.has(r(e[n], n, e)) && a.add(n);
            return e => a.has(e)
        }(r, k, v, d, c), function(e, t, n, i) {
            if ("boolean" == typeof n) return n;
            const r = new Set(m(n)),
                o = new Set;
            for (const n of t) r.has(i(e[n], n, e)) && o.add(n);
            return e => o.has(e)
        }(r, k, h, c), {
            ...g,
            format: f,
            multiple: d,
            size: w
        });

        function j(e) {
            if (e && e.isTrusted && N.removeEventListener("change", l), d) v = n(E).map((e => c(r[e], e, r)));
            else {
                const e = function(e) {
                    return e.value ? +e.value : -1
                }(E);
                v = e < 0 ? null : c(r[e], e, r)
            }
        }
        return N.addEventListener("input", j), N.addEventListener("change", l), N.addEventListener("submit", a), j(), Object.defineProperty(N, "value", {
            get: () => v,
            set(e) {
                if (d) {
                    const t = new Set(e);
                    for (const e of E) {
                        const n = +e.value;
                        i(e, t.has(c(r[n], n, r)))
                    }
                } else E.value = k.find((t => e === c(r[t], t, r)));
                j()
            }
        })
    }
}

function q(e) {
    return null !== e && "object" == typeof e ? e.valueOf() : e
}

function M(t, n) {
    return j({
        multiple: t,
        render(i, r, o, a, {
            format: l,
            label: u
        }) {
            const s = e`<form class="inputs-3a86ea inputs-3a86ea-checkbox">
      ${d(u)}<div>
        ${r.map((t=>e`<label><input type=${n} disabled=${"function"==typeof a?a(t):a} name=input value=${t} checked=${o(t)}>${l(i[t],t,i)}`))}
      </div>
    </form>`;
            return [s, D(s.elements.input, t)]
        },
        selectedIndexes: e => Array.from(e).filter((e => e.checked)).map((e => +e.value)),
        select(e, t) {
            e.checked = t
        }
    })
}
const T = M(!1, "radio"),
    L = M(!0, "checkbox");

function P({
    label: t,
    value: n,
    values: i,
    disabled: r
} = {}) {
    const o = e`<input class=inputs-3a86ea-input type=checkbox name=input disabled=${r}>`,
        a = e`<form class="inputs-3a86ea inputs-3a86ea-toggle">${d(t,o)}${o}`;
    return Object.defineProperty(a, "value", {
        get: () => void 0 === i ? o.checked : i[o.checked ? 0 : 1],
        set(e) {
            o.checked = void 0 === i ? !!e : e === i[0]
        }
    }), void 0 !== n && (a.value = n), a
}

function D(e, t) {
    return void 0 === e ? new _(t ? [] : null) : void 0 === e.length ? new(t ? F : C)(e) : e
}
class _ {
    constructor(e) {
        this._value = e
    }
    get value() {
        return this._value
    }
    set value(e) {}*[Symbol.iterator]() {}
}
class C {
    constructor(e) {
        this._input = e
    }
    get value() {
        const {
            _input: e
        } = this;
        return e.checked ? e.value : ""
    }
    set value(e) {
        const {
            _input: t
        } = this;
        t.checked || (t.checked = $(e) === t.value)
    }*[Symbol.iterator]() {
        yield this._input
    }
}
class F {
    constructor(e) {
        this._input = e, this._value = e.checked ? [e.value] : []
    }
    get value() {
        return this._value
    }
    set value(e) {
        const {
            _input: t
        } = this;
        t.checked || (t.checked = $(e) === t.value, this._value = t.checked ? [t.value] : [])
    }*[Symbol.iterator]() {
        yield this._input
    }
}

function I(t) {
    if (void 0 === t) return [null, null];
    const n = f();
    return [e`<datalist id=${n}>${Array.from(t,(t=>e`<option value=${$(t)}>`))}`, n]
}

function K(t, n, i, {
    validate: r = u,
    submit: o
} = {}, {
    get: s = e => e.value,
    set: c = (e, t) => e.value = $(t),
    same: f = (e, t) => e.value === t,
    after: d = e => n.after(e)
} = {}) {
    const p = (o = !0 === o ? "Submit" : o || null) ? e`<button type=submit disabled>${o}` : null;

    function m() {
        if (r(n)) return i = s(n), !0
    }
    return o && d(p), c(n, i), i = r(n) ? s(n) : void 0, t.addEventListener("submit", (function(e) {
        a(e), o && (m() ? (p.disabled = !0, l(e)) : n.reportValidity())
    })), n.oninput = function(e) {
        o ? (p.disabled = f(n, i), e.stopPropagation()) : m() || e.stopPropagation()
    }, Object.defineProperty(t, "value", {
        get: () => i,
        set(e) {
            c(n, e), m()
        }
    })
}

function H({
    label: t,
    value: n = "",
    type: i = "text",
    placeholder: o,
    pattern: a,
    spellcheck: l,
    autocomplete: u,
    autocapitalize: s,
    min: c,
    max: f,
    minlength: p,
    maxlength: m,
    required: v = p > 0,
    datalist: h,
    readonly: $,
    disabled: y,
    width: b,
    ...g
} = {}) {
    const [w, x] = I(h), k = e`<input
    type=${i}
    name=text
    list=${x}
    readonly=${$}
    disabled=${y}
    required=${v}
    min=${c}
    max=${f}
    minlength=${p}
    maxlength=${m}
    pattern=${a}
    spellcheck=${B(l)}
    autocomplete=${G(u)}
    autocapitalize=${G(s)}
    placeholder=${o}
  >`;
    return K(e`<form class=inputs-3a86ea style=${r(b)}>
    ${d(t,k)}<div class=inputs-3a86ea-input>
      ${k}
    </div>${w}
  </form>`, k, n, g)
}

function R(e) {
    return H({
        ...e,
        type: "email"
    })
}

function V(e) {
    return H({
        ...e,
        type: "tel"
    })
}

function W(e) {
    return H({
        ...e,
        type: "url"
    })
}

function U(e) {
    return H({
        ...e,
        type: "password"
    })
}

function B(e) {
    return null == e ? null : `${e}`
}

function G(e) {
    return null == e ? null : `${!1===e?"off":!0===e?"on":e}`
}

function J({
    label: t,
    value: n,
    required: i,
    datalist: o,
    readonly: a,
    disabled: l,
    width: u,
    ...s
} = {}) {
    const [c, p] = I(o), m = f(), v = e`<input
    type=color
    name=text
    value=${n}
    id=${m}
    list=${p}
    readonly=${a}
    disabled=${l}
    required=${i}
  >`, h = e`<output
    for=${m}
  >`;
    h.value = v.value, v.addEventListener("input", (() => h.value = v.value));
    return K(e`<form class=inputs-3a86ea style=${r(u)}>
    ${d(t,v)}<div class=inputs-3a86ea-input>
      <div class=inputs-3a86ea-input>${v}${h}</div>
    </div>${c}
  </form>`, v, n, s, {
        after: e => v.parentNode.after(e)
    })
}
const Q = {
        type: "date",
        get: e => e.valueAsDate,
        set: (e, t) => e.value = ne(t),
        same: (e, t) => +e.valueAsDate == +t,
        format: ne
    },
    X = {
        type: "datetime-local",
        get: e => e.value ? new Date(e.value) : null,
        set: (e, t) => e.value = ie(t),
        same: (e, t) => +new Date(e.value) == +t,
        format: ie
    };

function Y({
    label: t,
    min: n,
    max: i,
    required: o,
    readonly: a,
    disabled: l,
    width: u,
    value: s,
    ...c
} = {}, {
    type: f,
    format: p,
    ...m
}) {
    const v = e`<input type=${f} name=date readonly=${a} disabled=${l} required=${o} min=${p(n)} max=${p(i)}>`;
    return K(e`<form class=inputs-3a86ea style=${r(u)}>
    ${d(t,v)}<div class=inputs-3a86ea-input>
      ${v}
    </div>
  </form>`, v, te(s), c, m)
}

function Z(e) {
    return Y(e, Q)
}

function ee(e) {
    return Y(e, X)
}

function te(e) {
    return e instanceof Date && !isNaN(e) ? e : "string" == typeof e ? n(e, null) : null == e || isNaN(e = +e) ? null : new Date(+e)
}

function ne(e) {
    return (e = te(e)) ? e.toISOString().slice(0, 10) : e
}

function ie(e) {
    return (e = te(e)) ? new Date(+e - 1e3 * e.getTimezoneOffset() * 60).toISOString().slice(0, 16) : e
}

function re(e, t) {
    return (Array.isArray(e) ? ae : ue)(e, t)
}

function oe(t) {
    return e`<div>${t}`
}

function ae(e, {
    template: t = oe
} = {}) {
    let n = (e = [...e]).map((({
        value: e
    }) => e));
    return Object.defineProperty(t(e), "value", {
        get() {
            for (let t = 0, i = e.length; t < i; ++t) {
                const i = e[t].value;
                Object.is(i, n[t]) || (n = [...n], n[t] = i)
            }
            return n
        },
        set(t = []) {
            for (let n = 0, i = e.length; n < i; ++n) e[n].value = t[n]
        }
    })
}

function le(t) {
    return e`<div>${Object.values(t)}`
}

function ue(e, {
    template: t = le
} = {}) {
    e = {
        ...e
    };
    let n = Object.fromEntries(Object.entries(e).map((([e, {
        value: t
    }]) => [e, t])));
    return Object.defineProperty(t(e), "value", {
        get() {
            for (const t in n) {
                const i = e[t].value;
                Object.is(i, n[t]) || (n = {
                    ...n
                }, n[t] = i)
            }
            return n
        },
        set(t = {}) {
            for (const n in e) e[n].value = t[n]
        }
    })
}

function se({
    label: t,
    required: n,
    accept: i,
    capture: o,
    multiple: a,
    disabled: l,
    width: u,
    value: s,
    submit: c,
    transform: f = e => e,
    ...p
} = {}) {
    const m = e`<input
    type=file
    name=file
    disabled=${l}
    required=${n}
    accept=${i}
    capture=${o}
    multiple=${a}
  >`;
    return K(e`<form class=inputs-3a86ea style=${r(u)}>
    ${d(t,m)}<div class=inputs-3a86ea-input>
      ${m}
    </div>
  </form>`, m, void 0, p, {
        get: e => a ? Array.from(e.files, (e => f(e))) : e.files.length ? f(e.files[0]) : null,
        set: () => {},
        same: () => !1
    })
}
const ce = 1e-6;

function fe(e, t) {
    return arguments.length < 2 && (t = e, e = void 0), void 0 === e && (e = []), pe({
        extent: e
    }, t)
}

function de(e = [0, 1], t) {
    return pe({
        extent: e,
        range: !0
    }, t)
}

function pe({
    extent: [t, n],
    range: i
}, {
    format: o = x,
    transform: l,
    invert: c,
    label: f = "",
    value: p,
    step: m,
    disabled: v,
    placeholder: h,
    validate: $ = u,
    width: y
} = {}) {
    let b;
    if ("function" != typeof o) throw new TypeError("format is not a function");
    (null == t || isNaN(t = +t)) && (t = -1 / 0), (null == n || isNaN(n = +n)) && (n = 1 / 0), t > n && ([t, n] = [n, t], void 0 === l && (l = me)), void 0 !== m && (m = +m);
    const g = e`<input type=number min=${isFinite(t)?t:null} max=${isFinite(n)?n:null} step=${null==m?"any":m} name=number required placeholder=${h} oninput=${function(e){const t=A(g.valueAsNumber);if(isFinite(t)&&(i&&(i.valueAsNumber=l(t)),$(g)))return void(b=t);e&&e.stopPropagation()}} disabled=${v}>`;
    let w;
    if (i) {
        if (void 0 === l && (l = s), "function" != typeof l) throw new TypeError("transform is not a function");
        if (void 0 === c && (c = void 0 === l.invert ? (k = l) === s || k === me ? k : k === Math.sqrt ? ve : k === Math.log ? Math.exp : k === Math.exp ? Math.log : e => function(e, t, n) {
                let i, r, o, a = 100;
                n = void 0 === n ? 0 : +n, t = +t;
                do {
                    r = e(n), o = e(n + ce), r === o && (o = r + ce), n -= i = -1e-6 * (r - t) / (r - o)
                } while (a-- > 0 && Math.abs(i) > ce);
                return a < 0 ? NaN : n
            }(k, e, e) : l.invert), "function" != typeof c) throw new TypeError("invert is not a function");
        let r = +l(t),
            a = +l(n);
        r > a && ([r, a] = [a, r]), i = e`<input type=range min=${isFinite(r)?r:null} max=${isFinite(a)?a:null} step=${void 0===m||l!==s&&l!==me?"any":m} name=range oninput=${function(e){const r=A(c(i.valueAsNumber));if(isFinite(r)&&(g.valueAsNumber=Math.max(t,Math.min(n,r)),$(g)))return b=g.valueAsNumber,void(g.value=o(b));e&&e.stopPropagation()}} disabled=${v}>`, w = l === s ? i : e`<input type=range min=${t} max=${n} step=${void 0===m?"any":m} name=range disabled=${v}>`
    } else i = null, l = c = s;
    var k;
    const N = e`<form class=inputs-3a86ea style=${r(y)}>
    ${d(f,g)}<div class=inputs-3a86ea-input>
      ${g}${i}
    </div>
  </form>`;

    function A(e) {
        return w ? (e = Math.max(t, Math.min(n, e)), isFinite(e) ? (w.valueAsNumber = e, w.valueAsNumber) : e) : +e
    }
    return N.addEventListener("submit", a), Object.defineProperty(N, "value", {
        get: () => b,
        set(e) {
            e = A(e), isFinite(e) && (g.valueAsNumber = e, i && (i.valueAsNumber = l(e)), $(g) && (b = e, g.value = o(b)))
        }
    }), void 0 === p && w && (p = w.valueAsNumber), void 0 !== p && (N.value = p), N
}

function me(e) {
    return -e
}

function ve(e) {
    return e * e
}

function he(t, {
    locale: n,
    format: i = we(n),
    label: o,
    query: l = "",
    placeholder: u = "Search",
    columns: s = h(t),
    spellcheck: c,
    autocomplete: f,
    autocapitalize: p,
    filter: v = (void 0 === s ? $e : ye(s)),
    datalist: y,
    disabled: b,
    required: g = !0,
    width: w
} = {}) {
    let x = [];
    t = m(t), g = !!g;
    const [k, N] = I(y), A = e`<input
    name=input
    type=search
    list=${N}
    disabled=${b}
    spellcheck=${B(c)}
    autocomplete=${G(f)}
    autocapitalize=${G(p)}
    placeholder=${u}
    value=${l}
    oninput=${O}
  >`, S = e`<output name=output>`, E = e`<form class=inputs-3a86ea style=${r(w)}>
    ${d(o,A)}<div class=inputs-3a86ea-input>
      ${A}${S}
    </div>${k}
  </form>`;

    function O() {
        x = A.value || g ? t.filter(v(A.value)) : [], void 0 !== s && (x.columns = s), S.value = i(x.length)
    }
    return E.addEventListener("submit", a), O(), Object.defineProperties(E, {
        value: {
            get: () => x
        },
        query: {
            get: () => l,
            set(e) {
                l = A.value = $(e), O()
            }
        }
    })
}

function $e(e) {
    const t = `${e}`.split(/\s+/g).filter((e => e)).map(ge);
    return e => {
        if (null == e) return !1;
        if ("object" == typeof e) e: for (const n of t) {
            for (const t of be(e))
                if (n.test(t)) continue e;
            return !1
        } else
            for (const n of t)
                if (!n.test(e)) return !1;
        return !0
    }
}

function ye(e) {
    return t => {
        const n = `${t}`.split(/\s+/g).filter((e => e)).map(ge);
        return t => {
            e: for (const i of n) {
                for (const n of e)
                    if (i.test(t[n])) continue e;
                return !1
            }
            return !0
        }
    }
}

function* be(e) {
    for (const t in e) yield e[t]
}

function ge(e) {
    return new RegExp(`(?:^|[^\\p{L}-])${function(e){return e.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&")}(e)}`, "iu")
}
const we = N((e => {
        const t = b(e);
        return e => `${t(e)} result${1===e?"":"s"}`
    })),
    xe = j({
        render(t, n, i, o, {
            format: a,
            multiple: l,
            size: u,
            label: s,
            width: c
        }) {
            const f = e`<select class=inputs-3a86ea-input disabled=${!0===o} multiple=${l} size=${u} name=input>
      ${n.map((n=>e`<option value=${n} disabled=${"function"==typeof o&&o(n)} selected=${i(n)}>${$(a(t[n],n,t))}`))}
    </select>`;
            return [e`<form class=inputs-3a86ea style=${r(c)}>${d(s,f)}${f}`, f]
        },
        selectedIndexes: e => Array.from(e.selectedOptions, (e => +e.value)),
        select(e, t) {
            e.selected = t
        }
    }),
    ke = 22;

function Ne(t, n = {}) {
    const {
        rows: r = 11.5,
        height: o,
        maxHeight: a = (void 0 === o ? (r + 1) * ke - 1 : void 0),
        width: l = {},
        maxWidth: u
    } = n, s = f(), c = e`<form class="inputs-3a86ea inputs-3a86ea-table" id=${s} style=${{height:i(o),maxHeight:i(a),width:"string"==typeof l||"number"==typeof l?i(l):void 0,maxWidth:i(u)}}>`;
    return t && "function" == typeof t.then ? (Object.defineProperty(c, "value", {
        configurable: !0,
        set() {
            throw new Error("cannot set value while data is unresolved")
        }
    }), Promise.resolve(t).then((e => Ae({
        root: c,
        id: s
    }, e, n)))) : Ae({
        root: c,
        id: s
    }, t, n), c
}

function Ae({
    root: t,
    id: n
}, r, {
    columns: o = h(r),
    value: a,
    required: l = !0,
    sort: u,
    reverse: c = !1,
    format: f,
    locale: d,
    align: p,
    header: v,
    rows: $ = 11.5,
    width: g = {},
    multiple: w = !0,
    select: x = !0,
    layout: N
} = {}) {
    o = void 0 === o ? function(e) {
        const t = new Set;
        for (const n of e)
            for (const e in n) t.add(e);
        return Array.from(t)
    }(r) : m(o), void 0 === N && (N = o.length >= 12 ? "auto" : "fixed"), f = function(e = {}, t, n, i) {
        const r = Object.create(null);
        for (const o of n)
            if (o in e) r[o] = e[o];
            else switch (Oe(t, o)) {
                case "number":
                    r[o] = b(i);
                    break;
                case "date":
                    r[o] = k;
                    break;
                default:
                    r[o] = y(i)
            }
        return r
    }(f, r, o, d), p = function(e = {}, t, n) {
        const i = Object.create(null);
        for (const r of n) r in e ? i[r] = e[r] : "number" === Oe(t, r) && (i[r] = "right");
        return i
    }(p, r, o);
    let O = [],
        z = [],
        j = r[Symbol.iterator](),
        q = 0,
        M = function(e) {
            if ("number" == typeof e.length) return e.length;
            if ("number" == typeof e.size) return e.size;
            if ("function" == typeof e.numRows) return e.numRows()
        }(r),
        T = P(2 * $);

    function L() {
        q >= 0 && (q = j = void 0, z = Uint32Array.from(O = m(r), ((e, t) => t)), M = z.length)
    }

    function P(e) {
        if (e = Math.floor(e), void 0 !== M) return Math.min(M, e);
        if (e <= q) return e;
        for (; e > q;) {
            const {
                done: e,
                value: t
            } = j.next();
            if (e) return M = q;
            z.push(q++), O.push(t)
        }
        return q
    }
    let D = null,
        _ = !1,
        C = new Set,
        F = null,
        I = null;
    const K = e`<tbody>`,
        H = e`<tr><td>${x?e`<input type=${w?"checkbox":"radio"} name=${w?null:"radio"}>`:null}</td>${o.map((()=>e`<td>`))}`,
        R = e`<tr><th>${x?e`<input type=checkbox onclick=${function(e){if(L(),this.checked){C=new Set(z);for(const e of K.childNodes)Se(e).checked=!0}else{for(let e of C)U(e);F=I=null,e.detail&&e.currentTarget.blur()}X()}} disabled=${!w}>`:null}</th>${o.map((t=>e`<th title=${t} onclick=${e=>Q(e,t)}><span></span>${v&&t in v?v[t]:t}</th>`))}</tr>`;

    function V(e, t) {
        if (q === e) {
            for (; e < t; ++e) W(j.next().value, e);
            q = t
        } else
            for (let n; e < t; ++e) n = z[e], W(O[n], n)
    }

    function W(e, t) {
        const n = H.cloneNode(!0),
            i = Se(n);
        if (null != i && (i.onclick = J, i.checked = C.has(t), i.value = t), null != e)
            for (let i = 0; i < o.length; ++i) {
                let a = o[i],
                    l = e[a];
                E(l) && (l = f[a](l, t, r), l instanceof Node || (l = document.createTextNode(l)), n.childNodes[i + 1].appendChild(l))
            }
        K.append(n)
    }

    function U(e) {
        L();
        let t = z.indexOf(e);
        if (t < K.childNodes.length) {
            Se(K.childNodes[t]).checked = !1
        }
        C.delete(e)
    }

    function B(e) {
        L();
        let t = z.indexOf(e);
        if (t < K.childNodes.length) {
            Se(K.childNodes[t]).checked = !0
        }
        C.add(e)
    }

    function* G(e, t) {
        if (L(), (e = z.indexOf(e)) < (t = z.indexOf(t)))
            for (; e <= t;) yield z[e++];
        else
            for (; t <= e;) yield z[t++]
    }

    function J(e) {
        L();
        let t = +this.value;
        if (w)
            if (e.shiftKey) {
                if (null === F) F = C.size ? function(e) {
                    return e[Symbol.iterator]().next().value
                }(C) : z[0];
                else
                    for (let e of G(F, I)) U(e);
                I = t;
                for (let e of G(F, I)) B(e)
            } else F = I = t, C.has(t) ? (U(t), F = I = null, e.detail && e.currentTarget.blur()) : B(t);
        else {
            for (let e of C) U(e);
            B(t)
        }
        X()
    }

    function Q(e, n) {
        L();
        const i = e.currentTarget;
        let r;
        if (D === i && e.metaKey) Ee(D).textContent = "", D = null, _ = !1, r = A;
        else {
            D === i ? _ = !_ : (D && (Ee(D).textContent = ""), D = i, _ = e.altKey);
            const t = _ ? S : A;
            r = (e, i) => t(O[e][n], O[i][n]), Ee(i).textContent = _ ? "▾" : "▴"
        }
        for (z.sort(r), C = new Set(Array.from(C).sort(r)), t.scrollTo(t.scrollLeft, 0); K.firstChild;) K.firstChild.remove();
        V(0, T = P(2 * $)), F = I = null, X()
    }

    function X() {
        const e = Se(R);
        null != e && (e.disabled = !w && !C.size, e.indeterminate = w && C.size && C.size !== M, e.checked = C.size, a = void 0)
    }
    if (t.appendChild(e.fragment`<table style=${{tableLayout:N}}>
  <thead>${P(1)||o.length?R:null}</thead>
  ${K}
</table>
<style>${o.map(((e,t)=>{const r=[];if(null!=p[e]&&r.push(`text-align:${p[e]}`),null!=g[e]&&r.push(`width:${i(g[e])}`),r.length)return`#${n} tr>:nth-child(${t+2}){${r.join(";")}}`})).filter(s).join("\n")}</style>`), t.addEventListener("scroll", (() => {
            t.scrollHeight - t.scrollTop < $ * ke * 1.5 && T < P(T + 1) && V(T, T = P(T + $))
        })), void 0 === u && c && (L(), z.reverse()), void 0 !== a) {
        if (L(), w) {
            const e = new Set(a);
            C = new Set(z.filter((t => e.has(O[t]))))
        } else {
            const e = O.indexOf(a);
            C = e < 0 ? new Set : new Set([e])
        }
        X()
    }
    if (P(1) ? V(0, T) : K.append(e`<tr>${o.length?e`<td>`:null}<td rowspan=${o.length} style="padding-left: var(--length3); font-style: italic;">No results.</td></tr>`), void 0 !== u) {
        let e = o.indexOf(u);
        e >= 0 && (c && (D = R.childNodes[e + 1]), Q({
            currentTarget: R.childNodes[e + 1]
        }, o[e]))
    }
    return Object.defineProperty(t, "value", {
        get() {
            if (void 0 === a)
                if (L(), w)(a = Array.from(l && 0 === C.size ? z : C, (e => O[e]))).columns = o;
                else if (C.size) {
                const [e] = C;
                a = O[e]
            } else a = null;
            return a
        },
        set(e) {
            if (L(), w) {
                const t = new Set(e),
                    n = new Set(z.filter((e => t.has(O[e]))));
                for (const e of C) n.has(e) || U(e);
                for (const e of n) C.has(e) || B(e)
            } else {
                const t = O.indexOf(e);
                C = t < 0 ? new Set : new Set([t])
            }
            a = void 0
        }
    })
}

function Se(e) {
    return e.firstChild.firstChild
}

function Ee(e) {
    return e.firstChild
}

function Oe(e, t) {
    if ("function" == typeof(n = e).getChild && "function" == typeof n.toArray && n.schema && Array.isArray(n.schema.fields)) return function(e, t) {
        const n = e.schema.fields.find((e => e.name === t));
        switch (n?.type.typeId) {
            case 8:
            case 10:
                return 1 === n.type.unit ? "date" : "number";
            case 2:
            case 3:
            case 7:
            case 9:
                return "number"
        }
    }(e, t);
    var n;
    for (const n of e) {
        if (null == n) continue;
        const e = n[t];
        if (null != e) return "number" == typeof e ? "number" : e instanceof Date ? "date" : void 0
    }
}

function ze({
    value: t = "",
    label: n,
    placeholder: i,
    spellcheck: a,
    autocomplete: l,
    autocapitalize: u,
    rows: s = 3,
    minlength: c,
    maxlength: f,
    required: p = c > 0,
    readonly: m,
    disabled: v,
    monospace: h = !1,
    resize: $ = s < 12,
    width: y,
    ...b
} = {}) {
    const g = e`<textarea
    name=text
    readonly=${m}
    disabled=${v}
    required=${p}
    rows=${s}
    minlength=${c}
    maxlength=${f}
    spellcheck=${B(a)}
    autocomplete=${G(l)}
    autocapitalize=${G(u)}
    placeholder=${i}
    onkeydown=${function(e){if(b.submit&&"Enter"===e.key&&(e.metaKey||e.ctrlKey))return w.dispatchEvent(new Event("submit",o))}}
    style=${{width:y,fontFamily:h?"var(--monospace, monospace)":null,resize:$?null:"none"}}
  >`,
        w = e`<form class="inputs-3a86ea inputs-3a86ea-textarea" style=${r(y)}>
    ${d(n,g)}<div>
      ${g}
    </div>
  </form>`;
    return K(w, g, t, b)
}

function je(e) {
    const t = new EventTarget;
    return t.value = e, t
}

function qe(e) {
    return new Promise((t => {
        requestAnimationFrame((() => {
            const n = e.closest(".observablehq");
            if (!n) return t();
            const i = new MutationObserver((() => {
                n.contains(e) || (i.disconnect(), t())
            }));
            i.observe(n, {
                childList: !0
            })
        }))
    }))
}

function Me(e, t, n = qe(e)) {
    const i = Le(t),
        r = () => Te(e, t);
    return r(), e.addEventListener(Le(e), (() => (Te(t, e), t.dispatchEvent(new Event(i, o))))), t.addEventListener(i, r), n.then((() => t.removeEventListener(i, r))), e
}

function Te(e, t) {
    const n = function(e) {
        switch (e.type) {
            case "range":
            case "number":
                return e.valueAsNumber;
            case "date":
                return e.valueAsDate;
            case "checkbox":
                return e.checked;
            case "file":
                return e.multiple ? e.files : e.files[0];
            default:
                return e.value
        }
    }(t);
    switch (e.type) {
        case "range":
        case "number":
            e.valueAsNumber = n;
            break;
        case "date":
            e.valueAsDate = n;
            break;
        case "checkbox":
            e.checked = n;
            break;
        case "file":
            e.multiple ? e.files = n : e.files = [n];
            break;
        default:
            e.value = n
    }
}

function Le(e) {
    switch (e.type) {
        case "button":
        case "submit":
            return "click";
        case "file":
            return "change";
        default:
            return "input"
    }
}
export {
    Me as bind, p as button, L as checkbox, J as color, Z as date, ee as datetime, qe as disposal, R as email, se as file, re as form, g as formatAuto, k as formatDate, y as formatLocaleAuto, b as formatLocaleNumber, w as formatNumber, x as formatTrim, je as input, fe as number, U as password, T as radio, de as range, he as search, $e as searchFilter, xe as select, Ne as table, V as tel, H as text, ze as textarea, P as toggle, W as url
};
export default null;
//# sourceMappingURL=/sm/bd7616c10998adcfd7765619c1bd4ff9a8fbffd7b711bf64eb3883255454543b.map