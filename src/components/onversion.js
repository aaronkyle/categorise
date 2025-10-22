import {html} from "npm:htl";

export const extractMetadata = (pathname) => {
  const match = /^\/thumbnail\/(\S+)@(\d+)/.exec(pathname);
  if (!match) return undefined;
  return {
    id: match[1],
    version: match[2]
  };
}

export const onVersion = async (work) => {
  const metadata = extractMetadata(html`<a href="#">`.pathname);
  if (metadata) {
    work(metadata);
  }
  return work;
}
