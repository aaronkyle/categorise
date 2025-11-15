# Color Legend

<!-- Refer to: https://observablehq.com/@categorise/color-legend-util -->

```js
import { DOM } from "/components/DOM.js";
```

## Ordinal Scale

Generates SVG legend. The code is based on
[Color Legend by D3](https://observablehq.com/@d3/color-legend).


```js echo
swatch(d3.scaleOrdinal(["blueberries", "oranges", "apples"], schemeBuReGnGr))
```

```js echo
function swatch(
  color,
  {
    swatchSize = 15,
    columnWidth = swatchSize + 90,
    maxWidth = 600,
    gap = 10,
    fontFamily = "var(--sans-serif, sans-serif)",
    fontSize = "10px",
    fontFill = main.grey["900"]
  } = {}
) {
  const domain = color.domain();
  const cols = Math.max(
    Math.min(Math.floor(maxWidth / (columnWidth + gap)), domain.length),
    1
  );
  const rows = Math.floor(domain.length / cols);

  const width = Math.min(maxWidth, (columnWidth + gap) * cols);
  const height = (swatchSize + gap) * rows;

  const svg = DOM.svg(width, height);

  const swatches = d3
    .select(svg)
    .selectAll("g")
    .data(domain)
    .join("g")
    .attr("transform", (d, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return `translate(${col * (columnWidth + gap)},${
        row * (swatchSize + gap)
      })`;
    });

  // Add colors swatch
  swatches
    .append("rect")
    .attr("width", swatchSize)
    .attr("height", swatchSize)
    .attr("fill", (d) => color(d));

  setTimeout(() => {
    swatches
      .append("text")
      .style("font-family", fontFamily)
      .style("font-size", fontSize)
      .attr("dominant-baseline", "middle")
      .attr("y", swatchSize / 2)
      .attr("x", swatchSize + gap / 2)
      .attr("dy", "0.15em")
      .text((d) => d)
      .call(wrap, columnWidth - (swatchSize + gap / 2));
  });

  return svg;
}
```

## Utils

```js echo
// https://observablehq.com/@jacobtfisher/brand-identity-radar-chart
function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.4, // ems
      y = text.attr("y"),
      x = text.attr("x"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}
```

## Imports

```js
// To apply base styles when the notebook is downloaded/exported
//substratum({invalidation})
```

```js
//import {substratum} from "@adb/substratum"
```

```js echo
//import { main,schemeBuReGnGr } from "@adb/data-vis-style-guide"
import { main,schemeBuReGnGr } from "/components/data-vis-style-guide.js"
display(main)
display(schemeBuReGnGr)
```
