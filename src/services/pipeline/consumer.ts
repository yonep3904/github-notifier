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
  private readonly dispatchers: ReadonlyMap<string, NotificationDispatcher>;

  /**
   * Initializes a new instance of the NotificationConsumer with the provided configuration.
   * @param config The configuration for the NotificationConsumer, including:
   * - reenqueueLimit: The maximum number of times a job can be re-enqueued for retry before it is dropped (default: 5)
   * @param dispatchers NotificationDispatcher instances keyed by their channel IDs
   * @param queue The Queue instance used for re-enqueuing jobs that need to be retried
   */
  constructor(
    config: NotificationConsumerConfig,
    dispatchers: NotificationDispatcher[],
    private readonly queue: Queue<NotificationJob>,
  ) {
    this.config = createConfig(config, NotificationConsumer.DEFAULTS);

    const dispatcherMap = new Map<string, NotificationDispatcher>();
    for (const dispatcher of dispatchers) {
      if (dispatcherMap.has(dispatcher.id)) {
        throw new Error(`Duplicate dispatcher ID: ${dispatcher.id}`);
      }
      dispatcherMap.set(dispatcher.id, dispatcher);
    }

    this.dispatchers = dispatcherMap;
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

    const dispatcher = this.dispatchers.get(job.channelId);
    if (!dispatcher) {
      console.error(`Dispatcher not found: job=${job.id}, channel=${job.channelId}`);
      return;
    }

    try {
      await dispatcher.dispatch(job.notification);
      console.debug(`Success notification: job=${job.id}, channel=${job.channelId}`);
      return;
    } catch (err: unknown) {
      // Rate limit errors (429 Too Many Requests)
      if (err instanceof RateLimitNotificationDispatchError) {
        console.warn(`Rate limited: job=${job.id}, channel=${job.channelId}`);
        await this.requeueWithDelay(job, err.retryAfterMs);
        return;
      }

      // Retryable errors (5xx server errors, network errors)
      if (err instanceof RetryableNotificationDispatchError) {
        console.warn(`Retryable error: job=${job.id}, channel=${job.channelId}`);
        await this.requeueWithDelay(job, 1000);
        return;
      }

      // Non-retryable errors: Log and drop
      console.error(`Dropped: job=${job.id}, channel=${job.channelId}`, err);
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
