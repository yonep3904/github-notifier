import type { Dependencies } from "@/compositions";
import type { Env } from "@/types/env";
import type { NotificationJob } from "@/types/internal/pipeline";

export class QueueController {
  constructor(private readonly dependencies: Dependencies) {}

  async handleBatch(batch: MessageBatch<unknown>, _env: Env) {
    if (this.dependencies.status === "invalid") {
      console.error(`Invalid configuration: ${this.dependencies.error}`);
      batch.ackAll(); // Invalid configuration, so we acknowledge the batch to prevent retries.
      return;
    }

    const consumer = this.dependencies.consumer;

    const jobs = batch.messages.map((m) => m.body) as NotificationJob[];
    await consumer.handleBatch(jobs);
  }
}
