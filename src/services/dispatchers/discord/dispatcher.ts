import type { DiscordNotificationPayload } from "@/types/external/discord";
import type { NotificationDispatcher } from "@/types/internal/dispatcher";
import type { Notification, NotificationSource } from "@/types/internal/notification";
import { createConfig, type DefaultConfig } from "@/utils/create-config";
import { DiscordNotificationBuilder } from "./builder";
import { DiscordNotificationSender, type DiscordNotificationSenderConfig } from "./sender";

export interface DiscordNotificationDispatcherConfig {
  id: string;
  allowSources?: NotificationSource[];
}

export class DiscordNotificationDispatcher implements NotificationDispatcher {
  private static readonly DEFAULTS: DefaultConfig<DiscordNotificationDispatcherConfig> = {
    allowSources: ["manual", "github", "system"],
  };

  private readonly config: Required<DiscordNotificationDispatcherConfig>;

  /**
   * Initializes a new instance of the DiscordNotificationDispatcher with the provided configuration, builder, and sender.
   * @param config The configuration for the DiscordNotificationDispatcher, including:
   * - id: A unique identifier for this dispatcher instance (used for logging and diagnostics)
   * - allowSources: An optional array of notification sources that this dispatcher is allowed to handle. If not provided, defaults to ["manual", "github", "system"].
   * @param builder An instance of DiscordNotificationBuilder used to build DiscordNotificationPayloads from generic Notifications
   * @param sender An instance of DiscordNotificationSender used to send DiscordNotificationPayloads to the Discord webhook
   */
  constructor(
    config: DiscordNotificationDispatcherConfig,
    private readonly builder: DiscordNotificationBuilder,
    private readonly sender: DiscordNotificationSender,
  ) {
    this.config = createConfig(config, DiscordNotificationDispatcher.DEFAULTS);
  }

  /**
   * Builds a DiscordNotificationPayload from a generic Notification object.
   * It also applies truncation to ensure that the payload adheres to Discord's limits on content and embed lengths.
   * @param notification The generic Notification object to be transformed into a DiscordNotificationPayload
   * @returns A DiscordNotificationPayload object ready to be sent to the Discord webhook
   * @throws {NotificationBuildError} If the notification source or type is unsupported, or if any required fields are missing
   */
  build(notification: Notification): DiscordNotificationPayload {
    return this.builder.build(notification);
  }

  /**
   * Sends a notification payload to the configured Discord webhook URL.
   * Implements error handling for various failure scenarios, including:
   * - HTTP status code handling (e.g., 400, 401, 403, 404, 429, 5xx)
   * - Network errors and timeouts
   * - Unexpected errors
   *
   * Errors are categorized into retryable and non-retryable to inform dispatching logic.
   * @param payload The Discord notification payload to send
   * @returns A promise that resolves on successful dispatch, or rejects with a NotificationDispatchError on failure
   * @throws {NotificationDispatchError} When dispatch fails due to known error conditions
   * @throws {RetryableNotificationDispatchError} When dispatch fails due to retryable conditions (e.g., network errors, timeouts, 5xx responses)
   * @throws {NonRetryableNotificationDispatchError} When dispatch fails due to non-retryable conditions (e.g., 400, 401, 403, 404, unexpected status codes)
   * @throws {Error} For any other unexpected errors
   */
  send(payload: DiscordNotificationPayload): Promise<void> {
    return this.sender.send(payload);
  }

  /**
   * Dispatches a generic Notification by building it into a DiscordNotificationPayload and sending it to the Discord webhook.
   * If the notification source is not in the allowSources list, the dispatch will be skipped and resolved successfully without sending.
   * @param notification The generic Notification object to be dispatched
   * @returns A promise that resolves on successful dispatch, or rejects with a NotificationDispatchError on failure. If the notification source is not allowed, the promise resolves without sending.
   * @throws {NotificationDispatchError} When dispatch fails due to known error conditions during sending
   * @throws {RetryableNotificationDispatchError} When dispatch fails due to retryable conditions during sending
   * @throws {NonRetryableNotificationDispatchError} When dispatch fails due to non-retryable conditions during sending
   * @throws {Error} For any other unexpected errors during sending
   */
  dispatch(notification: Notification): Promise<void> {
    if (!this.isAllowedSource(notification)) {
      console.debug(
        `Notification source "${notification.source}" is not allowed. Skipping dispatch: dispatcher=${this.config.id}`,
      );
      return Promise.resolve();
    }
    const payload = this.build(notification);
    return this.send(payload);
  }

  private isAllowedSource(notification: Notification): boolean {
    return this.config.allowSources.includes(notification.source);
  }
}

export interface CreateDiscordNotificationDispatcherConfig
  extends DiscordNotificationDispatcherConfig,
    DiscordNotificationSenderConfig {}

/**
 * Factory function to create a DiscordNotificationDispatcher instance with the provided configuration.
 * This function initializes the necessary builder and sender instances and returns a fully configured dispatcher ready for use.
 * @param config The configuration for the DiscordNotificationDispatcher, including:
 * - id: A unique identifier for this dispatcher instance (used for logging and diagnostics)
 * - allowSources: An optional array of notification sources that this dispatcher is allowed to handle. If not provided, defaults to ["manual", "github", "system"].
 * - webhookUrl: The Discord webhook URL to which notifications will be sent
 * - timeout: Optional timeout in milliseconds for the webhook request (default: 5000ms)
 * - defaultRetryAfterMs: Optional default retry-after duration in milliseconds for rate limit errors when the response does not specify one (default: 3000ms)
 * @returns A fully configured DiscordNotificationDispatcher instance ready to dispatch notifications to the specified Discord webhook
 */
export function createDiscordNotificationDispatcher(
  config: CreateDiscordNotificationDispatcherConfig,
): DiscordNotificationDispatcher {
  const sender = new DiscordNotificationSender(config);
  const builder = new DiscordNotificationBuilder();
  return new DiscordNotificationDispatcher(config, builder, sender);
}
