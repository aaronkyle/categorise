//# Secure random ID
//<!---
//https://observablehq.com/@tomlarkworthy/randomid
//--->
//```
//~~~js
//import {randomId} from '@tomlarkworthy/randomid'
//~~~
//```

// Generates a random alphanumeric ID of specified length
export const randomId = (len = 8) => {
  // From 'https://observablehq.com/@tomlarkworthy/randomid'
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(len);
  window.crypto.getRandomValues(array);
  return [...array].map((v) => chars[v % chars.length]).join("");
};

// Example value generated at module load time
export const example = randomId();
