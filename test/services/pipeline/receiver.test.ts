import { createManualNotification } from "test/helpers/factories/notification";
import { createMockQueue } from "test/helpers/mocks/queue";
import { NotificationReceiver } from "@/services/pipeline/receiver";

vi.mock("@/lib/uuid", () => ({
  randomUUID: () => "test-job-id",
}));

describe("NotificationReceiver", () => {
  it("enqueues notifications as jobs with a generated id", async () => {
    const queue = createMockQueue();
    const receiver = new NotificationReceiver(queue);

    const notification = createManualNotification();
    await receiver.notify(notification);

    expect(queue.send).toHaveBeenCalledWith({
      id: "test-job-id",
      notification: notification,
      reenqueueCount: 0,
    });
  });
});
