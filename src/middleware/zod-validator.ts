import type { MiddlewareHandler } from "hono";
import type { ZodSchema } from "zod";
import type { AppEnv, Variables } from "@/types/env";

export const zodValidator =
  <K extends keyof Variables>(key: K, schema: ZodSchema<Variables[K]>): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    const body = c.get("json");

    const result = schema.safeParse(body);

    if (!result.success) {
      return c.json({ ok: false }, 400);
    }

    c.set(key, result.data);
    await next();
  };
