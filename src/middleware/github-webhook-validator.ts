import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "@/types/env";

export const githubWebhookValidator: MiddlewareHandler<AppEnv> = async (c, next) => {
  const event = c.req.header("X-GitHub-Event");

  if (!event) {
    return c.json({ ok: false, error: "`X-GitHub-Event` header is required" }, 400);
  }

  c.set("githubWebhookEvent", event);

  await next();
};
