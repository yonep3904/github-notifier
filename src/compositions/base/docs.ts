import { DocsPageModelBuilder, DocsRender } from "@/services/docs";
import { DocsRootPage } from "@/views/pages/docs";

export interface DocsServices {
  docsRender: DocsRender;
}

export function createDocsServices(): DocsServices {
  const modelBuilder = new DocsPageModelBuilder();
  const render = new DocsRender(modelBuilder, DocsRootPage);

  return {
    docsRender: render,
  };
}
