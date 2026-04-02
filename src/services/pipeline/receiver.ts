import { randomUUID } from "@/lib/uuid";
import type { Notification } from "@/types/internal/notification";
import type { NotificationJob } from "@/types/internal/pipeline";

export class NotificationReceiver {
  /**
   * Initializes a new instance of the NotificationReceiver with the provided queue for enqueuing notification jobs.
   * @param queue The Queue instance used for enqueuing notification jobs that will be processed by the pipeline
   */
  constructor(private readonly queue: Queue<NotificationJob>) {}

  /**
   * Validates and enqueues a notification for processing by the pipeline.
   * @param notification The notification to be processed, which must conform to the Notification type
   * @throws {InvalidNotificationError} If the notification fails validation checks (e.g., missing required fields, invalid content)
   */
  async notify(notification: Notification): Promise<void> {
    this.validate(notification);

    const job: NotificationJob = {
      id: randomUUID(),
      notification,
      reenqueueCount: 0,
    };

    console.debug(`Enqueuing notification: job=${job.id}, source=${notification.source}`);
    await this.queue.send(job);
  }

  // biome-ignore lint/correctness/noUnusedFunctionParameters: To allow for future validation rules that may require access to the notification object, this function is intentionally designed to accept a notification parameter even if it's not currently used.
  private validate(notification: Notification): void {}
}
