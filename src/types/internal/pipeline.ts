import type { Notification } from "./notification";

export type NotificationJob = {
  id: string;
  channelId: string;
  notification: Notification;
  reenqueueCount: number;
};
