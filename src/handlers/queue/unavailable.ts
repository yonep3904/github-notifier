import type { ConfigIssue } from "@/config";
import type { NotificationJob } from "@/types/internal/pipeline";
import type { QueueHandler } from "./types";

export class UnavailableQueueHandler implements QueueHandler {
  constructor(private readonly issues: ConfigIssue[]) {}

  async handle(batch: MessageBatch<NotificationJob>): Promise<void> {
    console.error(
      `Invalid configuration: ${this.issues
        .map((issue) => `${issue.path}: ${issue.detail}`)
        .join("; ")}`,
    );
    batch.ackAll();
  }
}
