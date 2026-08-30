import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "@/types/env";

const encoder = new TextEncoder();

export type ManualNotificationAuthPolicy = { mode: "none" } | { mode: "bearer"; password: string };

function unauthorized(c: Context<AppEnv>) {
  c.header("WWW-Authenticate", "Bearer");
  return c.json({ ok: false, error: "unauthorized" }, 401);
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);

  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index++) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

export function createManualNotificationAuth(
  policy: ManualNotificationAuthPolicy,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (policy.mode === "none") {
      await next();
      return;
    }

    // 1. Check if the Authorization header is present
    const authorization = c.req.header("Authorization");
    if (authorization === undefined) {
      return unauthorized(c);
    }

    // 2. Check if the Authorization header matches the expected value
    const expected = `Bearer ${policy.password}`;
    if (!constantTimeEqual(authorization, expected)) {
      return unauthorized(c);
    }

    await next();
  };
}
