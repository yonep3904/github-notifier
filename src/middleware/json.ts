import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "@/types/env";

export const jsonBodyMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    const body = await c.req.json();
    c.set("json", body);
    await next();
  } catch {
    return c.json({ ok: false, error: "Invalid JSON" }, 400);
  }
};
