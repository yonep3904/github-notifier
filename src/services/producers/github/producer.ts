import type { NotificationReceiver } from "@/services/pipeline";
import type { GithubWebhookEvent, GithubWebhookEventName } from "@/types/external/github";
import type { Notification } from "@/types/internal/notification";
import type { GithubWebhookParser } from "./parser";

export class GithubNotificationProducer {
  /**
   * Initialize the GithubNotificationProducer with a NotificationReceiver.
   * @param receiver The NotificationReceiver to which the produced notifications will be sent.
   */
  constructor(
    private readonly receiver: NotificationReceiver,
    private readonly parser: GithubWebhookParser,
  ) {}

  /**
   * Produce a GitHub notification and send it to the receiver.
   * @param payload The payload of the GitHub notification.
   */
  async produce<K extends GithubWebhookEventName>(eventType: K, payload: unknown): Promise<void> {
    const now = new Date().toISOString();

    const event = {
      type: eventType,
      payload,
      timestamp: now,
    } as GithubWebhookEvent;

    const content = this.parser.parse(event);
    if (!content) {
      return;
    }

    const notification: Notification = {
      source: "github",
      content,
    };

    await this.receiver.notify(notification);
  }
}
