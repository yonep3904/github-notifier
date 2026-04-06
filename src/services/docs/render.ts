import type { DocsRootPage } from "@/views";

export class DocsRender {
  constructor(private readonly RootPage: typeof DocsRootPage) {}

  renderRootPage(baseUrl: string) {
    return this.RootPage({ baseUrl });
  }
}
