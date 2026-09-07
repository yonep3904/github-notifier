import { createBotIdentity } from "@/constants/bot";
import type { NotificationReceiver } from "@/services/pipeline";
import type { ManualNotificationPayload } from "@/types/external/manual";
import type { Notification } from "@/types/internal/notification";

export interface ManualNotificationProducerConfig {
  allowed: boolean;
}

export class ManualNotificationProducer {
  /**
   * Initialize the ManualNotificationProducer.
   * @param config The manual handler configuration.
   * @param receiver The NotificationReceiver to which the produced notifications will be sent.
   */
  constructor(
    private readonly config: ManualNotificationProducerConfig,
    private readonly receiver: NotificationReceiver,
  ) {}

  /**
   * Produce a manual notification and send it to the receiver.
   * @param payload The payload of the manual notification.
   * @param origin The origin of the request that produced the notification.
   */
  async produce(payload: ManualNotificationPayload, origin: string): Promise<boolean> {
    if (!this.config.allowed) {
      return false;
    }

    const notification: Notification = {
      source: "manual",
      identity: createBotIdentity(origin),
      content: payload,
    };

    return this.receiver.notify(notification);
  }
}
