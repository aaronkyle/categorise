//# RxJS inspired stream operators for *views*
//https://observablehq.com/@tomlarkworthy/stream-operators



/* Helper to return elements where the view() function was used in Framework. */
const view = x => x;




//======= ======//




//## Operator Implementation


// ### interval
// https://rxjs.dev/api/index/function/interval

  echo
function interval({ period = 0, invalidation }) {
  const result = Inputs.input();
  let count = 0;
  debugger;
  const onTick = () => {
    debugger;
    result.value = count++;
    result.dispatchEvent(new Event("input"));
  };
  const id = setInterval(onTick, period);
  invalidation.then(() => clearInterval(id));
  return result;
}


// ### map
// https://rxjs.dev/api/index/function/map

  echo
function map({ view, map = (v) => v, invalidation }) {
  const result = Inputs.input();
  const handler = () => {
    const val = map(view.value);
    if (val !== undefined) {
      result.value = val;
      result.dispatchEvent(new Event("input"));
    }
  };
  view.addEventListener("input", handler);

  invalidation.then(() => view.removeEventListener("input", handler));
  handler();
  return result;
}


//### scan
//https://rxjs.dev/api/operators/scan

  echo
function scan({ view, scan = (acc, v) => v, seed, invalidation }) {
  const result = Inputs.input();
  let acc = seed;

  const handler = () => {
    const update = scan(acc, view.value);
    if (update !== undefined) {
      acc = update;
      result.value = acc;
      result.dispatchEvent(new Event("input"));
    }
  };

  view.addEventListener("input", handler);

  invalidation.then(() => view.removeEventListener("input", handler));

  handler();
  return result;
}


//### combineLatest
// https://rxjs.dev/api/index/function/combineLatest


function combineLatest({
  views = [],
  map = (...views) => views,
  invalidation
}) {
  const result = Inputs.input();
  const recompute = () => {
    const latest = map(...views.map((v) => v.value));
    if (latest !== undefined) {
      result.value = latest;
      result.dispatchEvent(new Event("input"));
    }
  };
  views.forEach((view) => view.addEventListener("input", recompute));
  invalidation.then(() => {
    views.forEach((view) => view.removeEventListener("input", recompute));
  });
  return result;
}


// ### zip
// https://rxjs.dev/api/index/function/zip


function zip({ views = [], map = (...values) => values, invalidation }) {
  const result = Inputs.input();
  const queues = views.map(() => []);
  const handlers = views.map((view, i) => {
    const handler = () => {
      queues[i].push(view.value);
      if (queues.every((q) => q.length > 0)) {
        const vals = queues.map((q) => q.shift());
        const out = map(...vals);
        if (out !== undefined) {
          result.value = out;
          result.dispatchEvent(new Event("input"));
        }
      }
    };
    view.addEventListener("input", handler);
    return { view, handler };
  });

  invalidation.then(() => {
    handlers.forEach(({ view, handler }) =>
      view.removeEventListener("input", handler)
    );
  });

  return result;
}



//======= ======//


//const counter = view(interval({ period: 500, invalidation }))
const counter = interval({ period: 500, invalidation })



const counterView = Generators.input(counter);
display(counterView)


counter

counterView 

counter



const fizz = map({
  view: counter,
  map: (count) => {
    if (count % 3 == 0) return "Fizz";
    return null;
  },
  invalidation
})



const fizzView = Generators.input(fizz)




fizz




fizzView



fizz



const buzz = map({
  view: counter,
  map: (count) => {
    if (count % 5 == 0) return "Buzz";
    return null;
  },
  invalidation
})




const buzzView = Generators.input(buzz)




buzz



buzzView



const fizzBuzzCombineLatest = combineLatest({
  // three views
  views: [counter, fizz, buzz],
  // three **values**
  map: (count, fizz, buzz) =>
    fizz && buzz ? fizz + buzz : fizz || buzz || count,
  invalidation
})





const fizzBuzzCombineLatestView = Generators.input(fizzBuzzCombineLatest)



fizzBuzzCombineLatest


fizzBuzzCombineLatestView




fizzBuzzCombineLatest



const countFizzBuzzCombineLatest = scan({
  view: fizzBuzzCombineLatest,
  seed: 0,
  scan: (acc, element) => acc + 1,
  invalidation
})





const countFizzBuzzCombineLatestView = Generators.input(countFizzBuzzCombineLatest)





countFizzBuzzCombineLatest




countFizzBuzzCombineLatestView



const fizzBuzzZipArray = zip({
  views: [counter, fizz, buzz],
  invalidation
})




const fizzBuzzZipArrayView = Generators.input(fizzBuzzZipArray)




fizzBuzzZipArray



fizzBuzzZipArrayView



const fizzBuzzZip = zip({
  views: [counter, fizz, buzz],
  map: (count, fizz, buzz) =>
    fizz && buzz ? fizz + buzz : fizz || buzz || count,
  invalidation
})




const fizzBuzzZipView = Generators.input(fizzBuzzZip)




fizzBuzzZip





fizzBuzzZipView



const countFizzBuzzZip = scan({
  view: fizzBuzzZip,
  seed: 0,
  scan: (acc, element) => acc + 1,
  invalidation
})




const countFizzBuzzZipView = Generators.input(countFizzBuzzZip)



countFizzBuzzZip



const evens = map({
  view: counter,
  map: (v) => (v % 2 ? undefined : v),
  invalidation
})




const evensView = Generators.input(evens)




evens




evensView




const headsOrTails = map({
  view: counter,
  map: (v) => (Math.random() > 0.5 ? "Heads" : "Tails"),
  invalidation
})




const headsOrTailsView = Generators.input(headsOrTails)






headsOrTails




headsOrTailsView



const deduped = scan({
  view: headsOrTails,
  scan: (acc, value) => (acc !== value ? value : undefined),
  invalidation
})



const dedupedView = Generators.input(deduped)





deduped





dedupedView




const timestamp = map({
  view: deduped,
  map: () => performance.now(),
  invalidation
})



const timestampView = Generators.input(timestamp)





timestamp





timestampView



const last_5_secs = scan({
  view: timestamp,
  seed: [],
  scan: (acc, next) => {
    acc.push(next);
    while (acc[0] < performance.now() - 5000) acc.shift();
    return acc;
  },
  invalidation
})



const last_5_secsView = Generators.input(last_5_secs)





last_5_secs




last_5_secsView




const rate = map({
  view: last_5_secs,
  map: (array) => array.length / (0.001 * (array.at(-1) - array.at(1))),
  invalidation
})




const rateView = Generators.input(rate)




const rate2 = map({
  map: (array) => array.length / (0.001 * (array.at(-1) - array.at(1))),
  view: scan({
    seed: [],
    scan: (acc, next) => {
      acc.push(next);
      while (acc[0] < performance.now() - 5000) acc.shift();
      return acc;
    },
    view: map({
      map: () => performance.now(),
      view: deduped,
      invalidation
    }),
    invalidation
  }),
  invalidation
})




const rate2View = Generators.input(rate2)


