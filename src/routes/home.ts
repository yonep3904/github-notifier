import { Hono } from "hono";
import type { AppEnv } from "@/types/env";
import { HomeRootPage } from "@/views";

export function createHomeRoutes() {
  const router = new Hono<AppEnv>();

  router.get("/", (c) => c.render(HomeRootPage()));

  return router;
}
