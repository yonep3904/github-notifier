import {
  NonRetryableNotificationDispatchError,
  NotificationDispatchError,
  RateLimitNotificationDispatchError,
  RetryableNotificationDispatchError,
} from "@/errors/notification";
import type { SlackNotificationPayload } from "@/types/external/slack";
import type { NotificationSender } from "@/types/internal/dispatcher";
import { createConfig, type DefaultConfig } from "@/utils/create-config";
import { getErrorStack, isAbortError } from "@/utils/error";
import { getRetryAfterMs } from "@/utils/response";

export interface SlackNotificationSenderConfig {
  id: string;
  webhookUrl: string;
  timeout?: number;
  defaultRetryAfterMs?: number;
}

export class SlackNotificationSender implements NotificationSender<SlackNotificationPayload> {
  private static readonly DEFAULTS: DefaultConfig<SlackNotificationSenderConfig> = {
    timeout: 5000,
    defaultRetryAfterMs: 3000,
  };
  static readonly SERVICE_NAME = "slack";

  private readonly config: Required<SlackNotificationSenderConfig>;

  constructor(config: SlackNotificationSenderConfig) {
    this.config = createConfig(config, SlackNotificationSender.DEFAULTS);
  }

  async send(payload: SlackNotificationPayload): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      console.debug(`Sending Slack webhook: dispatcher=${this.config.id}`);

      // fetch API call
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      switch (response.status) {
        case 200:
          console.debug("Slack webhook success");
          return;

        case 400:
        case 401:
        case 403:
        case 404:
        case 410:
          throw new NonRetryableNotificationDispatchError(
            `Slack webhook rejected request (${response.status})`,
            SlackNotificationSender.SERVICE_NAME,
          );

        case 429:
          throw new RateLimitNotificationDispatchError(
            "Slack rate limit exceeded",
            SlackNotificationSender.SERVICE_NAME,
            getRetryAfterMs(response, "sec") ?? this.config.defaultRetryAfterMs,
          );

        default:
          if (response.status >= 500) {
            throw new RetryableNotificationDispatchError(
              `Slack server error ${response.status}`,
              SlackNotificationSender.SERVICE_NAME,
            );
          }

          throw new NonRetryableNotificationDispatchError(
            `Unexpected status ${response.status}`,
            SlackNotificationSender.SERVICE_NAME,
          );
      }
    } catch (err: unknown) {
      if (err instanceof NotificationDispatchError) {
        console.error("Slack dispatch error", getErrorStack(err));
        throw err;
      }

      if (isAbortError(err)) {
        console.warn("Slack webhook request timed out");
        throw new RetryableNotificationDispatchError(
          `timed out after ${this.config.timeout}ms`,
          SlackNotificationSender.SERVICE_NAME,
          err,
        );
      }

      if (err instanceof Error) {
        console.error("Unexpected error", getErrorStack(err));
        throw new RetryableNotificationDispatchError(
          err.message,
          SlackNotificationSender.SERVICE_NAME,
          err,
        );
      }

      console.error("Non-error thrown", err);
      throw new RetryableNotificationDispatchError(
        "Unknown error",
        SlackNotificationSender.SERVICE_NAME,
        err,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
