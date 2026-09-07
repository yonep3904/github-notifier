import type { MiddlewareHandler } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import type { AppEnv } from "@/types/env";

export function createManualNotificationAuth(password?: string): MiddlewareHandler<AppEnv> {
  if (password === undefined) {
    return async (_c, next) => {
      await next();
    };
  }

  return bearerAuth({
    token: password,
    noAuthenticationHeader: {
      message: { ok: false, error: "unauthorized" },
    },
    invalidAuthenticationHeader: {
      message: { ok: false, error: "invalid_authorization_header" },
    },
    invalidToken: {
      message: { ok: false, error: "unauthorized" },
    },
  });
}
