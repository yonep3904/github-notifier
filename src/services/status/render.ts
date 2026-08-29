import type { StatusRootPage } from "@/views";
import type { StatusPageModelBuilder } from "./status-page-model-builder";

export class StatusRenderer {
  constructor(
    private readonly modelBuilder: StatusPageModelBuilder,
    private readonly rootPage: typeof StatusRootPage,
  ) {}

  renderRootPage(baseUrl: string) {
    return this.rootPage({ model: this.modelBuilder.createPageModel(baseUrl) });
  }
}
