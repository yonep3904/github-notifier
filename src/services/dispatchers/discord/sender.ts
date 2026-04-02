import {
  NonRetryableNotificationDispatchError,
  NotificationDispatchError,
  RateLimitNotificationDispatchError,
  RetryableNotificationDispatchError,
} from "@/errors/notification";
import type { DiscordNotificationPayload } from "@/types/external/discord";
import type { NotificationSender } from "@/types/internal/dispatcher";
import { createConfig, type DefaultConfig } from "@/utils/create-config";
import { getErrorStack, isAbortError } from "@/utils/error";
import { getRetryAfterMs } from "@/utils/response";

export interface DiscordNotificationSenderConfig {
  id: string;
  webhookUrl: string;
  timeout?: number;
  defaultRetryAfterMs?: number;
}

export class DiscordNotificationSender implements NotificationSender<DiscordNotificationPayload> {
  private static readonly DEFAULTS: DefaultConfig<DiscordNotificationSenderConfig> = {
    timeout: 5000,
    defaultRetryAfterMs: 3000,
  };
  static readonly SERVICE_NAME = "discord";

  private readonly config: Required<DiscordNotificationSenderConfig>;

  /**
   * Initializes a new instance of the DiscordNotificationSender with the provided configuration.
   * @param config The configuration for the DiscordNotificationSender, including:
   * - id: A unique identifier for this sender instance (used for logging and diagnostics)
   * - webhookUrl: The Discord webhook URL to which notifications will be sent
   * - timeout: Optional timeout in milliseconds for the webhook request (default: 5000ms)
   * - defaultRetryAfterMs: Optional default retry-after duration in milliseconds for rate limit errors when the response does not specify one (default: 3000ms)
   */
  constructor(config: DiscordNotificationSenderConfig) {
    this.config = createConfig(config, DiscordNotificationSender.DEFAULTS);
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
  async send(payload: DiscordNotificationPayload): Promise<void> {
    // timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      console.debug(`Sending Discord webhook: dispatcher=${this.config.id}`);

      // fetch API call
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // status code handling
      switch (response.status) {
        case 200:
        case 204:
          console.debug("Discord webhook success");
          return;

        case 400:
          throw new NonRetryableNotificationDispatchError(
            "Discord webhook bad request",
            DiscordNotificationSender.SERVICE_NAME,
          );

        case 401:
        case 403:
          throw new NonRetryableNotificationDispatchError(
            "Discord webhook authentication failed",
            DiscordNotificationSender.SERVICE_NAME,
          );

        case 404:
          throw new NonRetryableNotificationDispatchError(
            "Discord webhook not found",
            DiscordNotificationSender.SERVICE_NAME,
          );

        case 429:
          // 429 Too Many Requests - rate limited
          throw new RateLimitNotificationDispatchError(
            "Discord rate limit exceeded",
            DiscordNotificationSender.SERVICE_NAME,
            getRetryAfterMs(response, "sec") ?? this.config.defaultRetryAfterMs,
          );

        default:
          if (response.status >= 500) {
            throw new RetryableNotificationDispatchError(
              `Discord server error ${response.status}`,
              DiscordNotificationSender.SERVICE_NAME,
            );
          }

          throw new NonRetryableNotificationDispatchError(
            `Unexpected status ${response.status}`,
            DiscordNotificationSender.SERVICE_NAME,
          );
      }
    } catch (err: unknown) {
      if (err instanceof NotificationDispatchError) {
        console.error("Discord dispatch error", getErrorStack(err));
        throw err;
      }

      if (isAbortError(err)) {
        console.warn("Discord webhook request timed out");
        throw new RetryableNotificationDispatchError(
          `timed out after ${this.config.timeout}ms`,
          DiscordNotificationSender.SERVICE_NAME,
          err,
        );
      }

      if (err instanceof Error) {
        console.error("Unexpected error", getErrorStack(err));
        throw new RetryableNotificationDispatchError(
          err.message,
          DiscordNotificationSender.SERVICE_NAME,
          err,
        );
      }

      console.error("Non-error thrown", err);
      throw new RetryableNotificationDispatchError(
        "Unknown error",
        DiscordNotificationSender.SERVICE_NAME,
        err,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
