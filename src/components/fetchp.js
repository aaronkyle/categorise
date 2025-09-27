//# CORS Proxy _fetchp_
// Code in this notebook are derived from https://observablehq.com/@tomlarkworthy/fetchp

import hash from 'npm:object-hash';

import { deploy, getContext } from "/components/serverless-cells.js";;


const array = value => (value ? [value] : []);


export const SECRET_PARAMS = ({})
export const ALLOW_DOMAINS = null
export const BASIC_AUTH = null
export const MODIFIERS = ['terminal']

export const id = hash([ALLOW_DOMAINS, SECRET_PARAMS, BASIC_AUTH, MODIFIERS]).substring(30)

export const proxy = deploy(
  `proxy_${id}`, // Each proxy gets unique ID so they are not confused in notebooks with many
  async (req, res, ctx) => {
    try {
      // Read the envelope
      const { url, options } = JSON.parse(req.body, function (key, value) {
        // the reviver function looks for the typed array flag
        try {
          if ("flag" in value && value.flag === "FLAG_TYPED_ARRAY") {
            // if found, we convert it back to a typed array
            return new window[value.constructor](value.data);
          }
        } catch (e) {}
        // if flag not found no conversion is done
        return value;
      });

      const secretParams = Object.keys(SECRET_PARAMS)
        .map((param) => {
          const secret = SECRET_PARAMS[param];
          const value = ctx.secrets[secret];
          return encodeURIComponent(param) + "=" + encodeURIComponent(value);
        })
        .join("&");

      const decodedURL = new URL(url);
      if ((secretParams || BASIC_AUTH) && !ALLOW_DOMAINS)
        return res
          .status(400)
          .send("Must set ALLOW_DOMAINS when using secrets");
      if (ALLOW_DOMAINS !== null && !ALLOW_DOMAINS.includes(decodedURL.host))
        return res
          .status(403)
          .send(`${decodedURL.host} is not in ALLOW_DOMAINS set`);

      options.headers = options.headers || {};
      if (
        options.headers["content-type"] === "application/x-www-form-urlencoded"
      ) {
        options.body = (options.body || "") + "&" + secretParams;
      } else {
        decodedURL.search =
          decodedURL.search.length > 0
            ? decodedURL.search + "&" + secretParams
            : secretParams;
      }

      if (BASIC_AUTH && BASIC_AUTH.protocol === "RFC 7617") {
        options.headers = options.headers || {};
        const secret = ctx.secrets[BASIC_AUTH.passwordSecret];
        const username = BASIC_AUTH.username;
        options.headers["Authorization"] = `Basic ${btoa(
          `${username}:${secret}`
        )}`;
      }

      const response = await fetch(decodedURL, options);
      const responseHeaders = Object.fromEntries(
        Array.from(response.headers.entries()).map(([k, v]) => [
          k.toLowerCase(),
          v
        ])
      );
      delete responseHeaders["content-encoding"]; // Ensure we are not claiming to be gzipped
      delete responseHeaders["content-length"]; // We switch to chunked
      delete responseHeaders["access-control-allow-origin"]; // Remove any CORS
      delete responseHeaders["x-frame-options"];
      const headers = {
        ...responseHeaders,
        ...(options.responseHeaders || {}),
        "transfer-encoding": "chunked"
      };
      Object.keys(headers).map((key) => {
        if (headers[key]) res.header(key, headers[key]);
      });

      res.status(response.status);

      const body = await response.body;
      const reader = body.getReader();

      let { done, value } = await reader.read();
      while (!done) {
        //await
        res.write(value); // I think we shoudl await here but it breaks things if we do
        ({ done, value } = await reader.read());
      }
      res.end();
    } catch (err) {
      console.error(err);
      res.end(); // Can't do much on a chunked response
    }
  },
  {
    host: "webcode.run",
    modifiers: MODIFIERS,
    reusable: true,
    secrets: [
      ...Object.values(SECRET_PARAMS),
      ...array(BASIC_AUTH?.passwordSecret)
    ]
  }
)

export const fetchp = async (url, options) => {
  options = options || {};
  let retries = options.retries || 10;
  let response = null;
  let delay_ms = 100;

  if (url.startsWith("http://"))
    throw new Error("fetchp only supports secure https:// addresses");
  if (ALLOW_DOMAINS !== null && !ALLOW_DOMAINS.includes(new URL(url).host))
    return new Response(`${url} is not in ALLOW_DOMAINS set`, {
      status: 403
    });

  if (
    getContext().serverless &&
    Object.keys(SECRET_PARAMS).length === 0 &&
    BASIC_AUTH == null
  ) {
    // Skip sending to proxy but still do retries
    while (retries-- >= 0) {
      response = await fetch(url, options);
      if (response.status !== 429) break;
      // Exponential backoff
      await new Promise((res) => setTimeout(res, delay_ms));
      delay_ms *= 1.5;
    }
    return response;
  }

  // Fetch can have UInt8array as body, which is lost by default JSON stringify
  // https://gist.github.com/jonathanlurie/04fa6343e64f750d03072ac92584b5df
  const body = JSON.stringify({ url, options }, function (key, value) {
    // the replacer function is looking for some typed arrays.
    // If found, it replaces it by a trio
    if (
      value instanceof Int8Array ||
      value instanceof Uint8Array ||
      value instanceof Uint8ClampedArray ||
      value instanceof Int16Array ||
      value instanceof Uint16Array ||
      value instanceof Int32Array ||
      value instanceof Uint32Array ||
      value instanceof Float32Array ||
      value instanceof Float64Array
    ) {
      var replacement = {
        constructor: value.constructor.name,
        data: Array.from(value),
        flag: "FLAG_TYPED_ARRAY"
      };
      return replacement;
    }
    return value;
  });

  const proxy_url = proxy.href;

  if (options.region) {
    proxy_url.pathname = `regions/${options.region}${proxy_url.pathname}`;
  }

  while (retries-- >= 0) {
    response = await fetch(proxy_url, {
      method: "POST",
      body: body
    });

    if (response.status !== 429 && response.status !== 503) break;

    // Exponential backoff
    await new Promise((res) => setTimeout(res, delay_ms));
    delay_ms *= 1.5;
  }
  return response;
}

export const tryme = () => { // Press it really quickly and see the 429 errors hidden from caller
  const button = html`<button>try me</button>`
  button.onclick = async () => {
    const response = await fetchp("https://google.com");
    console.log("Response " + response.status);
  }
  return button;
};
