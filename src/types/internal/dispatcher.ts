import type { Notification } from "@/types/internal/notification";

export interface NotificationSender<TPayload> {
  send(payload: TPayload): Promise<void>;
}

export interface NotificationBuilder<TPayload> {
  build(notification: Notification): TPayload;
}

export interface NotificationDispatcher {
  readonly id: string;
  dispatch(notification: Notification): Promise<void>;
}
