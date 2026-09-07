import { createBotIdentity } from "@/constants/bot";
import type { SupportedGithubEventName } from "@/constants/github-events";
import type { NotificationReceiver } from "@/services/pipeline";
import type { GithubWebhookEvent } from "@/types/external/github";
import type { Notification } from "@/types/internal/notification";
import type { GithubWebhookParser } from "./parser";

export interface GithubNotificationProducerConfig {
  allowed: boolean;
  handleEventTypes: SupportedGithubEventName[];
}

export class GithubNotificationProducer {
  /**
   * Initialize the GithubNotificationProducer.
   * @param config The GitHub handler configuration.
   * @param receiver The NotificationReceiver to which the produced notifications will be sent.
   * @param parser The parser used to convert GitHub webhook events into notification content.
   */
  constructor(
    private readonly config: GithubNotificationProducerConfig,
    private readonly receiver: NotificationReceiver,
    private readonly parser: GithubWebhookParser,
  ) {}

  /**
   * Produce a GitHub notification and send it to the receiver.
   * @param payload The payload of the GitHub notification.
   * @param origin The origin of the request that produced the notification.
   */
  async produce(eventType: string, payload: unknown, origin: string): Promise<boolean> {
    if (!this.config.allowed || !this.config.handleEventTypes.some((type) => type === eventType)) {
      return false;
    }

    const now = new Date().toISOString();

    const event = {
      type: eventType,
      payload,
      timestamp: now,
    } as GithubWebhookEvent;

    const content = this.parser.parse(event);
    if (!content) {
      return false;
    }

    const notification: Notification = {
      source: "github",
      identity: createBotIdentity(origin),
      content,
    };

    return this.receiver.notify(notification);
  }
}
