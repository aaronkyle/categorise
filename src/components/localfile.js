//# LocalFile
// Code in this notebook derived from https://observablehq.com/@mbostock/localfile

import { FileAttachment, Generators } from "observablehq:stdlib";
import * as htl from "htl";
import {SQLiteDatabaseClient} from "npm:@observablehq/sqlite";

// --- Use the real attachment as the "AbstractFile" base and as a fallback value ---
const emptyAttachment = FileAttachment("empty@1"); // <-- must be a real SQLite DB

// Derive AbstractFile from a real attachment (same as in notebooks)
const AbstractFile = emptyAttachment.constructor.__proto__;


export class LocalFile extends AbstractFile {
  constructor(file) {
    super(file.name);
    Object.defineProperty(this, "_", {value: file});
    Object.defineProperty(this, "_url", {writable: true});
  }
  async url() {
    return this._url || (this._url = URL.createObjectURL(this._));
  }
  async blob() {
    return this._;
  }
  async stream() {
    return this._.stream();
  }
}


//export function localFileInput({
//  accept, // e.g., ".txt,.md"
//  value // set the initial value (typically to a FileAttachment)
//} = {}) {
//  return Object.assign(htl.html`<form><input type=file ${{accept}} oninput=${(event) => {
//    const {currentTarget: input} = event;
//    const {form, files: [file]} = input;
//    form.value = new LocalFile(file);
//  }}>`, {value});
//}

// File input that can seed with a default attachment (value)
export function localFileInput({ accept, value } = {}) {
  return Object.assign(
    htl.html`<form><input type=file ${{ accept }} oninput=${(event) => {
      const { currentTarget: input } = event;
      const {
        form,
        files: [file]
      } = input;
      form.value = new LocalFile(file);
    }}></form>`,
    { value }
  );
}

// 1) Build the input with the attachment as the initial value (so it "just works")
//const file = view(localFileInput({accept: ".db"}))
//const file = localFileInput({accept: ".db"})
const fileView = localFileInput({accept: ".db"})

// 2) In vanilla JS, Generators.input returns an iterator. Pull the current value:
//const file = view(localFileInput({accept: ".db"}))
const fileIterator = Generators.input(fileView);
const file = (await (async () => {
  const f = await fileIterator.value;
  // If user hasn't attached a file, f will be undefined or null
  if (!f) return emptyAttachment;
  return f;
})());

// 3) Open the database
// Getting TypeError: file.sqlite is not a function
//const db = await file.sqlite()
const db = await SQLiteDatabaseClient.open(file)

await db.describe()


