import { Hono } from "hono";
import { createContainer } from "@/app/container";
import { errorHandler } from "@/app/error-handler";
import {
  createAvailableNotifyRoutes,
  createDocsRoutes,
  createStatusRoutes,
  createUnavailableNotifyRoutes,
} from "@/routes";
import type { AppEnv, Env } from "@/types/env";
import type { NotificationJob } from "@/types/internal/pipeline";

export function createApp(env: Env) {
  const app = new Hono<AppEnv>();
  const container = createContainer(env);

  // /docs and /status routes are always available, regardless of the configuration status.
  app.route("/docs", createDocsRoutes(container.docsController));
  app.route("/status", createStatusRoutes(container.statusController));

  // /notify routes are conditionally available based on the configuration status.
  if (container.status === "valid") {
    app.route("/notify", createAvailableNotifyRoutes(container.notifyController, container.config));
  } else {
    app.route("/notify", createUnavailableNotifyRoutes());
  }

  app.onError(errorHandler);

  return app;
}

export default {
  fetch(req: Request, env: Env, ctx?: ExecutionContext) {
    const app = createApp(env);
    return ctx === undefined ? app.fetch(req, env) : app.fetch(req, env, ctx);
  },

  // biome-ignore lint/correctness/noUnusedFunctionParameters: args are required by the interface but not used in this implementation
  async queue(batch: MessageBatch<NotificationJob>, env: Env, ctx: ExecutionContext) {
    const container = createContainer(env);
    await container.queueHandler.handle(batch);
  },
} satisfies ExportedHandler<Env, NotificationJob>;
