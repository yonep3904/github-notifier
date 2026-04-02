import type { NotificationReceiver } from "@/services/pipeline";
import type { ManualNotificationPayload } from "@/types/external/manual";
import type { Notification } from "@/types/internal/notification";

export class ManualNotificationProducer {
  /**
   * Initialize the ManualNotificationProducer with a NotificationReceiver.
   * @param receiver The NotificationReceiver to which the produced notifications will be sent.
   */
  constructor(private readonly receiver: NotificationReceiver) {}

  /**
   * Produce a manual notification and send it to the receiver.
   * @param payload The payload of the manual notification.
   */
  async produce(payload: ManualNotificationPayload): Promise<void> {
    const notification: Notification = {
      source: "manual",
      content: payload,
    };

    await this.receiver.notify(notification);
  }
}
