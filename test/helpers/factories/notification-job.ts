import type { NotificationJob } from "@/types/internal/pipeline";
import {
  createGithubNotification,
  createManualNotification,
  createSystemNotification,
} from "./notification";

export function createManualNotificationJob(
  overrides: Partial<NotificationJob> = {},
): NotificationJob {
  return {
    id: "job-1",
    channelId: "discord-main",
    notification: createManualNotification(),
    reenqueueCount: 0,
    ...overrides,
  };
}

export function createGithubNotificationJob(
  overrides: Partial<NotificationJob> = {},
): NotificationJob {
  return {
    id: "job-1",
    channelId: "discord-main",
    notification: createGithubNotification(),
    reenqueueCount: 0,
    ...overrides,
  };
}

export function createSystemNotificationJob(
  overrides: Partial<NotificationJob> = {},
): NotificationJob {
  return {
    id: "job-1",
    channelId: "discord-main",
    notification: createSystemNotification(),
    reenqueueCount: 0,
    ...overrides,
  };
}
