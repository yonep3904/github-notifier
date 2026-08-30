import { Hono } from "hono";
import { ServiceUnavailableError } from "@/errors/service";
import type { AppEnv } from "@/types/env";

export function createUnavailableNotifyRoutes() {
  const router = new Hono<AppEnv>();

  router.all("*", () => {
    throw new ServiceUnavailableError("Invalid configuration. Please check /status for details.");
  });

  return router;
}
