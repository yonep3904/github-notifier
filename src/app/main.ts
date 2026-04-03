import { Hono } from "hono";
import { NotifyController } from "@/controllers";
import { createNotifyRoutes } from "@/routes";
import type { Env } from "@/types/env";
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
};
