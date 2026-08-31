import type { NotificationReceiver } from "@/services/pipeline";
import type { Notification, SystemNotificationType } from "@/types/internal/notification";
import type { RGB } from "@/types/utility/scalars";

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
   * @returns A promise that resolves when the notification has been sent.
   */
  async produce({
    title,
    message,
    type,
  }: {
    title: string;
    message: string;
    type: SystemNotificationType;
  }): Promise<boolean> {
    const notification: Notification = {
      source: "system",
      content: {
        type,
        title,
        message,
        color: SystemNotificationProducer.colorMap[type],
      },
    };

    return this.receiver.notify(notification);
  }
}
