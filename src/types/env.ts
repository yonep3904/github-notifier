import type { NotificationJob } from "@/types/internal/pipeline";

export type Env = CloudflareBindings & {
  NOTIFICATION_QUEUE: Queue<NotificationJob>;
};
