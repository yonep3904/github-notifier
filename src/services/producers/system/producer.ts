import { createBotIdentity } from "@/constants/bot";
import type { NotificationReceiver } from "@/services/pipeline";
import type { Notification, SystemNotificationType } from "@/types/internal/notification";
import type { RGB } from "@/types/utility/scalars";

export type SystemNotificationContent = {
  title: string;
  message: string;
  type: SystemNotificationType;
};

export class SystemNotificationProducer {
  private static readonly colorMap: Record<SystemNotificationType, RGB> = {
    info: "#3498db",
    warning: "#f1c40f",
    error: "#e74c3c",
  };

  /**
   * Initialize the SystemNotificationProducer with a NotificationReceiver.
   * @param receiver The NotificationReceiver to which the produced notifications will be sent.
   */
  constructor(private readonly receiver: NotificationReceiver) {}

  /**
   * Produce a system notification and send it to the receiver.
   * @param title The title of the notification.
   * @param message The message of the notification.
   * @param type The type of the notification, which determines its color.
   * @param origin The origin associated with the system notification.
   * @returns A promise that resolves when the notification has been sent.
   */
  async produce(content: SystemNotificationContent, origin: string): Promise<boolean> {
    const notification: Notification = {
      source: "system",
      identity: createBotIdentity(origin),
      content: {
        type: content.type,
        title: content.title,
        message: content.message,
        color: SystemNotificationProducer.colorMap[content.type],
      },
    };

    return this.receiver.notify(notification);
  }
}
