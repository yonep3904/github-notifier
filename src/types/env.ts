import type { NotificationJob } from "@/types/internal/pipeline";

export type NotificationQueue = Queue<NotificationJob>;

/** Secret bindings that are not included in Wrangler's generated bindings. */
export type Secrets = {
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

type StringBindingKey = {
  [Key in keyof CloudflareBindings]: CloudflareBindings[Key] extends string ? Key : never;
}[keyof CloudflareBindings];

/** Environment values that may be referenced while building the application configuration. */
export type ConfigEnvironment = Partial<Pick<CloudflareBindings, StringBindingKey>> & Secrets;

export type Env = CloudflareBindings & {
  // Queue
  NOTIFICATION_QUEUE: NotificationQueue;
} & ConfigEnvironment;

export type AppEnv = {
  Bindings: Env;
};
