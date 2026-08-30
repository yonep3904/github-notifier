import { Hono } from "hono";
import { DocsController, NotifyController, QueueController, StatusController } from "@/controllers";
import { errorHandler } from "@/middleware";
import {
  createAvailableNotifyRoutes,
  createDocsRoutes,
  createStatusRoutes,
  createUnavailableNotifyRoutes,
} from "@/routes";
import type { AppEnv, Env } from "@/types/env";
import type { NotificationJob } from "@/types/internal/pipeline";
import { DependenciesStore } from "./dependencies-store";

export function createApp(env: Env) {
  const app = new Hono<AppEnv>();
  const dependencies = DependenciesStore.get(env);

  // /docs and /status routes are always available, regardless of the configuration status.
  const docsController = new DocsController(dependencies);
  const docsRoutes = createDocsRoutes(docsController);
  app.route("/docs", docsRoutes);

  const statusController = new StatusController(dependencies);
  const statusRouter = createStatusRoutes(statusController);
  app.route("/status", statusRouter);

  // /notify routes are conditionally available based on the configuration status.
  if (dependencies.status === "valid") {
    const notifyController = new NotifyController(dependencies);
    const notifyRoutes = createAvailableNotifyRoutes(notifyController, dependencies.config);
    app.route("/notify", notifyRoutes);
  } else {
    const notifyRoutes = createUnavailableNotifyRoutes();
    app.route("/notify", notifyRoutes);
  }

  app.onError(errorHandler);

  return app;
}

export default {
  fetch(req: Request, env: Env) {
    return createApp(env).fetch(req, env);
  },

  async queue(batch: MessageBatch<NotificationJob>, env: Env) {
    const dependencies = DependenciesStore.get(env);

    const queue = new QueueController(dependencies);

    await queue.handleBatch(batch, env);
  },
};
