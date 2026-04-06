import { Hono } from "hono";
import type { StatusController } from "@/controllers";
import type { AppEnv } from "@/types/env";

export function createStatusRoutes(controller: StatusController) {
  const router = new Hono<AppEnv>();

  router.get("/", (c) => controller.root(c));

  return router;
}
