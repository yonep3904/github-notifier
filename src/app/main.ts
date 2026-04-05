import { Hono } from "hono";
import { NotifyController } from "@/controllers";
import { errorHandler } from "@/middleware";
import { createNotifyRoutes } from "@/routes";
import type { AppEnv, Env } from "@/types/env";
import type { NotificationJob } from "@/types/internal/pipeline";
import { DependenciesStore } from "./dependencies-store";

export function createApp(env: Env) {
  const dependencies = DependenciesStore.get(env);

  const notifyController = new NotifyController(dependencies);
  const notifyRoutes = createNotifyRoutes(notifyController);

  const app = new Hono<AppEnv>();

  app.onError(errorHandler);
  app.route("/notify", notifyRoutes);

  return app;
}

export default {
  fetch(req: Request, env: Env) {
    return createApp(env).fetch(req, env);
  },

  async queue(batch: MessageBatch<NotificationJob>, env: Env) {
    const dependencies = DependenciesStore.get(env);

    if (dependencies.status === "invalid") {
      batch.ackAll(); // Invalid configuration, so we acknowledge the batch to prevent retries.
      return;
    }

    const consumer = dependencies.consumer;

    const jobs = batch.messages.map((m) => m.body);
    await consumer.handleBatch(jobs);
  },
};
