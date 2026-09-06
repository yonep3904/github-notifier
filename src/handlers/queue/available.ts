import type { NotificationConsumer } from "@/services/pipeline";
import type { NotificationJob } from "@/types/internal/pipeline";
import type { QueueHandler } from "./types";

export class AvailableQueueHandler implements QueueHandler {
  constructor(private readonly consumer: NotificationConsumer) {}

  async handle(batch: MessageBatch<NotificationJob>): Promise<void> {
    const jobs = batch.messages.map((message) => message.body);
    await this.consumer.handleBatch(jobs);
  }
}
