import type { StatusRenderer } from "@/services/status";

export class StatusController {
  constructor(private readonly statusRender: StatusRenderer) {}

  root(request: Request): Response {
    const baseUrl = new URL(request.url).origin;
    const page = this.statusRender.renderRootPage(baseUrl);

    return new Response(page.toString(), {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }
}
