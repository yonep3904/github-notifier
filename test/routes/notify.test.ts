import { createTestEnv } from "test/helpers/env";
import { createMockQueue } from "test/helpers/mocks/queue";
import app from "@/app/main";
import type { ManualNotificationPayload } from "@/types/external/manual";

const manualHeaders = {
  "Content-Type": "application/json",
  Authorization: "Bearer testpassword",
};

async function githubHeaders(body: string, event?: string): Promise<Record<string, string>> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("testsecret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    "Content-Type": "application/json",
    "X-Hub-Signature-256": `sha256=${hex}`,
    ...(event === undefined ? {} : { "X-GitHub-Event": event }),
  };
}

describe("/notify/manual", () => {
  it("returns 200 when the request body is valid JSON", async () => {
    const mockQueue = createMockQueue();

    const reqBody: ManualNotificationPayload = {
      type: "standard",
      title: "Test Notification",
      message: "Test message",
    };

    const response = await app.fetch(
      new Request("https://example.com/notify/manual", {
        method: "POST",
        headers: manualHeaders,
        body: JSON.stringify(reqBody),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, queued: true });

    expect(mockQueue.sendBatch).toHaveBeenCalled();
  });

  it("returns 400 when the request body is invalid JSON", async () => {
    const mockQueue = createMockQueue();

    const response = await app.fetch(
      new Request("https://example.com/notify/manual", {
        method: "POST",
        headers: manualHeaders,
        body: "invalid json",
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "Invalid JSON" });

    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing in the request body", async () => {
    const mockQueue = createMockQueue();

    const reqBody: Partial<ManualNotificationPayload> = {
      type: "standard",
      title: "Test Notification",
    }; // missing "message" field

    const response = await app.fetch(
      new Request("https://example.com/notify/manual", {
        method: "POST",
        headers: manualHeaders,
        body: JSON.stringify(reqBody),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false });

    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });
});

describe("/notify", () => {
  it("queues a manual notification as an alias for /notify/manual", async () => {
    const mockQueue = createMockQueue();
    const response = await app.fetch(
      new Request("https://example.com/notify", {
        method: "POST",
        headers: manualHeaders,
        body: JSON.stringify({ message: "Notification through alias" }),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, queued: true });
    expect(mockQueue.sendBatch).toHaveBeenCalled();
  });
});

describe("/notify/github", () => {
  it("returns 400 when the request body is invalid JSON", async () => {
    const mockQueue = createMockQueue();
    const requestBody = "invalid json";

    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: await githubHeaders(requestBody),
        body: requestBody,
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "Invalid JSON" });

    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });

  it("returns 400 when required headers are missing", async () => {
    const mockQueue = createMockQueue();
    const requestBody = JSON.stringify({});

    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: await githubHeaders(requestBody), // missing "X-GitHub-Event" header
        body: requestBody,
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "`X-GitHub-Event` header is required" });

    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });

  it("returns 200 when the X-GitHub-Event is unsupported", async () => {
    const mockQueue = createMockQueue();
    const requestBody = JSON.stringify({});

    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: await githubHeaders(requestBody, "__not_supported_event__"),
        body: requestBody,
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, queued: false, ignored: true });

    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });

  it("returns 401 when the signature is missing", async () => {
    const mockQueue = createMockQueue();
    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Event": "push",
        },
        body: JSON.stringify({}),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "unauthorized" });
    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });

  it("returns 401 when the signature does not match the request body", async () => {
    const mockQueue = createMockQueue();
    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: await githubHeaders(JSON.stringify({ signed: true }), "push"),
        body: JSON.stringify({ signed: false }),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "unauthorized" });
    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });
});

describe("manual notification authentication", () => {
  it.each([undefined, "Bearer wrong-password"])(
    "returns 401 for authorization %s",
    async (authorization) => {
      const mockQueue = createMockQueue();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authorization !== undefined) headers.Authorization = authorization;

      const response = await app.fetch(
        new Request("https://example.com/notify/manual", {
          method: "POST",
          headers,
          body: JSON.stringify({ message: "must not be queued" }),
        }),
        createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
      );

      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
      expect(await response.json()).toEqual({ ok: false, error: "unauthorized" });
      expect(mockQueue.sendBatch).not.toHaveBeenCalled();
    },
  );

  it("accepts a request without authorization when password is not configured", async () => {
    const mockQueue = createMockQueue();
    const response = await app.fetch(
      new Request("https://example.com/notify/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "notification without authentication" }),
      }),
      createTestEnv({
        NOTIFICATION_QUEUE: mockQueue,
        MANUAL_NOTIFICATION_PASSWORD: undefined,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, queued: true });
    expect(mockQueue.sendBatch).toHaveBeenCalled();
  });
});

describe("GitHub notification authentication", () => {
  it("accepts a request without a signature when secret is not configured", async () => {
    const mockQueue = createMockQueue();
    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Event": "__not_supported_event__",
        },
        body: JSON.stringify({}),
      }),
      createTestEnv({
        NOTIFICATION_QUEUE: mockQueue,
        GITHUB_WEBHOOK_SECRET: undefined,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, queued: false, ignored: true });
    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });
});

describe("notification availability", () => {
  it("returns 503 before authentication when Config is invalid", async () => {
    const mockQueue = createMockQueue();
    const response = await app.fetch(
      new Request("https://example.com/notify/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "must not be queued" }),
      }),
      createTestEnv({
        NOTIFICATION_QUEUE: mockQueue,
        DISCORD_WEBHOOK_URL_1: undefined,
        DISCORD_WEBHOOK_URL_2: undefined,
        DISCORD_WEBHOOK_URL_3: undefined,
        DISCORD_WEBHOOK_URL_4: undefined,
        DISCORD_WEBHOOK_URL_5: undefined,
        SLACK_WEBHOOK_URL_1: undefined,
        SLACK_WEBHOOK_URL_2: undefined,
        SLACK_WEBHOOK_URL_3: undefined,
        SLACK_WEBHOOK_URL_4: undefined,
        SLACK_WEBHOOK_URL_5: undefined,
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: "service_unavailable",
    });
    expect(mockQueue.sendBatch).not.toHaveBeenCalled();
  });
});
