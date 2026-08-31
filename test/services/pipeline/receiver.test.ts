import { createManualNotification } from "test/helpers/factories/notification";
import { createMockQueue } from "test/helpers/mocks/queue";
import { NotificationReceiver } from "@/services/pipeline/receiver";

vi.mock("@/lib/uuid", () => ({
  randomUUID: vi.fn().mockReturnValueOnce("job-1").mockReturnValueOnce("job-2"),
}));

describe("NotificationReceiver", () => {
  it("enqueues one job for each channel that accepts the notification source", async () => {
    const queue = createMockQueue();
    const receiver = new NotificationReceiver(queue, [
      { id: "discord-main", allowedSources: ["manual", "github"] },
      { id: "discord-team", allowedSources: ["manual"] },
      { id: "discord-system", allowedSources: ["system"] },
    ]);

    const notification = createManualNotification();
    const queued = await receiver.notify(notification);

    expect(queue.sendBatch).toHaveBeenCalledWith([
      {
        body: {
          id: "job-1",
          channelId: "discord-main",
          notification,
          reenqueueCount: 0,
        },
      },
      {
        body: {
          id: "job-2",
          channelId: "discord-team",
          notification,
          reenqueueCount: 0,
        },
      },
    ]);
    expect(queue.send).not.toHaveBeenCalled();
    expect(queued).toBe(true);
  });

  it("does not enqueue a job when no channel accepts the notification source", async () => {
    const queue = createMockQueue();
    const receiver = new NotificationReceiver(queue, [
      { id: "discord-system", allowedSources: ["system"] },
    ]);

    const queued = await receiver.notify(createManualNotification());

    expect(queue.sendBatch).not.toHaveBeenCalled();
    expect(queued).toBe(false);
  });
});
