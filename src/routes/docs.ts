import { Hono } from "hono";
import type { DocsController } from "@/controllers";
import type { AppEnv } from "@/types/env";

export function createDocsRoutes(controller: DocsController) {
  const router = new Hono<AppEnv>();

  router.get("/", (c) => controller.root(c, "en"));
  router.get("/ja", (c) => controller.root(c, "ja"));
  router.get("/en", (c) => controller.root(c, "en"));

  return router;
}
