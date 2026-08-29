import type { StatusRootPage } from "@/views";
import type { StatusManager } from "./status-manager";

export class StatusRenderer {
  constructor(
    private readonly manager: StatusManager,
    private readonly rootPage: typeof StatusRootPage,
  ) {}

  renderRootPage(baseUrl: string) {
    return this.rootPage({ model: this.manager.createPageModel(baseUrl) });
  }
}
