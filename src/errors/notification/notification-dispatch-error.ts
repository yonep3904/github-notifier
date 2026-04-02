import { NotificationError } from "./notification-error";

export abstract class NotificationDispatchError extends NotificationError {
  constructor(
    message: string,
    public readonly service: string,
    cause?: unknown,
  ) {
    super(message, cause);
  }
}

export class RetryableNotificationDispatchError extends NotificationDispatchError {}

export class NonRetryableNotificationDispatchError extends NotificationDispatchError {}

export class RateLimitNotificationDispatchError extends RetryableNotificationDispatchError {
  constructor(
    message: string,
    service: string,
    public readonly retryAfterMs: number,
    cause?: unknown,
  ) {
    super(message, service, cause);
  }
}

export class NotificationBuildError extends NonRetryableNotificationDispatchError {}
