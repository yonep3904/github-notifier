import type { Env } from "@/types/env";

export function createMockQueue(): Queue<unknown> {
  return {
    send: vi.fn(async (_message: unknown) => {}),
    sendBatch: vi.fn(
      async (
        _messages: Iterable<MessageSendRequest<unknown>>,
        _options?: QueueSendBatchOptions,
      ) => {},
    ),
  };
}

const defaultTestEnv: Env = {
  // Queue
  NOTIFICATION_QUEUE: {} as Env["NOTIFICATION_QUEUE"],

  // Environment variable
  GITHUB_WEBHOOK_SECRET: "testsecret",
  MANUAL_NOTIFICATION_PASSWORD: "testpassword",
  DISCORD_WEBHOOK_URL_1: "https://discord.com/api/webhooks/testwebhook1",
  DISCORD_WEBHOOK_URL_2: "https://discord.com/api/webhooks/testwebhook2",
  DISCORD_WEBHOOK_URL_3: "https://discord.com/api/webhooks/testwebhook3",
  DISCORD_WEBHOOK_URL_4: "https://discord.com/api/webhooks/testwebhook4",
  DISCORD_WEBHOOK_URL_5: "https://discord.com/api/webhooks/testwebhook5",
  SLACK_WEBHOOK_URL_1: "https://hooks.slack.com/services/test/slack/webhook1",
  SLACK_WEBHOOK_URL_2: "https://hooks.slack.com/services/test/slack/webhook2",
  SLACK_WEBHOOK_URL_3: "https://hooks.slack.com/services/test/slack/webhook3",
  SLACK_WEBHOOK_URL_4: "https://hooks.slack.com/services/test/slack/webhook4",
  SLACK_WEBHOOK_URL_5: "https://hooks.slack.com/services/test/slack/webhook5",
};

export function createTestEnv(overrides: Partial<Env> = {}): Env {
  return {
    ...defaultTestEnv,
    ...overrides,
  };
}
