import type { Context } from "hono";

export function getUrl(c: Context): string {
  return new URL(c.req.url).toString();
}

export function getBaseUrl(c: Context): string {
  return new URL(c.req.url).origin;
}
