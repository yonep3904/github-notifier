import {
  RateLimitNotificationDispatchError,
  RetryableNotificationDispatchError,
} from "@/errors/notification";
import type { NotificationDispatcher } from "@/types/internal/dispatcher";
import type { NotificationJob } from "@/types/internal/pipeline";
import { createConfig, type DefaultConfig } from "@/utils/create-config";

export interface NotificationConsumerConfig {
  reenqueueLimit?: number;
}

export class NotificationConsumer {
  private static readonly DEFAULTS: DefaultConfig<NotificationConsumerConfig> = {
    reenqueueLimit: 5,
  };

  private readonly config: Required<NotificationConsumerConfig>;

  /**
   * Initializes a new instance of the NotificationConsumer with the provided configuration.
   * @param config The configuration for the NotificationConsumer, including:
   * - reenqueueLimit: The maximum number of times a job can be re-enqueued for retry before it is dropped (default: 5)
   * @param dispatcher The NotificationDispatcher instance responsible for dispatching notifications
   * @param queue The Queue instance used for re-enqueuing jobs that need to be retried
   */
  constructor(
    config: NotificationConsumerConfig,
    private readonly dispatcher: NotificationDispatcher,
    private readonly queue: Queue<NotificationJob>,
  ) {
    this.config = createConfig(config, NotificationConsumer.DEFAULTS);
  }

  /**
   * Handles a single notification job with retry and rate limit handling.
   * @param job The notification job to process
   * @returns Promise that resolves when processing is complete
   */
  async handle(job: NotificationJob): Promise<void> {
    if (job.reenqueueCount >= this.config.reenqueueLimit) {
      console.error(`Reenqueue limit reached: job=${job.id}`);
      return;
    }

    try {
      await this.dispatcher.dispatch(job.notification);
      console.debug(`Success notification: job=${job.id}`);
      return;
    } catch (err: unknown) {
      // Rate limit errors (429 Too Many Requests)
      if (err instanceof RateLimitNotificationDispatchError) {
        console.warn(`Rate limited: job=${job.id}`);
        await this.requeueWithDelay(job, err.retryAfterMs);
        return;
      }

      // Retryable errors (5xx server errors, network errors)
      if (err instanceof RetryableNotificationDispatchError) {
        console.warn(`Retryable error: job=${job.id}`);
        await this.requeueWithDelay(job, 1000);
        return;
      }

      // Non-retryable errors: Log and drop
      console.error(`Dropped: job=${job.id}`, err);
    }
  }

  /**
   * Handles a batch of notification jobs sequentially to better manage rate limits and retries.
   * @param jobs The array of notification jobs to process
   */
  async handleBatch(jobs: NotificationJob[]): Promise<void> {
    // Process jobs sequentially to better handle rate limits and retries
    for (const job of jobs) {
      await this.handle(job);
    }
  }

  private async requeueWithDelay(job: NotificationJob, delayMs: number): Promise<void> {
    const delaySeconds = Math.ceil((delayMs ?? 1000) / 1000);

    const newJob: NotificationJob = {
      ...job,
      reenqueueCount: job.reenqueueCount + 1,
    };

    await this.queue.send(newJob, {
      delaySeconds,
    });
  }
}
