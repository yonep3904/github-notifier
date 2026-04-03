import { Hono } from "hono";
import { NotifyController } from "@/controllers";
import { createNotifyRoutes } from "@/routes";
import type { Env } from "@/types/env";
import type { NotificationJob } from "@/types/internal/pipeline";
import { DependenciesStore } from "./dependencies-store";

let app: Hono | null = null;

export default {
  fetch(req: Request, env: Env) {
    if (!app) {
      const dependencies = DependenciesStore.get(env);

      const notifyController = new NotifyController(dependencies);
      const notifyRoutes = createNotifyRoutes(notifyController);

      app = new Hono();
      app.route("/notify", notifyRoutes);
    }

    return app.fetch(req, env);
  },

  async queue(batch: MessageBatch<NotificationJob>, env: Env) {
    const dependencies = DependenciesStore.get(env);

    const consumer = dependencies.consumer;

    const jobs = batch.messages.map((m) => m.body);
    await consumer.handleBatch(jobs);
  },
};
