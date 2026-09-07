import type { NotificationJob } from "@/types/internal/pipeline";

export interface QueueHandler {
  handle(batch: MessageBatch<NotificationJob>): Promise<void>;
}
