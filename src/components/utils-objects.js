//# Utilities: Objects


import * as d3 from "npm:d3";

//## Autotype


export function autoType(obj) {
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


//## Map

//### Entries

export function mapEntries(obj, { key = (k) => k, value = (v) => v } = {}) {
  if (typeof obj !== "object") return obj;

  return Object.entries(obj).reduce(
    (acc, [k, v]) => ({ ...acc, [key(k)]: value(v) }),
    {}
  );
}


//### Keys

export function mapKeys(obj, key) {
  return mapEntries(obj, { key });
}


//### Values


//## Translate

//### Keys


export function translateKeys(obj, translationMap) {
  return mapKeys(obj, (k) => translationMap.get(k) ?? k);
}


//### Value


export function translateValue(
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



// Translating an object, with not present `key`. The object will be returned as it
//is.



// Translating an array of objects:

//## Value Accessor
//Generates an accessor function if the user provides a key. Otherwise, if user provide a function, the function is returned.


export function accessor(keyOrFn) {
  if (typeof keyOrFn === "function") return keyOrFn;

  return (d) => d[keyOrFn];
}


