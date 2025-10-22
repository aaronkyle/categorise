# How to password protect a Notebook secret

<div class="tip">
  This notebook ports to Observable Framework a notebook by Tom Larkworthy
  <a href="https://observablehq.com/@endpointservices" target="_blank" rel="noopener noreferrer">@endpointservices</a> called <a href="https://observablehq.com/@endpointservices/notebook-secret" target="_blank" rel="noopener noreferrer">How to password protect a Notebook secret</a>. <br/>
  All mistakes and deviations from the original are my own.
</div>

I sometimes wish to hide a secret in a public notebook, for example, a [service account to run billable cloud commands](https://observablehq.com/@endpointservices/cache-bigquery). This notebook provides functionality to generate a password-protected encrypted payload, which is safe to save in a public notebook.

    ```
    ~~~js
    import {encrypt} from '@endpointservices/notebook-secret'
    ~~~
    ```

Also provided is a _decrypt_ UI control, which can read an encrypted payload and prompt the user for a password. If the correct password is provided the value resolves to the original secret. 

    ```
    ~~~js
    import {decrypt} from '@endpointservices/notebook-secret'
    ~~~
    ```

This is allows the notebook author to run some privileged commands that other viewers cannot. If you want regular viewers also to be able to run privileged operations, consider using [serverless secrets](https://observablehq.com/@endpointservices/how-to-keep-an-api-key-secret-in-a-public-notebook) where the secret is never exposed to a client browser.

If you want to encode a secret for programatic use, use decode instead

    ```
    ~~~js
    import {decode} from '@endpointservices/notebook-secret'
    ~~~
    ```


## Step 1, generate an encrypted payload

Configure the password and the secret


```js echo
const pass = view(html`${Text({"label":"Password"})}`)
```

```js echo
const secret = view(Textarea({label: "Secret", rows: 6}))
```

This generates a encrypted payload which is safe to put in a public place

```js echo
const encrypt = async ({
  secret, password
} = {}) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const name = "AES-GCM";
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name, iv
    },
    key,
    enc.encode(secret)
  );
  return {
    name,
    salt: encode64(salt),
    iv: encode64(iv),
    ciphertext: encode64(ciphertext)
  };
}
```

```js echo
const encryptedSecret = encrypt({
  password: pass,
  secret
})
```

You will probably need to pass this to the _decrypt_ function so you can click the following button to copy it to the clipboard

```js echo
const toClipboard = {
  const msg = html`Copy encrypted payload`;
  
  function click() {
    button.innerHTML = "copied!"
    pbcopy(JSON.stringify(encryptedSecret, null, 2));
    setTimeout(
      () => button.innerHTML = msg.outerHTML,
      1000
    )
  }
  const ui = html`<div>
    <button class="copy" onclick=${click}>${msg}</button>
  </div>`
  let button = ui.querySelector(".copy")
  
  return ui;
}
```

## Step 2, create a _decrypt_ control

The _decrypt_ UI control takes an encrypted payload as an argument, and prompts the reader for a password. Only when the password is correct, the control can resolve a value which is the decrypted secret.

    ```
    ~~~js
    viewof decryptedSecret = decrypt(<encrypted payload>)
    ~~~
    ```

In the following example the password is "12345"

```js echo
const decryptedSecret = view(decrypt({
  "name": "AES-GCM",
  "salt": "R6IPpW0u06A+sObp",
  "iv": "8Qo+fJwwOUBz+UuU",
  "ciphertext": "D2Hw1RK41fNnYL3MEbJVSdjkQJK2BfjV4hYwavJqdjsbFl5G8QJQUANHri1hE2eLvADXrkFp8tRt7Yk="
}))
```

<a href=${decryptedSecret}>${decryptedSecret}</a>

### Implementation Notes

We use "PBKDF2" to derive a high quality key from a low quality one like a user password.

We use "AES-GCM" to encrypt the secret payload, which is a notable for being an [authenticated encryption](https://en.wikipedia.org/wiki/Authenticated_encryption) algorithm that is available in the browser.


```js echo
function decrypt(encryptedSecret) {
  function input(evt) {
      evt.stopPropagation()
  }
  
  async function keypress(evt) {
    if (evt.keyCode === 13) {
      let decoded = new Promise(() => {})
      try {
        decoded = await decode(password.value, encryptedSecret)
        feedback.innerHTML = "";
      } catch (err) {
        console.error(err)
        feedback.innerHTML = "Please try again"
      }
      password.value = ""
      ui.value = decoded;
      ui.dispatchEvent(new Event('input'));
    }
  }
      
  let ui = html`<div>
    <div class="feedback"></div>
    <input class="password"
           type="password"
           placeholder="Enter your password"
           oninput=${input}
           onkeypress=${keypress} />
  </div>`
  
  let feedback = ui.querySelector(".feedback");
  let password = ui.querySelector(".password");

  ui.value = undefined
  return ui;
}
```

```js echo
async function decode(password, encryptedSecret) {
  if (typeof encryptedSecret === 'string') encryptedSecret = JSON.parse(encryptedSecret)
  const key = await deriveKey(password, decode64(encryptedSecret.salt));
  const secret = await window.crypto.subtle.decrypt(
    {
      name: encryptedSecret.name,
      iv: decode64(encryptedSecret.iv)
    },
    key,
    decode64(encryptedSecret.ciphertext)
  );
  return new TextDecoder().decode(secret)
}
```

```js echo
const deriveKey = async (password, salt) => {
  const material = await window.crypto.subtle.importKey(
      "raw", 
      enc.encode(password), 
      {name: "PBKDF2"}, 
      false, 
      ["deriveBits", "deriveKey"]
    );
  return await window.crypto.subtle.deriveKey(
      {
        "name": "PBKDF2",
        salt: salt, 
        "iterations": 100000,
        "hash": "SHA-256"
      },
      material,
      { "name": "AES-GCM", "length": 256},
      true,
      [ "encrypt", "decrypt" ]
    );
}
```

```js echo
const enc = new TextEncoder();
display(enc)
```

```js echo
const encode64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));;
display(encode64)
```

```js echo
const decode64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
display(decode64)
```

```js echo
//import {html} from '@observablehq/htl'
import {html} from '/components/htl.js';
display(html)
```

```js echo
//import {Textarea, Text} from "@observablehq/inputs"
import {textarea as Textarea, text as Text} from "/components/inputs_observable.js";
display(Textarea);
display(Text)
```

```js echo
//import {pbcopy} from "@mbostock/pbcopy"
import {pbcopy} from "/components/copier.js";
display(pbcopy)
```

```js
//import { footer } from "@endpointservices/footer-with-backups"
```

```js
//footer
```
