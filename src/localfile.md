# LocalFile

<div class="tip">
  This notebook ports to Observable Framework a notebook by Mike Bostock
  <a href="https://observablehq.com/@mbostock" target="_blank" rel="noopener noreferrer">@mbostock</a> called <a href="https://observablehq.com/@mbostock/localfile" target="_blank" rel="noopener noreferrer">LocalFile</a>. <br/>
  All mistakes and deviations from the original are my own.
</div>

<p style="background: #fffced; box-sizing: border-box; padding: 10px 20px;">***Update Oct. 2021:*** *Observable now supports [**file inputs**](/@observablehq/input-file)! This notebook will remain for history, but please upgrade to [Observable Inputs](/@observablehq/inputs).*</p>

A hack to treat a local file as an Observable FileAttachment, so that you get all the same conveniences (*e.g.*, loading CSV or SQLite). Pass the *value* option to set the initial value to a file attachment.

```js echo
const file = view(localFileInput({accept: ".db"}))
```

```js echo
const db = file.sqlite()
```

```js echo
db.describe()
```

```js echo
function localFileInput({
  accept, // e.g., ".txt,.md"
  value // set the initial value (typically to a FileAttachment)
} = {}) {
  return Object.assign(htl.html`<form><input type=file ${{accept}} oninput=${(event) => {
    const {currentTarget: input} = event;
    const {form, files: [file]} = input;
    form.value = new LocalFile(file);
  }}>`, {value});
}
```

```js echo
class LocalFile extends AbstractFile {
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
```

```js echo
const AbstractFile = FileAttachment("/data/empty@1").constructor.__proto__
display(AbstractFile)
```