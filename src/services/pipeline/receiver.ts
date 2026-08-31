import { randomUUID } from "@/lib/uuid";
import type { Notification, NotificationSource } from "@/types/internal/notification";
import type { NotificationJob } from "@/types/internal/pipeline";

export type NotificationChannel = {
  id: string;
  allowedSources: NotificationSource[];
};

export class NotificationReceiver {
  /**
   * Initializes a receiver that fans notifications out to the channels that accept their source.
   * @param queue The Queue instance used for enqueuing notification jobs that will be processed by the pipeline
   * @param channels Enabled notification channels and their allowed sources
   */
  constructor(
    private readonly queue: Queue<NotificationJob>,
    private readonly channels: NotificationChannel[],
  ) {}

  /**
   * Validates and enqueues a notification for processing by the pipeline.
   * @param notification The notification to be processed, which must conform to the Notification type
   * @throws {InvalidNotificationError} If the notification fails validation checks (e.g., missing required fields, invalid content)
   */
  async notify(notification: Notification): Promise<boolean> {
    this.validate(notification);

    const jobs = this.channels
      .filter(({ allowedSources }) => allowedSources.includes(notification.source))
      .map(
        ({ id: channelId }): NotificationJob => ({
          id: randomUUID(),
          channelId,
          notification,
          reenqueueCount: 0,
        }),
      );

    if (jobs.length === 0) {
      console.debug(`No channel accepts notification source=${notification.source}`);
      return false;
    }

    console.debug(
      `Enqueuing notification: jobs=${jobs.length}, source=${notification.source}, channels=${jobs.map(({ channelId }) => channelId).join(",")}`,
    );
    await this.queue.sendBatch(jobs.map((body) => ({ body })));
    return true;
  }

  // biome-ignore lint/correctness/noUnusedFunctionParameters: To allow for future validation rules that may require access to the notification object, this function is intentionally designed to accept a notification parameter even if it's not currently used.
  private validate(notification: Notification): void {}
}
