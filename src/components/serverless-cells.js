// # Serverless Cells

//import { onVersion } from "@endpointservices/onversion"
import { onVersion } from "/components/onversion.js"

export { onVersion };

const onVersionPublished = onVersion((metadata) => {
  // Run the cache invalidation routines when a new version is published
  // See https://observablehq.com/@endpointservices/webcode-onpublish
  fetch(
    `https://webcode.run/observablehq.com/@endpointservices/webcode-onpublish;onpublish?id=${metadata.id}`
  );
})


const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

const salt = window.crypto
  // ~6 bits per selection, we need 120
  .getRandomValues(new Uint32Array(Math.ceil(120.0 / 5.9)))


const getContext = () => {
  if (window["@endpointservices.context"])
    return window["@endpointservices.context"];
  return {
    serverless: false,
    namespace: subdomain(),
    notebook: notebook(),
    secrets: {}
  };
}

export const Response = class {
  constructor(req, done) {
    this.req = req;
    this.done = done;
    this._headers = {};
  }
  _pack(arg) {
    if (arg === undefined) return undefined;
    if (
      arg instanceof Object.getPrototypeOf(Uint8Array) ||
      (arg.constructor && arg.constructor.name === "ArrayBuffer")
    ) {
      function arrayBufferToBase64(buffer) {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      }
      return {
        ARuRQygChDsaTvPRztEb: "bufferBase64",
        value: arrayBufferToBase64(arg.buffer || arg)
      };
    } else {
      return arg;
    }
  }
  send(arg) {
    if (arg === undefined) throw new Error("arg required");
    this._send = this._pack(arg);
    this.finish();
  }
  async write(chunk) {
    if (window["@endpointservices.callback"]) {
      return window["@endpointservices.callback"](this.req.id, "write", [
        this._pack(chunk)
      ]);
    } else {
      return window["@endpointservices.write"](this._pack(chunk));
    }
  }
  json(arg) {
    if (arg === undefined || arg === null) throw new Error("arg required");
    this._json = arg;
    this.finish();
  }
  end() {
    this._end = true;
    this.finish();
  }
  redirect(url) {
    let address = url;
    let status = 302;
    if (arguments.length === 2) {
      status = arguments[0];
      address = arguments[1];
    }
    this.header("Location", address);
    this.status(status);
    this.end();
  }
  status(number) {
    if (number === undefined) throw new Error("arg required");
    if (window["@endpointservices.callback"]) {
      window["@endpointservices.callback"](this.req.id, "status", [number]);
    } else if (window["@endpointservices.status"]) {
      window["@endpointservices.status"](number);
    } else {
      this._status = number;
    }
    return this;
  }
  header(arg1, arg2) {
    if (window["@endpointservices.callback"]) {
      window["@endpointservices.callback"](this.req.id, "header", [arg1, arg2]);
    } else if (window["@endpointservices.header"]) {
      window["@endpointservices.header"](arg1, arg2);
    } else {
      this._headers[arg1] = arg2;
    }
    return this;
  }
  finish() {
    if (this.done) this.done(this.toData());
  }
  toData() {
    return {
      ...(this._send && { send: this._send }),
      ...(this._json && { json: this._json }),
      ...(this._end && { end: this._end })
    };
  }
}


const generateSessionId = (name) => {
  const letters = new Uint32Array(salt);
  for (let i = 0; i < name.length; i++) {
    letters[i] = salt[i] ^ name.charCodeAt(i % name.length);
  }
  return letters
    .reduce((acc, n) => acc.concat(chars[n % chars.length]), [])
    .join("");
}

export const subdomain = (url) => {
  url = url || html`<a href="">`.href;
  const origin = location.origin;
  let match;
  if (match = /^https:\/\/observablehq.com\/@([^/]*)/.exec(url)) return match[1]
  if (match = /^https:\/\/([^.]*).static.observableusercontent.com/.exec(url)) return match[1]
  if (match = /^https:\/\/observablehq.com\/@([^/]*)/.exec(origin)) return match[1]
  if (match = /^https:\/\/([^.]*).static.observableusercontent.com/.exec(origin)) return match[1]
  return undefined;
}

const notebook = (url) => {
  url = url || html`<a href="">`.href;
  let match;
  if (
    (match = /^https:\/\/(next\.)?observablehq.com\/@[^/]*\/([^/?#;:]*(\/\d+)?)/.exec(
      url
    ))
  ) {
    // 2022-08-11: Added support for numerical suffix (e.g. /2)
    return match[2];
  }
  if ((match = /^https:\/\/(next\.)?observablehq.com\/(d\/[^/?#]*)/.exec(url)))
    return match[2];
  throw new Error("Cannot determine notebook name");
}



export const deploy = function (label, handler, options) {
  onVersionPublished; // Ensure all users of this have the onPublish hook installed
  if (typeof label !== "string")
    throw new Error(
      "The first parameter 'name' must be a unique string to disambiguate different endpoints, using'default' will exclude it from the URL"
    );

  options = options || {};
  const modifiers = options.modifiers || ["external"];
  if (typeof options.livecode === "string") {
    options.livecode = options.livecode.toUpperCase();
  }
  // We have to generate sessions if we are live coding
  const session =
    options.livecode === "PUBLIC" ? generateSessionId(label) : undefined;

  const isExternal = modifiers.includes("external");
  const isTerminal = modifiers.includes("terminal");
  const isOrchestrator = modifiers.includes("orchestrator");

  window["deployments"] = window["deployments"] || {};

  window["deployments"][label] = (req, context) =>
    new Promise((resolve, reject) => {
      req.query = req.query || {};
      const res = new Response(req, resolve);
      window["@endpointservices.context"] = context;
      try {
        Promise.resolve(handler(req, res, context)).catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });

  window["deployments"][label].config = {
    reusable: options.reusable || false,
    modifiers: options.modifiers,
    secrets: options.secrets
  };

  const host =
    options.host && /http(s?):\/\//.exec(options.host)
      ? options.host
      : "https://" + (options.host || `webcode.run`);

  const region = options.region ? `/regions/${options.region}` : "";
  try {
    // Bug fix
    if (options.hostNotebook) options.hostNotebook = "/" + options.hostNotebook;

    const namespace = subdomain();
    const notebook = options.hostNotebook
      ? options.hostNotebook.split("/")[1]
      : getContext().notebook;
    const name = label === "default" && !session ? "" : `;${label}`;
    const correlation = session ? `;${session}` : "";
    const link =
      `${host}${region}/observablehq.com` +
      (options.hostNotebook ||
        `${notebook.startsWith("d/") ? "" : `/@${namespace}`}/${notebook}`) +
      `${name}${correlation}`;
    return html`<a href="${link}" target="_blank">${link}</a>`;
  } catch (err) {
    console.error("Links don't work when embedded, but the deployed code does");
    return Object.defineProperty({}, "href", {
      get: () => {
        throw new Error(
          "Serverless cells do not work on embedded or unshared pages, unless you set the hostNotebook option"
        );
      }
    });
  }
}
