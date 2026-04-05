import { createTestEnv } from "test/helpers/env";
import { createMockQueue } from "test/helpers/mocks/queue";
import app from "@/app/main";
import type { ManualNotificationPayload } from "@/types/external/manual";

describe("/notify", () => {
  it("returns 200 when the request body is valid JSON", async () => {
    const mockQueue = createMockQueue();

    const reqBody: ManualNotificationPayload = {
      type: "standard",
      title: "Test Notification",
      message: "Test message",
    };

    const response = await app.fetch(
      new Request("https://example.com/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, queued: true });

    // Verify that the notification was sent to the queue
    expect(mockQueue.send).toHaveBeenCalled();
  });

  it("returns 400 when the request body is invalid JSON", async () => {
    const mockQueue = createMockQueue();

    const response = await app.fetch(
      new Request("https://example.com/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "Invalid JSON" });

    expect(mockQueue.send).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields are missing in the request body", async () => {
    const mockQueue = createMockQueue();

    const reqBody: Partial<ManualNotificationPayload> = {
      type: "standard",
      title: "Test Notification",
    }; // missing "message" field

    const response = await app.fetch(
      new Request("https://example.com/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false });

    expect(mockQueue.send).not.toHaveBeenCalled();
  });
});

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, queued: true });

    expect(mockQueue.send).toHaveBeenCalled();
  });

  it("returns 400 when the request body is invalid JSON", async () => {
    const mockQueue = createMockQueue();

    const response = await app.fetch(
      new Request("https://example.com/notify/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "Invalid JSON" });

    expect(mockQueue.send).not.toHaveBeenCalled();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false });

    expect(mockQueue.send).not.toHaveBeenCalled();
  });
});

describe("/notify/github", () => {
  it("returns 400 when the request body is invalid JSON", async () => {
    const mockQueue = createMockQueue();

    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "Invalid JSON" });

    expect(mockQueue.send).not.toHaveBeenCalled();
  });

  it("returns 400 when required headers are missing", async () => {
    const mockQueue = createMockQueue();

    const response = await app.fetch(
      new Request("https://example.com/notify/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, // missing "X-GitHub-Event" header
        body: JSON.stringify({}),
      }),
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ ok: false, error: "`X-GitHub-Event` header is required" });

    expect(mockQueue.send).not.toHaveBeenCalled();
  });

  it("returns 200 when the X-GitHub-Event is unsupported", async () => {
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
      createTestEnv({ NOTIFICATION_QUEUE: mockQueue }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, queued: false, ignored: true });

    expect(mockQueue.send).not.toHaveBeenCalled();
  });
});
