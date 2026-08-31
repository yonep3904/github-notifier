import type { RuntimeConfig } from "@/config";
import {
  createDiscordNotificationDispatcher,
  createSlackNotificationDispatcher,
} from "@/services/dispatchers";
import { NotificationConsumer, NotificationReceiver } from "@/services/pipeline";
import {
  GithubNotificationProducer,
  GithubWebhookParser,
  ManualNotificationProducer,
  SystemNotificationProducer,
} from "@/services/producers";
import type { Env } from "@/types/env";

export interface NotifyServices {
  systemProducer: SystemNotificationProducer;
  manualProducer: ManualNotificationProducer;
  githubProducer: GithubNotificationProducer;
  githubParser: GithubWebhookParser;
  consumer: NotificationConsumer;
}

export function createNotifyServices(config: RuntimeConfig, env: Env): NotifyServices {
  const githubParser = new GithubWebhookParser(config.contents);
  const channels = config.dispatch.channels.filter((channel) => channel.enabled);
  const receiver = new NotificationReceiver(env.NOTIFICATION_QUEUE, channels);

  const dispatchers = channels.map((ch) => {
    switch (ch.type) {
      case "discord":
        return createDiscordNotificationDispatcher({
          id: ch.id,
          webhookUrl: ch.webhookUrl,
          timeout: config.dispatch.timeout,
          defaultRetryAfterMs: config.dispatch.defaultRetryAfterMs,
        });
      case "slack":
        return createSlackNotificationDispatcher({
          id: ch.id,
          webhookUrl: ch.webhookUrl,
          timeout: config.dispatch.timeout,
          defaultRetryAfterMs: config.dispatch.defaultRetryAfterMs,
        });
      default:
        throw new Error("Unsupported channel type");
    }
  });

  const consumer = new NotificationConsumer(
    {
      reenqueueLimit: config.dispatch.reenqueueLimit,
    },
    dispatchers,
    env.NOTIFICATION_QUEUE,
  );

  const systemProducer = new SystemNotificationProducer(receiver);
  const manualProducer = new ManualNotificationProducer(receiver);
  const githubProducer = new GithubNotificationProducer(receiver, githubParser);

  return {
    systemProducer,
    manualProducer,
    githubProducer,
    githubParser,
    consumer,
  };
}
