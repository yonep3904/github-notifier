import type { Notification } from "@/types/internal/notification";

export interface NotificationSender<TPayload> {
  send(payload: TPayload): Promise<void>;
}

export interface NotificationBuilder<TPayload> {
  build(notification: Notification): TPayload;
}

export interface NotificationDispatcher {
  dispatch(notification: Notification): Promise<void>;
}
