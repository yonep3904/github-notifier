import type { ManualNotifyRequest } from "@/schemas/notify";
import type { NotificationJob } from "@/types/internal/pipeline";

export type Env = CloudflareBindings & {
  // Queue
  NOTIFICATION_QUEUE: Queue<NotificationJob>;

  // Environment variable
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

export type Variables = {
  json: unknown;
  manualNotify: ManualNotifyRequest;
  githubWebhookEvent: string;
};

export type AppEnv = {
  Bindings: Env;
  Variables: Variables;
};
