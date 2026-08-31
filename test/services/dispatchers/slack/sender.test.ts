import {
  NonRetryableNotificationDispatchError,
  RateLimitNotificationDispatchError,
  RetryableNotificationDispatchError,
} from "@/errors/notification";
import { SlackNotificationSender } from "@/services/dispatchers/slack/sender";

describe("SlackNotificationSender", () => {
  const sender = new SlackNotificationSender({
    id: "slack-main",
    webhookUrl: "https://hooks.slack.test/services/test",
    timeout: 100,
    defaultRetryAfterMs: 3000,
  });

  afterEach(() => vi.unstubAllGlobals());

  it("POSTs JSON and accepts Slack's HTTP 200 response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sender.send({ text: "hello" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.test/services/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ text: "hello" }),
      }),
    );
  });

  it("uses Retry-After seconds for HTTP 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("rate_limited", { status: 429, headers: { "Retry-After": "12" } }),
        ),
    );

    const error = await sender.send({ text: "hello" }).catch((caught) => caught);
    expect(error).toBeInstanceOf(RateLimitNotificationDispatchError);
    expect(error.retryAfterMs).toBe(12_000);
  });

  it.each([400, 403, 404, 410])("classifies HTTP %s as non-retryable", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status })));
    await expect(sender.send({ text: "hello" })).rejects.toBeInstanceOf(
      NonRetryableNotificationDispatchError,
    );
  });

  it("classifies server and network failures as retryable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("error", { status: 500 })));
    await expect(sender.send({ text: "hello" })).rejects.toBeInstanceOf(
      RetryableNotificationDispatchError,
    );

    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("network failed")));
    await expect(sender.send({ text: "hello" })).rejects.toBeInstanceOf(
      RetryableNotificationDispatchError,
    );
  });
});
