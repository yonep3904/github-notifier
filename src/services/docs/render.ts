import type { DocsRootPage } from "@/views";
import type { DocsPageModelBuilder } from "./docs-page-model-builder";
import type { DocsLocale } from "./types";

export class DocsRender {
  constructor(
    private readonly modelBuilder: DocsPageModelBuilder,
    private readonly RootPage: typeof DocsRootPage,
  ) {}

  renderRootPage(baseUrl: string, locale: DocsLocale) {
    return this.RootPage({ model: this.modelBuilder.createPageModel(baseUrl, locale) });
  }
}
