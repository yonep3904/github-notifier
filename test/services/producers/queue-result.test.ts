import { createGithubNotification } from "test/helpers/factories/notification";
import type { NotificationReceiver } from "@/services/pipeline";
import { GithubNotificationProducer } from "@/services/producers/github/producer";
import { ManualNotificationProducer } from "@/services/producers/manual/producer";
import { SystemNotificationProducer } from "@/services/producers/system/producer";

function createReceiver(queued: boolean): NotificationReceiver {
  return { notify: vi.fn().mockResolvedValue(queued) } as unknown as NotificationReceiver;
}

describe("producer queue results", () => {
  it("propagates the receiver result for manual notifications", async () => {
    const receiver = createReceiver(false);
    const producer = new ManualNotificationProducer({ allowed: true }, receiver);
    await expect(
      producer.produce(
        { type: "standard", title: null, message: "message" },
        "https://notifier.example.com",
      ),
    ).resolves.toBe(false);
    expect(receiver.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: {
          name: "GitHub Notifier",
          iconUrl: "https://notifier.example.com/images/icon.png",
        },
      }),
    );
  });

  it("propagates the receiver result for parsed GitHub notifications", async () => {
    const parser = {
      parse: vi.fn().mockReturnValue(createGithubNotification().content),
    };
    const receiver = createReceiver(false);
    const producer = new GithubNotificationProducer(
      { allowed: true, handleEventTypes: ["push"] },
      receiver,
      parser as never,
    );
    await expect(producer.produce("push", {}, "https://notifier.example.com")).resolves.toBe(false);
    expect(receiver.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: {
          name: "GitHub Notifier",
          iconUrl: "https://notifier.example.com/images/icon.png",
        },
      }),
    );
  });

  it("does not queue manual notifications when the handler is not allowed", async () => {
    const receiver = createReceiver(true);
    const producer = new ManualNotificationProducer({ allowed: false }, receiver);

    await expect(
      producer.produce(
        { type: "standard", title: null, message: "message" },
        "https://notifier.example.com",
      ),
    ).resolves.toBe(false);
    expect(receiver.notify).not.toHaveBeenCalled();
  });

  it("does not parse or queue GitHub notifications when the handler is not allowed", async () => {
    const parser = { parse: vi.fn() };
    const receiver = createReceiver(true);
    const producer = new GithubNotificationProducer(
      { allowed: false, handleEventTypes: ["push"] },
      receiver,
      parser as never,
    );

    await expect(producer.produce("push", {}, "https://notifier.example.com")).resolves.toBe(false);
    expect(parser.parse).not.toHaveBeenCalled();
    expect(receiver.notify).not.toHaveBeenCalled();
  });

  it("does not parse or queue GitHub notifications for unconfigured event types", async () => {
    const parser = { parse: vi.fn() };
    const receiver = createReceiver(true);
    const producer = new GithubNotificationProducer(
      { allowed: true, handleEventTypes: ["issues"] },
      receiver,
      parser as never,
    );

    await expect(producer.produce("push", {}, "https://notifier.example.com")).resolves.toBe(false);
    expect(parser.parse).not.toHaveBeenCalled();
    expect(receiver.notify).not.toHaveBeenCalled();
  });

  it("propagates the receiver result for system notifications", async () => {
    const receiver = createReceiver(false);
    const producer = new SystemNotificationProducer(receiver);
    await expect(
      producer.produce(
        { title: "title", message: "message", type: "warning" },
        "https://notifier.example.com",
      ),
    ).resolves.toBe(false);
    expect(receiver.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: {
          name: "GitHub Notifier",
          iconUrl: "https://notifier.example.com/images/icon.png",
        },
      }),
    );
  });
});
