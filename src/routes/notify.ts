import { Hono } from "hono";
import type { NotifyController } from "@/controllers";
import { githubWebhookValidator, jsonBodyMiddleware, zodValidator } from "@/middleware";
import { manualNotifyRequestSchema } from "@/schemas/notify";
import type { AppEnv } from "@/types/env";

export function createNotifyRoutes(controller: NotifyController) {
  const router = new Hono<AppEnv>();

  router.post(
    "/",
    jsonBodyMiddleware,
    zodValidator("manualNotify", manualNotifyRequestSchema),
    (c) => controller.manual(c),
  );

  router.post(
    "/manual",
    jsonBodyMiddleware,
    zodValidator("manualNotify", manualNotifyRequestSchema),
    (c) => controller.manual(c),
  );

  router.post("/github", jsonBodyMiddleware, githubWebhookValidator, (c) => controller.github(c));

  return router;
}
