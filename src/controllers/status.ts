import type { Context } from "hono";
import type { StatusRenderer } from "@/services/status";
import type { AppEnv } from "@/types/env";

interface StatusControllerDependencies {
  statusRender: StatusRenderer;
}

export class StatusController {
  constructor(private readonly dependencies: StatusControllerDependencies) {}

  root(c: Context<AppEnv>) {
    const baseUrl = new URL(c.req.url).origin;
    return c.html(this.dependencies.statusRender.renderRootPage(baseUrl));
  }
}
