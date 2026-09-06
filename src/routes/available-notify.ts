import { Hono } from "hono";
import type { RuntimeConfig } from "@/config";
import type { NotifyController } from "@/controllers";
import {
  createBodyLimit,
  createGitHubWebhookAuth,
  createManualNotificationAuth,
  gitHubWebhookHeadersValidator,
  gitHubWebhookPayloadValidator,
  manualNotificationValidator,
} from "@/middleware";
import type { AppEnv } from "@/types/env";

export function createAvailableNotifyRoutes(controller: NotifyController, config: RuntimeConfig) {
  const router = new Hono<AppEnv>();

  const manualBodyLimit = createBodyLimit(64 * 1024);
  const gitHubBodyLimit = createBodyLimit(25 * 1024 * 1024);
  const manualAuth = createManualNotificationAuth(config.handlers.manual.password);
  const gitHubAuth = createGitHubWebhookAuth(config.handlers.github.secret);

  router.post("/", manualBodyLimit, manualAuth, manualNotificationValidator, (c) =>
    controller.manual(c.req.raw, c.req.valid("json")),
  );

  router.post("/manual", manualBodyLimit, manualAuth, manualNotificationValidator, (c) =>
    controller.manual(c.req.raw, c.req.valid("json")),
  );

  router.post(
    "/github",
    gitHubBodyLimit,
    gitHubAuth,
    gitHubWebhookHeadersValidator,
    gitHubWebhookPayloadValidator,
    (c) => controller.github(c.req.raw, c.req.valid("header").event, c.req.valid("json")),
  );

  return router;
}
