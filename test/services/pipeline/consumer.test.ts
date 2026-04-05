import { createManualNotification } from "test/helpers/factories/notification";
import { createManualNotificationJob } from "test/helpers/factories/notification-job";
import { createMockQueue } from "test/helpers/mocks/queue";
import {
  RateLimitNotificationDispatchError,
  RetryableNotificationDispatchError,
} from "@/errors/notification";
import { NotificationConsumer } from "@/services/pipeline/consumer";
import type { NotificationDispatcher } from "@/types/internal/dispatcher";

describe("NotificationConsumer", () => {
  it("dispatches a job once on success", async () => {
    const dispatcher = {
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, dispatcher, queue);

    const job = createManualNotificationJob();
    await consumer.handle(job);

    expect(dispatcher.dispatch).toHaveBeenCalledOnce();
    expect(queue.send).not.toHaveBeenCalled();
  });

  it("re-enqueues a rate-limited job using the provided retry delay", async () => {
    const dispatcher = {
      dispatch: vi
        .fn()
        .mockRejectedValue(new RateLimitNotificationDispatchError("rate limited", "discord", 2500)),
    } satisfies NotificationDispatcher;

    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, dispatcher, queue);

    const job = createManualNotificationJob();
    await consumer.handle(job);

    expect(queue.send).toHaveBeenCalledWith(expect.objectContaining({ reenqueueCount: 1 }), {
      delaySeconds: 3,
    });
  });

  it("re-enqueues retryable errors with the default delay", async () => {
    const dispatcher = {
      dispatch: vi
        .fn()
        .mockRejectedValue(new RetryableNotificationDispatchError("network", "discord")),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, dispatcher, queue);

    const job = createManualNotificationJob();
    await consumer.handle(job);

    expect(queue.send).toHaveBeenCalledWith(expect.objectContaining({ reenqueueCount: 1 }), {
      delaySeconds: 1,
    });
  });

  it("drops jobs that already reached the re-enqueue limit", async () => {
    const dispatcher = {
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({ reenqueueLimit: 2 }, dispatcher, queue);

    const job = createManualNotificationJob({ reenqueueCount: 2 });
    await consumer.handle(job);

    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(queue.send).not.toHaveBeenCalled();
  });

  it("processes batches sequentially", async () => {
    const order: string[] = [];

    const dispatcher = {
      dispatch: vi.fn().mockImplementation(async (notification) => {
        order.push(notification.content.message);
      }),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, dispatcher, queue);

    await consumer.handleBatch([
      createManualNotificationJob({
        id: "job-1",
        notification: createManualNotification({
          content: { type: "standard", title: null, message: "first" },
        }),
      }),

      createManualNotificationJob({
        id: "job-2",
        notification: createManualNotification({
          content: { type: "standard", title: null, message: "second" },
        }),
      }),
    ]);

    expect(order).toEqual(["first", "second"]);
  });
});
