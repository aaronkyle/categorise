# D3 error example

<div class="tip">
This notebook ports a notebook by Saneef H. Ansari [@saneef] called <a href="https://observablehq.com/https://observablehq.com/@saneef/radar-chart">Radar Chart</a>.  All mistakes and deviations from the original are my own.
</div>




```js echo
//import { swatch, wrap } from "@adb/color-legend"
import { swatch, wrap } from "/components/color-legend.js"
display(swatch);
display(wrap);
```


```js echo
//import { schemeBuReGnGr, main } from "@adb/data-vis-style-guide"
import { schemeBuReGnGr, main } from "/components/data-vis-style-guide.js"
display(schemeBuReGnGr);
display(main);
```


```js echo
import { DOM } from "/components/DOM.js";
```



```js echo
//import {byProvince} from "@adb/nepal-cbs-2011-census-household-facilities"
import {byProvince} from "/components/nepal-cbs-2011-census-household-facilities.js";
display(byProvince)
```



```js echo
d3.curveLinearClosed
```

```js echo
d3.format(".0%")
```


```js echo
const sampleChart = radarChart(sampleData, {
  group: "Province",
  attribute: "Attribute",
  value: "Penetration",

  tickFormat: d3.format(".0%"),
  radarCurve: curve
});
display(sampleChart)
```

```js echo
/// viewof curve = Inputs.radio(
const curve = view(Inputs.radio(
  new Map([
    ["curveLinearClosed (default)", d3.curveLinearClosed],
    ["curveCardinalClosed", d3.curveCardinalClosed],
    ["curveCatmullRomClosed", d3.curveCatmullRomClosed]
  ]),
  { label: "Curve styles", value: d3.curveLinearClosed }
))
```


```js echo
const sampleData = byProvince
  .flatMap((p) => {
    const selectKeys = [
      "Radio",
      "Television",
      "Computer",
      "Internet",
      "Mobile Phone"
    ];

    const { Province, Total } = p;

    return selectKeys.map((Attribute) => ({
      Province,
      Attribute,
      Penetration: p[Attribute] / Total
    }));
  })
  .filter((p) => ["Province 1", "Province 2"].includes(p.Province));
display(sampleData)
```



