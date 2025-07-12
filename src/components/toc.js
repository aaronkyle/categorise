//import {toc} from '@categorise/toc'

import {Generators} from "npm:@observablehq/stdlib";

export function toc(selector = "h2,h3,h4,h5,h6") {
  return Generators.observe(notify => {
    let headings = [];

    function observed() {
      const h = Array.from(document.querySelectorAll(selector));
      if (h.length !== headings.length || h.some((heading, i) => headings[i] !== heading)) {
        headings = h;
        const tocContent = document.createElement('div');
        tocContent.innerHTML = `<b>Contents</b>${generateTOC(headings)}`;
        notify(tocContent);
      }
    }

    function generateTOC(headings) {
      return `<ul>${headings.map(h => {
        const level = parseInt(h.tagName.slice(1));
        return `${'<ul>'.repeat(level - 1)}<li><a href="#${h.id}">${h.textContent}</a></li>${'</ul>'.repeat(level - 1)}`;
      }).join('')}</ul>`;
    }

    const observer = new MutationObserver(observed);
    observer.observe(document.body, {childList: true, subtree: true});
    observed();
    return () => observer.disconnect();
  });
}