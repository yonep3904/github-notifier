import {
  type ConfigIssue,
  createConfig,
  type ResolveConfigResult,
  type RuntimeConfig,
  resolveConfig,
} from "@/config";
import { DocsController, NotifyController, StatusController } from "@/controllers";
import { AvailableQueueHandler, type QueueHandler, UnavailableQueueHandler } from "@/handlers";
import {
  createDiscordNotificationDispatcher,
  createSlackNotificationDispatcher,
} from "@/services/dispatchers";
import { DocsPageModelBuilder, DocsRender } from "@/services/docs";
import { NotificationConsumer, NotificationReceiver } from "@/services/pipeline";
import {
  GithubNotificationProducer,
  GithubWebhookParser,
  ManualNotificationProducer,
} from "@/services/producers";
import { StatusPageModelBuilder, StatusRenderer } from "@/services/status";
import type { Env, NotificationQueue } from "@/types/env";

export interface BaseContainer {
  statusController: StatusController;
  docsController: DocsController;
}

export function createBaseContainer(resolution: ResolveConfigResult): BaseContainer {
  const statusModelBuilder = new StatusPageModelBuilder(resolution);
  const statusRender = new StatusRenderer(statusModelBuilder);
  const statusController = new StatusController(statusRender);

  const docsModelBuilder = new DocsPageModelBuilder();
  const docsRender = new DocsRender(docsModelBuilder);
  const docsController = new DocsController(docsRender);

  return {
    statusController,
    docsController,
  };
}

export interface ValidContainer {
  notifyController: NotifyController;
  queueHandler: QueueHandler;
}

export function createValidContainer(
  config: RuntimeConfig,
  queue: NotificationQueue,
): ValidContainer {
  const githubParser = new GithubWebhookParser(config.contents);

  const channels = config.dispatch.channels.filter((channel) => channel.enabled);
  const receiver = new NotificationReceiver(queue, channels);

  const dispatchers = channels.map((channel) => {
    const dispatcherConfig = {
      id: channel.id,
      webhookUrl: channel.webhookUrl,
      timeout: config.dispatch.timeout,
      defaultRetryAfterMs: config.dispatch.defaultRetryAfterMs,
    };

    switch (channel.type) {
      case "discord":
        return createDiscordNotificationDispatcher(dispatcherConfig);
      case "slack":
        return createSlackNotificationDispatcher(dispatcherConfig);
      default:
        throw new Error("Unsupported channel type");
    }
  });

  const consumer = new NotificationConsumer(
    { reenqueueLimit: config.dispatch.reenqueueLimit },
    dispatchers,
    queue,
  );

  const manualProducer = new ManualNotificationProducer(config.handlers.manual, receiver);
  const githubProducer = new GithubNotificationProducer(
    config.handlers.github,
    receiver,
    githubParser,
  );

  const notifyController = new NotifyController(manualProducer, githubProducer);
  const queueHandler = new AvailableQueueHandler(consumer);

  return {
    notifyController,
    queueHandler,
  };
}

export interface InvalidContainer {
  queueHandler: QueueHandler;
}

export function createInvalidContainer(issues: ConfigIssue[]): InvalidContainer {
  const queueHandler = new UnavailableQueueHandler(issues);
  return {
    queueHandler,
  };
}

export type Container = BaseContainer &
  (
    | ({
        status: "valid";
        config: RuntimeConfig;
      } & ValidContainer)
    | ({
        status: "invalid";
        queueHandler: QueueHandler;
      } & InvalidContainer)
  );

export function createContainer(env: Env): Container {
  const config = createConfig(env);
  const resolution = resolveConfig(config);

  if (resolution.status === "valid") {
    return {
      status: "valid",
      config: resolution.runtimeConfig,
      ...createBaseContainer(resolution),
      ...createValidContainer(resolution.runtimeConfig, env.NOTIFICATION_QUEUE),
    };
  } else {
    return {
      status: "invalid",
      ...createBaseContainer(resolution),
      ...createInvalidContainer(resolution.issues),
    };
  }
}
