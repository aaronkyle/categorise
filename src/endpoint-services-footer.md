# Endpoint Services Footer

Generic services to apply to all Endpoint Service notebooks, e.g. error monitoring, analytics. Footer with backups is https://observablehq.com/@endpointservices/footer-with-backups

```js
import { footer } from "@endpointservices/endpoint-services-footer"
---
footer
```

```js
graphic = md`<small>
[WEBCode.run](https://webcode.run) is a developer focussed serverless environment for [Observable](observablehq.com) notebooks. Signup for the [webcode newsletter on Substack](https://webcode.substack.com/).

*Endpoint Services collects anonymous usage metrics through [Plausible Analytics](https://observablehq.com/@endpointservices/plausible-analytics). Notebooks are monitored for errors using [sentry.io](https://sentry.io).* </small>
`
```

```js
footer = {
  plausible_analytics;
  const Sentry = sentry({
    DSN:
      "https://f9a89df07acc4958843e8bd2dca8794b@o518834.ingest.sentry.io/5628336",
    namespaces: ["endpointservices", "tomlarkworthy"]
  });
  graphic.sentry = Sentry;
  return graphic;
}
```

### Usage: Plausible Analytics

Note, data domain auto set so it will only be able to track properties I own. And the use of plausible analytics is for usage stats, no personal information.

```js
localStorage
```

```js echo
plausible_analytics = {
  const DATA_DOMAIN = window.origin.replace("https://", "");
  const DATA_API = "https://plausible.io";
  var a = html`<a href="${document.baseURI.replace(
      "observablehq.com",
      DATA_DOMAIN
    )}">`, // Fix for Observable
    r = window.document,
    t = localStorage, // Fix for Observable
    o = r.currentScript,
    s = "https://plausible.io/api/event",
    l = t && t.plausible_ignore;
  function p(t) {
    console.warn("Ignoring Event: " + t);
  }
  function e(t, e) {
    if (
      /^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(a.hostname) ||
      "file:" === a.protocol
    )
      return p("localhost");
    if (
      !(
        window._phantom ||
        window.__nightmare ||
        window.navigator.webdriver ||
        window.Cypress
      )
    ) {
      if ("true" == l) return p("localStorage flag");
      var i = {};
      (i.n = t),
        (i.u = a.href),
        (i.d = DATA_DOMAIN),
        (i.r = r.referrer || null),
        (i.w = window.innerWidth),
        e && e.meta && (i.m = JSON.stringify(e.meta)),
        e && e.props && (i.p = JSON.stringify(e.props));
      var n = new XMLHttpRequest();
      n.open("POST", s, !0),
        n.setRequestHeader("Content-Type", "text/plain"),
        n.send(JSON.stringify(i)),
        (n.onreadystatechange = function () {
          4 == n.readyState && e && e.callback && e.callback();
        });
    }
  }
  var i = (window.plausible && window.plausible.q) || [];
  window.plausible = e;
  for (var n, w = 0; w < i.length; w++) e.apply(this, i[w]);
  function d() {
    n !== a.pathname && ((n = a.pathname), e("pageview"));
  }
  var u,
    c = window.history;
  c.pushState &&
    ((u = c.pushState),
    (c.pushState = function () {
      u.apply(this, arguments), d();
    }),
    window.addEventListener("popstate", d)),
    "prerender" === r.visibilityState
      ? r.addEventListener("visibilitychange", function () {
          n || "visible" !== r.visibilityState || d();
        })
      : d();
}
```

```js
import { localStorage } from "@mbostock/safe-local-storage"
```

### Error Monitoring: Sentry

Sentry alerts me to errors in notebooks

```js
import { sentry } from "@endpointservices/sentry"
```
