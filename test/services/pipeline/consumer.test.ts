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
      id: "discord-main",
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, [dispatcher], queue);

    const job = createManualNotificationJob();
    await consumer.handle(job);

    expect(dispatcher.dispatch).toHaveBeenCalledOnce();
    expect(queue.send).not.toHaveBeenCalled();
  });

  it("re-enqueues a rate-limited job using the provided retry delay", async () => {
    const dispatcher = {
      id: "discord-main",
      dispatch: vi
        .fn()
        .mockRejectedValue(new RateLimitNotificationDispatchError("rate limited", "discord", 2500)),
    } satisfies NotificationDispatcher;

    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, [dispatcher], queue);

    const job = createManualNotificationJob();
    await consumer.handle(job);

    expect(queue.send).toHaveBeenCalledWith(expect.objectContaining({ reenqueueCount: 1 }), {
      delaySeconds: 3,
    });
  });

  it("re-enqueues retryable errors with the default delay", async () => {
    const dispatcher = {
      id: "discord-main",
      dispatch: vi
        .fn()
        .mockRejectedValue(new RetryableNotificationDispatchError("network", "discord")),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, [dispatcher], queue);

    const job = createManualNotificationJob();
    await consumer.handle(job);

    expect(queue.send).toHaveBeenCalledWith(expect.objectContaining({ reenqueueCount: 1 }), {
      delaySeconds: 1,
    });
  });

  it("drops jobs that already reached the re-enqueue limit", async () => {
    const dispatcher = {
      id: "discord-main",
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({ reenqueueLimit: 2 }, [dispatcher], queue);

    const job = createManualNotificationJob({ reenqueueCount: 2 });
    await consumer.handle(job);

    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(queue.send).not.toHaveBeenCalled();
  });

  it("processes batches sequentially", async () => {
    const order: string[] = [];

    const dispatcher = {
      id: "discord-main",
      dispatch: vi.fn().mockImplementation(async (notification) => {
        order.push(notification.content.message);
      }),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, [dispatcher], queue);

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

  it("selects only the dispatcher matching the job channel ID", async () => {
    const mainDispatcher = {
      id: "discord-main",
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const teamDispatcher = {
      id: "discord-team",
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const consumer = new NotificationConsumer(
      {},
      [mainDispatcher, teamDispatcher],
      createMockQueue(),
    );
    const job = createManualNotificationJob({ channelId: "discord-team" });

    await consumer.handle(job);

    expect(mainDispatcher.dispatch).not.toHaveBeenCalled();
    expect(teamDispatcher.dispatch).toHaveBeenCalledWith(job.notification);
  });

  it("preserves the channel ID when re-enqueuing a failed job", async () => {
    const dispatcher = {
      id: "discord-team",
      dispatch: vi
        .fn()
        .mockRejectedValue(new RetryableNotificationDispatchError("network", "discord")),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, [dispatcher], queue);

    await consumer.handle(createManualNotificationJob({ channelId: "discord-team" }));

    expect(queue.send).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: "discord-team", reenqueueCount: 1 }),
      { delaySeconds: 1 },
    );
  });

  it("drops a job when its channel dispatcher no longer exists", async () => {
    const dispatcher = {
      id: "discord-main",
      dispatch: vi.fn(),
    } satisfies NotificationDispatcher;
    const queue = createMockQueue();
    const consumer = new NotificationConsumer({}, [dispatcher], queue);

    await consumer.handle(createManualNotificationJob({ channelId: "removed-channel" }));

    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(queue.send).not.toHaveBeenCalled();
  });

  it("rejects duplicate dispatcher IDs", () => {
    const dispatchers = [
      { id: "duplicate", dispatch: vi.fn() },
      { id: "duplicate", dispatch: vi.fn() },
    ] satisfies NotificationDispatcher[];

    expect(() => new NotificationConsumer({}, dispatchers, createMockQueue())).toThrow(
      "Duplicate dispatcher ID: duplicate",
    );
  });
});
