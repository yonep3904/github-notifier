import type { Context } from "hono";
import type { DocsLocale, DocsRender } from "@/services/docs";
import type { AppEnv } from "@/types/env";

interface DocsControllerDependencies {
  docsRender: DocsRender;
}

export class DocsController {
  constructor(private readonly dependencies: DocsControllerDependencies) {}

  root(c: Context<AppEnv>, locale: DocsLocale) {
    const baseUrl = new URL(c.req.url).origin;
    return c.html(this.dependencies.docsRender.renderRootPage(baseUrl, locale));
  }
}
