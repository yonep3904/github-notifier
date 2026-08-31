import type { SlackNotificationPayload } from "@/types/external/slack";
import type { NotificationDispatcher } from "@/types/internal/dispatcher";
import type { Notification } from "@/types/internal/notification";
import { SlackNotificationBuilder } from "./builder";
import { SlackNotificationSender, type SlackNotificationSenderConfig } from "./sender";

export interface SlackNotificationDispatcherConfig {
  id: string;
}

export class SlackNotificationDispatcher implements NotificationDispatcher {
  constructor(
    private readonly config: SlackNotificationDispatcherConfig,
    private readonly builder: SlackNotificationBuilder,
    private readonly sender: SlackNotificationSender,
  ) {}

  get id(): string {
    return this.config.id;
  }

  build(notification: Notification): SlackNotificationPayload {
    return this.builder.build(notification);
  }

  send(payload: SlackNotificationPayload): Promise<void> {
    return this.sender.send(payload);
  }

  dispatch(notification: Notification): Promise<void> {
    return this.send(this.build(notification));
  }
}

export interface CreateSlackNotificationDispatcherConfig
  extends SlackNotificationDispatcherConfig,
    SlackNotificationSenderConfig {}

export function createSlackNotificationDispatcher(
  config: CreateSlackNotificationDispatcherConfig,
): SlackNotificationDispatcher {
  const builder = new SlackNotificationBuilder();
  const sender = new SlackNotificationSender(config);
  return new SlackNotificationDispatcher(config, builder, sender);
}
