import type { NotificationReceiver } from "@/services/pipeline";
import type { GithubWebhookEvent } from "@/types/external/github";
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
  async produce<E extends GithubWebhookEvent>(
    eventType: E["type"],
    payload: E["payload"],
  ): Promise<boolean> {
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
      content,
    };

    await this.receiver.notify(notification);
    return true;
  }
}
