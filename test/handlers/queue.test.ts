import { createManualNotificationJob } from "test/helpers/factories/notification-job";
import { AvailableQueueHandler, UnavailableQueueHandler } from "@/handlers";
import type { NotificationJob } from "@/types/internal/pipeline";

function createBatch(jobs: NotificationJob[]) {
  return {
    messages: jobs.map((body) => ({ body })),
    ackAll: vi.fn(),
  } as unknown as MessageBatch<NotificationJob>;
}

describe("AvailableQueueHandler", () => {
  it("passes the batch jobs to the notification consumer", async () => {
    const jobs = [createManualNotificationJob()];
    const consumer = { handleBatch: vi.fn() };
    const handler = new AvailableQueueHandler(consumer as never);

    await handler.handle(createBatch(jobs));

    expect(consumer.handleBatch).toHaveBeenCalledWith(jobs);
  });
});

describe("UnavailableQueueHandler", () => {
  it("acknowledges the batch when the configuration is invalid", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const batch = createBatch([createManualNotificationJob()]);
    const handler = new UnavailableQueueHandler([
      {
        severity: "error",
        path: "dispatch.channels",
        title: "Invalid channel",
        detail: "No destination is configured",
        fix: "Configure a destination",
      },
    ]);

    await handler.handle(batch);

    expect(batch.ackAll).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      "Invalid configuration: dispatch.channels: No destination is configured",
    );
  });
});
