//# How to password protect a Notebook secret
// <!-- https://observablehq.com/@endpointservices/notebook-secret -->

//import {Textarea, Text} from "@observablehq/inputs";
import {Textarea, Text} from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.12/+esm";
//import {html} from "@observablehq/htl";
import {html} from "https://cdn.jsdelivr.net/npm/htl@0.3.1/+esm"
import {pbcopy} from "./copier.js"; // assumes pbcopy is exported from copier.js

// Encoder
const enc = new TextEncoder();

// Base64 helpers
const encode64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const decode64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

// Derive a key from password using PBKDF2
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
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    material,
    {name: "AES-GCM", length: 256},
    true,
    ["encrypt", "decrypt"]
  );
};

// Encrypt a secret using AES-GCM
export const encrypt = async ({secret, password} = {}) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const name = "AES-GCM";
  const ciphertext = await window.crypto.subtle.encrypt(
    {name, iv},
    key,
    enc.encode(secret)
  );
  return {
    name,
    salt: encode64(salt),
    iv: encode64(iv),
    ciphertext: encode64(ciphertext)
  };
};

// Decrypt the payload using a password
export const decode = async (password, encryptedSecret) => {
  if (typeof encryptedSecret === "string") {
    encryptedSecret = JSON.parse(encryptedSecret);
  }
  const key = await deriveKey(password, decode64(encryptedSecret.salt));
  const secret = await window.crypto.subtle.decrypt(
    {
      name: encryptedSecret.name,
      iv: decode64(encryptedSecret.iv)
    },
    key,
    decode64(encryptedSecret.ciphertext)
  );
  return new TextDecoder().decode(secret);
};

// UI: Password input
export const passwordInput = () =>
  view(html`${Text({label: "Password"})}`);

// UI: Secret input
export const secretInput = () =>
  view(Textarea({label: "Secret", rows: 6}));

// UI: Copy encrypted payload button
export function copyEncryptedPayloadButton(encryptedPromise) {
  const msg = html`Copy encrypted payload`;
  const button = html`<button class="copy">${msg}</button>`;
  const ui = html`<div>${button}</div>`;

  button.onclick = async () => {
    const result = await encryptedPromise;
    pbcopy(JSON.stringify(result, null, 2));
    button.innerHTML = "copied!";
    setTimeout(() => (button.innerHTML = msg.outerHTML), 1000);
  };

  return ui;
}

// UI: Decrypt control
export function decrypt(encryptedSecret) {
  const feedback = html`<div class="feedback"></div>`;
  const password = html`<input class="password" type="password" placeholder="Enter your password" />`;

  const ui = html`<div>
    ${feedback}
    ${password}
  </div>`;

  ui.value = undefined;

  password.oninput = evt => evt.stopPropagation();
  password.onkeypress = async evt => {
    if (evt.keyCode === 13) {
      try {
        const decoded = await decode(password.value, encryptedSecret);
        feedback.innerHTML = "";
        ui.value = decoded;
        ui.dispatchEvent(new Event("input"));
      } catch (err) {
        console.error(err);
        feedback.innerHTML = "Please try again";
      }
      password.value = "";
    }
  };

  return ui;
}