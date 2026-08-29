import type { ValidConfig } from "@/config";
import { createDiscordNotificationDispatcher } from "@/services/dispatchers";
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

export function createNotifyServices(config: ValidConfig, env: Env): NotifyServices {
  const receiver = new NotificationReceiver(env.NOTIFICATION_QUEUE);
  const githubParser = new GithubWebhookParser(config.contents);

  const systemProducer = new SystemNotificationProducer(receiver);
  const manualProducer = new ManualNotificationProducer(receiver);
  const githubProducer = new GithubNotificationProducer(receiver, githubParser);

  const dispatchers = config.dispatch.channels
    .filter((ch) => ch.enabled)
    .map((ch) => {
      switch (ch.type) {
        case "discord":
          return createDiscordNotificationDispatcher({
            id: ch.id,
            webhookUrl: ch.webhookUrl,
            allowSources: ch.allowedSources,
            timeout: config.dispatch.timeout,
            defaultRetryAfterMs: config.dispatch.defaultRetryAfterMs,
          });
        case "slack":
          // TODO: Implement SlackNotificationDispatcher and return its instance here
          throw new Error("Slack dispatcher is not implemented yet");
        // return createSlackNotificationDispatcher({
        //   id: ch.id,
        //   webhookUrl: ch.webhookUrl,
        //   allowSources: ch.allowedSources,
        //   timeout: config.dispatch.timeout,
        //   defaultRetryAfterMs: config.dispatch.defaultRetryAfterMs,
        // });
        default:
          throw new Error("Unsupported channel type");
      }
    });

  const consumer = new NotificationConsumer(
    {
      reenqueueLimit: config.dispatch.reenqueueLimit,
    },
    // TODO: Implement proper dispatcher selection logic
    dispatchers[0],
    env.NOTIFICATION_QUEUE,
  );

  return {
    systemProducer,
    manualProducer,
    githubProducer,
    githubParser,
    consumer,
  };
}
