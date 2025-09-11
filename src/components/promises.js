// Promises.js
//https://github.com/observablehq/stdlib/tree/493bf210f5fcd9360cf87a961403aa963ba08c96/src/promises

const timeouts = new Map();

function timeout(now, time) {
  const t = new Promise((resolve) => {
    // replace any pending promise for this exact time
    timeouts.delete(time);

    const delay = time - now;
    if (!(delay > 0)) throw new Error("invalid time");
    if (delay > 0x7fffffff) throw new Error("too long to wait");

    setTimeout(resolve, delay);
  });

  timeouts.set(time, t);
  return t;
}

export function when(time, value) {
  let p = timeouts.get((time = +time));
  if (p) return p.then(() => value);

  const now = Date.now();
  return now >= time ? Promise.resolve(value) : timeout(now, time).then(() => value);
}

export function tick(duration, value) {
  const t = Math.ceil((Date.now() + 1) / duration) * duration;
  return when(t, value);
}

export function delay(duration, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), duration);
  });
}

// Optional: convenience default export so both import styles work nicely.
export default { when, tick, delay };
