import { DocsRender } from "@/services/docs";
import { DocsRootPage } from "@/views/pages/docs";

export interface DocsServices {
  docsRender: DocsRender;
}

export function createDocsServices(): DocsServices {
  const render = new DocsRender(DocsRootPage);

  return {
    docsRender: render,
  };
}
