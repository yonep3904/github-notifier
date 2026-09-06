import { DocsRootPage } from "@/views";
import type { DocsPageModelBuilder } from "./docs-page-model-builder";
import type { DocsLocale } from "./types";

export class DocsRender {
  constructor(private readonly modelBuilder: DocsPageModelBuilder) {}

  renderRootPage(baseUrl: string, locale: DocsLocale) {
    return DocsRootPage({ model: this.modelBuilder.createPageModel(baseUrl, locale) });
  }
}
