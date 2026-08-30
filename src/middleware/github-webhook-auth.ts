import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "@/types/env";

const encoder = new TextEncoder();

export type GithubWebhookAuthPolicy = { mode: "none" } | { mode: "hmac-sha256"; secret: string };

function unauthorized(c: Context<AppEnv>) {
  return c.json({ ok: false, error: "unauthorized" }, 401);
}

function decodeSignature(signature: string): Uint8Array | null {
  if (!/^sha256=[0-9a-f]{64}$/i.test(signature)) {
    return null;
  }

  const bytes = new Uint8Array(32);
  const hex = signature.slice("sha256=".length);

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

export function createGithubWebhookAuth(
  policy: GithubWebhookAuthPolicy,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (policy.mode === "none") {
      await next();
      return;
    }

    // 1. Check if the X-Hub-Signature-256 header is present
    const signature = c.req.header("X-Hub-Signature-256");
    if (signature === undefined) {
      return unauthorized(c);
    }

    // 2. Check if the signature is valid and decode it
    const signatureBytes = decodeSignature(signature);
    if (signatureBytes === null) {
      return unauthorized(c);
    }

    // 3. Verify the signature using HMAC with SHA-256
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(policy.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const body = await c.req.raw.clone().arrayBuffer();
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, body);
    if (!valid) {
      return unauthorized(c);
    }

    await next();
  };
}
