import type { NotificationJob } from "@/types/internal/pipeline";

export type NotificationQueue = Queue<NotificationJob>;

export type EnvVariables = {
  GITHUB_WEBHOOK_SECRET?: string;
  MANUAL_NOTIFICATION_PASSWORD?: string;

  DISCORD_WEBHOOK_URL_1?: string;
  DISCORD_WEBHOOK_URL_2?: string;
  DISCORD_WEBHOOK_URL_3?: string;
  DISCORD_WEBHOOK_URL_4?: string;
  DISCORD_WEBHOOK_URL_5?: string;

  SLACK_WEBHOOK_URL_1?: string;
  SLACK_WEBHOOK_URL_2?: string;
  SLACK_WEBHOOK_URL_3?: string;
  SLACK_WEBHOOK_URL_4?: string;
  SLACK_WEBHOOK_URL_5?: string;
};

export type Env = CloudflareBindings & {
  // Queue
  NOTIFICATION_QUEUE: NotificationQueue;
} & EnvVariables;

export type AppEnv = {
  Bindings: Env;
};
