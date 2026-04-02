import type { Notification } from "./notification";

export type NotificationJob = {
  id: string;
  notification: Notification;
  reenqueueCount: number;
};
