// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "categori.se",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],


 pages: [
{
  name: "Notebook Ports",
  open: true,
  pages: [
    { name: "Accessing a Notebook's Runtime", path: "access-runtime" },
    { name: "aws4fetch", path: "aws4fetch" },
    { name: "Color Legend", path: "color-legend" },    { name: "Copier", path: "copier" },
    { name: "DOM view", path: "dom-view" },
    { name: "Feather Icons", path: "feather-icons" },
    { name: "CORS Proxy fetchp", path: "fetchp" },
    { name: "Draggable LocalFile fileInput", path: "fileinput" },
    { name: "Firebase Admin and Google API helpers in the browser", path: "firebase-admin" },
    { name: "Convert cell computation to a Promise with cell flowQueue", path: "flow-queue" },
    { name: "Hypertext Literal", path: "htl" },
    { name: "Indented ToC", path: "indented-toc" },
    { name: "Inputs (Refactored, Jeremy Ashkenas)", path: "inputs" },
    { name: "@observablehq/inspector@5.0.1", path: "inspector" },
    { name: "jest-expect-standalone@24.0.2", path: "jest-expect-standalone" },
    { name: "Squeezing more Juice out of UI libraries", path: "juice" },
    { name: "Lazy Download", path: "lazy-download" },
    { name: "LocalFile", path: "localfile" },
    { name: "Local Storage View: Non-invasive local persistence", path: "local-storage-view" },
    { name: "Facilities in Households, Nepal, 2011", path: "nepal-cbs-2011-census-household-facilities" },
    { name: "Radar Chart", path: "radar-chart" },
    { name: "Secure random ID", path: "randomid" },
    { name: "Hypertext literal reconciliation with nanomorph", path: "reconcile-nanomorph" },
    { name: "Resize FileAttachments on the fly with serverless-cells", path: "resize" },
    { name: "Reversible attachment", path: "reversible-attachment" },
    { name: "Runtime SDK", path: "runtime-sdk" },
    { name: "Safe Local Storage", path: "safe-local-storage" },
    { name: "Signature - A Documentation Toolkit", path: "signature" },
    { name: "RxJS inspired stream operators for views", path: "stream-operators" },
    { name: "Reactive Unit Testing and Reporting Framework", path: "testing" },
    { name: "TOC", path: "toc" },
    { name: "URL querystrings and hash parameters", path: "url-querystrings-and-hash-parameters" },
    { name: "Utils", path: "utils" },
    { name: "Composing viewofs with the view literal", path: "view" },
    { name: "Composing views across time: viewroutine", path: "viewroutine" }
  ]
}

  ],


  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
