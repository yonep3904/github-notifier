import type { DocsLocale, DocsRender } from "@/services/docs";

export class DocsController {
  constructor(private readonly docsRender: DocsRender) {}

  root(request: Request, locale: DocsLocale): Response {
    const baseUrl = new URL(request.url).origin;
    const page = this.docsRender.renderRootPage(baseUrl, locale);

    return new Response(page.toString(), {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }
}