```js echo
function radarChart(
  data,
  {
    // Required
    attribute = "attribute",
    value = "value",
    group,

    // Optionals
    maxValue = undefined, // will calculate it
    scheme = schemeBuReGnGr,

    width = 600,
    height = width,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,

    fontFamily = "var(--sans-serif, sans-serif)",

    angleOffset = -Math.PI / 2,
    ticks = 3,

    radarStrokeWidth = 2.5,
    radarDotRadius = radarStrokeWidth * 1.25,
    radarFillOpacity = 0.1,
    radarCurve = d3.curveLinearClosed,

    sortGroups,
    sortAttributes,

    gridStroke = main.grey["300"],
    gridStrokeWidth = 1.5,
    tickFontSize = "0.75rem",
    tickFill = main.grey["700"],
    tickFormat = formatTick,

    axisLabelFill = main.grey["1000"],
    axisLabelFontSize = "0.8rem",
    axisLabelFontWeight = "normal",
    axisLabelMaxWidth = 120,

    showLegend = true
  } = {}
) {
  // Access data
  const getGroup = group === null ? null : generateAccessor(group);
  const getValue = generateAccessor(value);
  const getAttribute = generateAccessor(attribute);

  // Compute values
  let G = getGroup ? [...new Set(data.map(getGroup))] : null;
  let A = [...new Set(data.map(getAttribute))];

  G = typeof sortGroups === "function" ? G.slice().sort(sortGroups) : G;
  A = typeof sortAttributes === "function" ? A.slice().sort(sortGroups) : A;

  let V = [];
  G.forEach((g, i) => {
    V[i] = [];
    A.forEach((a, j) => {
      const obj = data.find((d) => g === getGroup(d) && a === getAttribute(d));
      const v = getValue(obj);
      V[i][j] = v == null ? NaN : +v;
    });
  });

  // Construct scales
  marginTop = margin ?? marginTop ?? 0;
  marginRight = margin ?? marginRight ?? 0;
  marginBottom = margin ?? marginBottom ?? 0;
  marginLeft = margin ?? marginLeft ?? 0;

  const w = width - marginLeft - marginRight;
  const h = height - marginTop - marginBottom;
  const maxR = (Math.min(w, h) * 0.5 * 2) / 3;
  maxValue = maxValue || d3.max(data, getValue);
  const radialGridStrokeWidth = Math.max(1.5, gridStrokeWidth / 2);

  const radius = d3.scaleLinear().domain([0, maxValue]).range([0, maxR]);
  const angle = d3
    .scaleBand()
    .domain(A)
    .range([0 + angleOffset, Math.PI * 2 + angleOffset]);

  const color = d3.scaleOrdinal().domain(G).range(scheme);

  // Construct generator
  const radarLine = d3
    .lineRadial()
    .curve(radarCurve)
    .radius((d) => radius(d))
    .angle((_, i) => angle(A[i]) - angleOffset);

  // Draw canvas
  const svg = DOM.svg(width, height);
  const canvas = d3
    .select(svg)
    .style("background", "white")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const peripherals = canvas.append("g").attr("class", "peripherals");

  // Add axes
  peripherals
    .selectAll(".axis")
    .data(A)
    .join("line")
    .attr("class", "axis")
    .attr("stroke", gridStroke)
    .attr("stroke-width", gridStrokeWidth)
    .each(function (d, i) {
      const theta = angle(d);
      const [x, y] = getCoordinatesForAngle(
        theta,
        maxR + radialGridStrokeWidth / 2
      );
      d3.select(this).attr("x2", x).attr("y2", y);
    });

  // Add axis labels
  setTimeout(() => {
    // Running within timeout since wrap(), to wrap labels needs to be in DOM to measure width
    peripherals
      .selectAll(".axis-label")
      .data(A)
      .join("text")
      .attr("class", "axis-label")
      .text((d) => d)
      .attr("dominant-baseline", "middle")
      .attr("fill", axisLabelFill)
      .attr("fill-opacity", 1)
      .attr("font-size", axisLabelFontSize)
      .attr("font-weight", axisLabelFontWeight)
      .style("font-family", fontFamily)
      .each(function (d, i) {
        const theta = angle(d);
        const [x, y] = getCoordinatesForAngle(theta, maxR * 1.125);
        d3.select(this)
          .attr("x", x)
          .attr("y", y)
          .style(
            "text-anchor",
            Math.abs(x) < 5 ? "middle" : x > 0 ? "start" : "end"
          );
      })
      .attr("dy", "0em")
      .call(wrap, axisLabelMaxWidth);
  });

  // Add radial ticks
  const radialTicks = radius.ticks(ticks);
  peripherals
    .selectAll(".radial-grid")
    .data(radialTicks)
    .join("circle")
    .attr("class", "radial-grid")
    .attr("r", radius)
    .attr("fill", "none")
    .attr("stroke", gridStroke)
    .attr("stroke-width", radialGridStrokeWidth)
    .attr(
      "stroke-dasharray",
      `${radialGridStrokeWidth} ${radialGridStrokeWidth * 2}`
    );

  peripherals
    .selectAll(".radial-tick")
    .data(radialTicks.slice(1)) // Ignore the zero tick
    .join("text")
    .attr("class", "radial-tick")
    .style("font-size", tickFontSize)
    .style("fill", tickFill)
    .style("font-family", fontFamily)
    .attr("dy", "16px")
    .attr("dx", "4px")
    .attr("y", (d) => -radius(d))
    .text((d) => tickFormat(d));

  // Draw data
  const plot = canvas.append("g").attr("class", "plot");
  const groups = plot
    .selectAll(".group")
    .data(G)
    .join("g")
    .attr("class", "group");

  groups.each(function (group, groupIndex) {
    const groupData = V[groupIndex];
    const positions = groupData.map((value, attrIndex) => {
      const theta = angle(A[attrIndex]);
      return getCoordinatesForAngle(theta, radius(value));
    });

    const g = d3.select(this);

    const radarTitle = `${group ? `${group}\n\n` : ""}${groupData
      .map((v, i) => `${A[i]}: ${tickFormat(v)}`)
      .join("\n")}`;

    // Add radarLine
    g.selectAll(".radar")
      .data([group])
      .join("path")
      .attr("class", "radar")
      .attr("fill", () => color(group))
      .attr("fill-opacity", radarFillOpacity)
      .attr("stroke", () => color(group))
      .attr("d", radarLine(groupData))
      .append("title")
      .text(radarTitle);

    // Add dots
    g.selectAll(".dot")
      .data(positions)
      .join("circle")
      .attr("class", "dot")
      .attr("r", radarDotRadius)
      .attr("fill", () => color(group))
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .append("title")
      .text(
        (d, i) =>
          `${group ? `${group}\n` : ""}${A[i]}: ${tickFormat(groupData[i])}`
      );
  });

  // Set up interactions
  const radars = plot
    .selectAll(".radar")
    .on("mouseover", function (d, i) {
      d3.selectAll(".radar")
        .transition()
        .duration(200)
        .attr("stroke-opacity", 1 / 2)
        .attr("fill-opacity", 1 / 50);

      d3.select(this)
        .transition()
        .duration(200)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 1 / 3);
    })
    .on("mouseout", function (d, u) {
      d3.selectAll(".radar")
        .transition()
        .duration(200)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", radarFillOpacity);
    });

  if (showLegend && G.length > 1) {
    const key = swatch(color);
    d3.select(svg)
      .append("g")
      .attr("transform", `translate(${marginLeft},${marginTop})`)
      .node()
      .appendChild(key);
  }

  return svg;
}
```

```js echo
const formatTick = d3.format(".2s")
```

```js echo
function generateAccessor(accessor) {
  return function (obj) {
    if (typeof accessor === "function") return accessor(obj);
    return obj[accessor];
  };
}
```

```js echo
function getCoordinatesForAngle(angle, r = 1, offset = 1) {
  return [Math.cos(angle) * r * offset, Math.sin(angle) * r * offset];
}
```
