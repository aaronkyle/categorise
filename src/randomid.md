# Secure random ID

```
~~~js
import {randomId} from '@tomlarkworthy/randomid'
~~~
```

```js echo
const example = randomId()
```

```js echo
const randomId = (len = 8) => {
  // From 'https://observablehq.com/@tomlarkworthy/randomid'
  // Avoid / and + and - and _ typof chars seen in base64
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var array = new Uint32Array(len);
  window.crypto.getRandomValues(array);
  return [...array].map((v) => chars[v % chars.length]).join("");
}
```
