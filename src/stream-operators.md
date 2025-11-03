# RxJS inspired stream operators for *views*


[Reactive Extension's (RxJS)](https://rxjs.dev/) container class is an _Observable_. Rx defines a set of stream operators to combine and transform _Observables_ into other _Observables_.

Observable[sic] Notebooks are nothing to do with RxJS, but have "views" which represent two reactive variables:
1. the control-plane variable "_viewof X_", often a DOM node.
2. the data-plane value "_X_", which is an independent reactivity participant.
  
Note the "viewof" does not need to to be a DOM node and it this notebook it will not be used like that.

In this notebook we note that a "_viewof_" can act like an RxJS Observable. It wraps a stream of values, and thus, we can make analogous viewof counterparts to RxJS's stream Operators. With our RxJS-like Stream Operators, we will combine and transform views, to create new views.

In this notebook we explore how some of RxJS's operators can solve some common Observablehq dataflow gotchas.



## Fizz Buzz Example

Walking through an implementation of FizzBuzz using stream operator's introduces the coding style. 

RxJS has a "creation" operator called [_interval_](https://rxjs.dev/api/index/function/interval) that creates a reactive stream that emits in incrementing numbers every "period" milliseconds. We can do the same thing:-

```js echo
//const counter = view(interval({ period: 500, invalidation }))
const counter = interval({ period: 500, invalidation })
```

```js echo
const counterView = Generators.input(counter);
display(counterView)
```


```js echo
counter
```

```js echo
counterView 
```


With our _interval_ it returns a "viewof" as opposed to an _Observable_. We also have to pass in the _invalidation_ promise so that if the cell is reevaluated the timer is removed. Note: all our stream operators need the invalidation promise passed in.

If we now look at the value of the _counter_ below, it is updating every half a second, but note the control-plane _viewof_ above is not. This is important, when we combine streams we work with the "viewofs", which are static wiring, but underneath them the dataplane is reactive and processing dataflow idiomatically to the Observable's notebook dataflow paradigm.

```js echo
counter
```

Lets implement FizzBuzz as two independently combined streams, Fizz and Buzz. 

For Fizz, we emit Fizz if we see the counter is divisible by 3, otherwise we emit null. We can use a reactive ["map"](https://rxjs.dev/api?query=map). Our input view is our previous viewof (not the data channel!)

```js echo
const fizz = map({
  view: counter,
  map: (count) => {
    if (count % 3 == 0) return "Fizz";
    return null;
  },
  invalidation
})
```

```js echo
const fizzView = Generators.input(fizz)
```


```js echo
fizz
```


```js echo
fizzView
```


Note the result of the map is another viewof, which depends only on the previous viewof counter, so is not affected by dataflow either but the underlying data channel is recomputing at the same rate as _counter_ (see below)

```js echo
fizz
```

Buzz is the same thing but for numbers divisible by 5 numbers.

```js echo
const buzz = map({
  view: counter,
  map: (count) => {
    if (count % 5 == 0) return "Buzz";
    return null;
  },
  invalidation
})
```


```js echo
const buzzView = Generators.input(buzz)
```


```js echo
buzz
```

```js echo
buzzView
```

Now lets try to combine streams. In FizzBuzz you either say fizz or buzz or both if the number is divisible by 5 and 3. If the number is not any of those you say the number. So we need to combine three streams (Fizz, Buzz and Counter).

A common stream combinator is ["combineLatest"](https://rxjs.dev/api/operators/combineLatest), which provides the latest values of multiple streams to a function, that then computes the emitted value.

Our viewof -> RxJS mapping converts the passed in viewof streams to values internally, and forwards them to the internal function in the same order but as values now. We never depend on data channels directly otherwise the stream operator call would recompute every data update.


```js echo
const fizzBuzzCombineLatest = combineLatest({
  // three views
  views: [counter, fizz, buzz],
  // three **values**
  map: (count, fizz, buzz) =>
    fizz && buzz ? fizz + buzz : fizz || buzz || count,
  invalidation
})
```



```js echo
const fizzBuzzCombineLatestView = Generators.input(fizzBuzzCombineLatest)
```

```js echo
fizzBuzzCombineLatest
```
```js echo
fizzBuzzCombineLatestView
```


_fizzBuzzCombineLatest_ shows the glitchiness of combining synchronised streams with _combineLatest_, sometimes there are extra frames merging a previous value to a new value, depending on the order of evaluation. 

The result is more updates than you would expect.

```js echo
fizzBuzzCombineLatest
```

We can count the number of updates with a scan

```js echo
const countFizzBuzzCombineLatest = scan({
  view: fizzBuzzCombineLatest,
  seed: 0,
  scan: (acc, element) => acc + 1,
  invalidation
})
```



```js echo
const countFizzBuzzCombineLatestView = Generators.input(countFizzBuzzCombineLatest)
```



```js echo
countFizzBuzzCombineLatest
```


```js echo
countFizzBuzzCombineLatestView
```

Now we can clearly see that there are three updates per clock update! This is a common source of bugs in Observable reactive programming! Merging multiple active dataflow add the rate of updates, furthermore the order of the cell updates is indeterminate. ObservableHQ dataflow is most analogous to RxJS's combineLatest operator.

RxJS has an alternative solution, the [zip](https://www.learnrxjs.io/learn-rxjs/operators/combination/zip) operator, which waits until every stream emits before emitting an array of those values.

```js echo
const fizzBuzzZipArray = zip({
  views: [counter, fizz, buzz],
  invalidation
})
```


```js echo
const fizzBuzzZipArrayView = Generators.input(fizzBuzzZipArray)
```


```js echo
fizzBuzzZipArray
```

```js echo
fizzBuzzZipArrayView
```

For zip and combineLatest you can add a map parameter to transform the stream inline.

```js echo
const fizzBuzzZip = zip({
  views: [counter, fizz, buzz],
  map: (count, fizz, buzz) =>
    fizz && buzz ? fizz + buzz : fizz || buzz || count,
  invalidation
})
```


```js echo
const fizzBuzzZipView = Generators.input(fizzBuzzZip)
```


```js echo
fizzBuzzZip
```



```js echo
fizzBuzzZipView
```

Now when we count the downstream updates we get one update every 500 millis! We solved FizzBuzz the stream orientated way!

```js echo
const countFizzBuzzZip = scan({
  view: fizzBuzzZip,
  seed: 0,
  scan: (acc, element) => acc + 1,
  invalidation
})
```


```js echo
const countFizzBuzzZipView = Generators.input(countFizzBuzzZip)
```

```js echo
countFizzBuzzZip
```

The zip operator is useful for fixing Obervable dataflow glitches caused by combining synchronised streams.

## Other Examples

#### Rate reduction

Another annoyance with Observable Notebook dataflow is its hard to reduce the rate of dataflow. As soon as a cell references another cell, the downstream cell will always recompute at least as frequently as the upstream cell.

We can fix this with stream operators, if a map function returns undefined, no update is made.

In the following function we will create a cell that updates once a second by only emitting if the counter is even, thereby halving the frequency of updates

```js echo
const evens = map({
  view: counter,
  map: (v) => (v % 2 ? undefined : v),
  invalidation
})
```


```js echo
const evensView = Generators.input(evens)
```




```js echo
evens
```


```js echo
evensView
```


#### Deduplication

Another common difficulty is preventing duplicate updates, this organically arrises when filtering collections. Often minor perturbations of the selection criteria lead to the same sub-selection, so why cascade that change downstream? More generally, if a cell output is the same, there is no need to propagate a change. We can use scan to achieve this.

```js echo
const headsOrTails = map({
  view: counter,
  map: (v) => (Math.random() > 0.5 ? "Heads" : "Tails"),
  invalidation
})
```



```js echo
const headsOrTailsView = Generators.input(headsOrTails)
```




```js echo
headsOrTails
```


```js echo
headsOrTailsView
```

```js echo
const deduped = scan({
  view: headsOrTails,
  scan: (acc, value) => (acc !== value ? value : undefined),
  invalidation
})
```

```js echo
const dedupedView = Generators.input(deduped)
```



```js echo
deduped
```



```js echo
dedupedView
```


#### Temporal Rate Measurement

The scan is pretty flexible. We can compute a running rate computation. First we map a stream to timestamps, scan to collect those within the last 5 seconds, then compute the average.

```js echo
const timestamp = map({
  view: deduped,
  map: () => performance.now(),
  invalidation
})
```

```js echo
const timestampView = Generators.input(timestamp)
```



```js echo
timestamp
```



```js echo
timestampView
```

```js echo
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
```

```js echo
const last_5_secsView = Generators.input(last_5_secs)
```



```js echo
last_5_secs
```


```js echo
last_5_secsView
```


```js echo
const rate = map({
  view: last_5_secs,
  map: (array) => array.length / (0.001 * (array.at(-1) - array.at(1))),
  invalidation
})
```


```js echo
const rateView = Generators.input(rate)
```


${rate} per second


${rateView} per second


We don't actually need to do these computations in different cells, you can wire everything up purely in imperative code if you want. It looks ugly as hell though.

```js echo
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
```


```js echo
const rate2View = Generators.input(rate2)
```

${rate2} per second


${rate2View} per second


## Operator Implementation

In most places returning `undefined` means skip an update.

### interval

https://rxjs.dev/api/index/function/interval

```js  echo
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
```

### map

https://rxjs.dev/api/index/function/map

```js  echo
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
```

### scan

https://rxjs.dev/api/operators/scan

```js  echo
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
```

### combineLatest

https://rxjs.dev/api/index/function/combineLatest

```js echo
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
```

### zip

https://rxjs.dev/api/index/function/zip

```js echo
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
```
