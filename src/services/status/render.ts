import { StatusRootPage } from "@/views";
import type { StatusPageModelBuilder } from "./status-page-model-builder";

export class StatusRenderer {
  constructor(private readonly modelBuilder: StatusPageModelBuilder) {}

  renderRootPage(baseUrl: string) {
    return StatusRootPage({ model: this.modelBuilder.createPageModel(baseUrl) });
  }
}
