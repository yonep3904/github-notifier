import { bodyLimit } from "hono/body-limit";

export const createBodyLimit = (maxSize: number) =>
  bodyLimit({
    maxSize,
    onError: (c) => c.json({ ok: false, error: "payload_too_large" }, 413),
  });
