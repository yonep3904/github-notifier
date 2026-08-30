import { Hono } from "hono";
import type { RuntimeConfig } from "@/config";
import type { NotifyController } from "@/controllers";
import {
  createGithubWebhookAuth,
  createManualNotificationAuth,
  type GithubWebhookAuthPolicy,
  githubWebhookValidator,
  jsonBodyMiddleware,
  type ManualNotificationAuthPolicy,
  zodValidator,
} from "@/middleware";
import { manualNotifyRequestSchema } from "@/schemas/notify";
import type { AppEnv } from "@/types/env";

export function createAvailableNotifyRoutes(controller: NotifyController, config: RuntimeConfig) {
  const router = new Hono<AppEnv>();

  const manualPolicy = createManualPolicy(config);
  const githubPolicy = createGithubPolicy(config);

  router.post(
    "/",
    createManualNotificationAuth(manualPolicy),
    jsonBodyMiddleware,
    zodValidator("manualNotify", manualNotifyRequestSchema),
    (c) => controller.manual(c),
  );

  router.post(
    "/manual",
    createManualNotificationAuth(manualPolicy),
    jsonBodyMiddleware,
    zodValidator("manualNotify", manualNotifyRequestSchema),
    (c) => controller.manual(c),
  );

  router.post(
    "/github",
    createGithubWebhookAuth(githubPolicy),
    jsonBodyMiddleware,
    githubWebhookValidator,
    (c) => controller.github(c),
  );

  return router;
}

function createManualPolicy(config: RuntimeConfig): ManualNotificationAuthPolicy {
  if (config.handlers.manual.password === undefined) {
    return { mode: "none" };
  } else {
    return {
      mode: "bearer",
      password: config.handlers.manual.password,
    };
  }
}

function createGithubPolicy(config: RuntimeConfig): GithubWebhookAuthPolicy {
  if (config.handlers.github.secret === undefined) {
    return { mode: "none" };
  } else {
    return {
      mode: "hmac-sha256",
      secret: config.handlers.github.secret,
    };
  }
}
