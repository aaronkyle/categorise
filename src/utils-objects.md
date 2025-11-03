# Utilities: Objects


```js
toc("h2,h3")
```

## Autotype

This built on top of [`d3.autoType`](https://github.com/d3/d3-dsv/blob/main/README.md#autoType) with support for parsing numeric strings with commas (e.g. `"2,323.00"`).

```js echo
function autoType(obj) {
  const copy = { ...obj };
  const skippedProps = {};

  for (let key in copy) {
    const value = copy[key];

    // If a prop is null or undefined set it to empty string so that d3.autoType doesn't throw error
    if (value === null || value === undefined) {
      copy[key] = "";
      continue;
    }

    // If a prop is not string, skip passing through d3.autoType
    if (typeof value !== "string") {
      skippedProps[key] = value;
      delete copy[key];
      continue;
    }

    const str = value.replace(",", "");
    if (!isNaN(+str)) {
      copy[key] = str;
    }
  }

  return {
    ...skippedProps,
    ...d3.autoType(copy)
  };
}
```

```js echo
// String values, with some numbers with commas
autoType({
  Year: "2000",
  Make: "Mercury",
  Model: "Cougar",
  Length: "2.38",
  Price: "200,000"
})
```

```js echo
// Some values with non string data types
autoType({
  Year: 2016,
  Make: "Mercury",
  Model: "Cougar",
  Length: 2.38,
  Price: "200,000",
  Length: undefined
})
```

## Map

### Entries

```js echo
function mapEntries(obj, { key = (k) => k, value = (v) => v } = {}) {
  if (typeof obj !== "object") return obj;

  return Object.entries(obj).reduce(
    (acc, [k, v]) => ({ ...acc, [key(k)]: value(v) }),
    {}
  );
}
```

```js echo
mapEntries(
  { Name: "Jane Doe", City: "Lisbon" },
  { key: (k) => k.toLowerCase(), value: (k) => k.toLowerCase() }
)
```

### Keys

```js echo
function mapKeys(obj, key) {
  return mapEntries(obj, { key });
}
```

```js echo
mapKeys({ Name: "Jane Doe", City: "Lisbon" }, (k) => k.toLowerCase())
```

### Values

```js echo
function mapValues(obj, value) {
  return mapEntries(obj, { value });
}
```

```js echo
mapValues({ Name: "Jane Doe", City: "Lisbon" }, (v) => v.toLowerCase())
```

## Translate

### Keys

```js echo
function translateKeys(obj, translationMap) {
  return mapKeys(obj, (k) => translationMap.get(k) ?? k);
}
```

```js echo
const translations = new Map([
  ["#","Index"],
  ["गा.पा./न.पा.को नाम","Name"],
  ["घरपरिवार","Households"],
  ["जम्मा","Total"],
  ["पुरुष","Men"],
  ["महिला","Women"],
  ["औषत घरपरिवार संख्या","Average household size"],
  ["लैगिंक अनुपात","Sex ratio"],
]);
display(translations)
```

```js echo
const example = translateKeys({
  "गा.पा./न.पा.को नाम": "जम्मा",
  घरपरिवार: "78,309",
  जम्मा: "323,288",
  पुरुष: "143,410",
  महिला: "179,878",
  "औषत घरपरिवार संख्या": "4.13",
  "लैगिंक अनुपात": "79.73",
}, translations);
display(example)
```

### Value

```js echo
function translateValue(
  obj,
  translationMap,
  {
    key, // The key of the value to be translated
    currentValueLang, // ISO Language code ("ne", "hi",...) of the current value. This will be appended to the key.
    translatedValueLang // ISO Language code ("ne", "hi",...) of the translate value. This will be appended to the key.
  } = {}
) {
  if (!(translationMap instanceof Map))
    throw new Error("`translationMap` should be an instance of Map");
  if (key == null) throw new Error("`key` is not provided");
  if (currentValueLang == null)
    throw new Error("`currentValueLang` is not provided");

  const copy = { ...obj };

  const currentValueKey = `${key}:${currentValueLang}`;
  const translatedValueKey =
    translatedValueLang == null ? key : `${key}:${translatedValueLang}`;

  const value = obj[key];

  // Return the object if the key is not present in the Object
  if (value === undefined) return obj;

  const translatedValue = translationMap.get(value);
  delete copy[key];

  return {
    ...copy,
    [translatedValueKey]: translatedValue,
    [currentValueKey]: value
  };
}
```

Translating an object:

```js echo
const example2 = ({
  Name: "जम्मा",
  Households: "78,309",
  Total: "323,288",
  Men: "143,410",
  Women: "179,878",
  "Average household size": "4.13",
  "Sex ratio": "79.73"
});
display(example2)
```

```js echo
translateValue(
  example2,
  new Map([
    ["जम्मा", "Total"],
    ["महिला", "Female"],
    ["पुरुष", "Male"]
  ]),
  {
    key: "Name",
    currentValueLang: "ne"
  }
)
```

Translating an object, with not present `key`. The object will be returned as it
is.


```js echo
translateValue(
  example2,
  new Map([
    ["जम्मा", "Total"],
    ["महिला", "Female"],
    ["पुरुष", "Male"]
  ]),
  {
    key: "SomethingNotThere",
    currentValueLang: "ne"
  }
)
```

Translating an array of objects:

```js echo
const exampleArray = [
  {
    season: "ग्रीष्म ऋतु"
  },
  {
    season: "शरद ऋतु"
  },
  {
    season: "जाडो"
  },
  {
    season: "वसन्त"
  }
];
display(exampleArray)
```

```js echo
exampleArray.map((d) =>
  translateValue(
    d,
    new Map([
      ["ग्रीष्म ऋतु", "Summer"],
      ["शरद ऋतु", "Autumn"],
      ["जाडो", "Winter"]
    ]),
    {
      key: "season",
      currentValueLang: "ne"
    }
  )
)
```

## Value Accessor

Generates an accessor function if the user provides a key. Otherwise, if user provide a function, the function is returned.

```js echo
function accessor(keyOrFn) {
  if (typeof keyOrFn === "function") return keyOrFn;

  return (d) => d[keyOrFn];
}
```

```js echo
accessor("name")({
  name: "Jane Doe", age: 29
})
```

```js echo
accessor((d) => d.name)({
  name: "Jane Doe",
  age: 29
})
```

## Imports

```js echo
//import { toc } from "@categorise/toc"
import { toc } from "/components/toc.js"
```
