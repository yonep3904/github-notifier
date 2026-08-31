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
    const producer = new ManualNotificationProducer(createReceiver(false));
    await expect(
      producer.produce({ type: "standard", title: null, message: "message" }),
    ).resolves.toBe(false);
  });

  it("propagates the receiver result for parsed GitHub notifications", async () => {
    const parser = {
      parse: vi.fn().mockReturnValue(createGithubNotification().content),
    };
    const producer = new GithubNotificationProducer(createReceiver(false), parser as never);
    await expect(producer.produce("push", {})).resolves.toBe(false);
  });

  it("propagates the receiver result for system notifications", async () => {
    const producer = new SystemNotificationProducer(createReceiver(false));
    await expect(
      producer.produce({ title: "title", message: "message", type: "warning" }),
    ).resolves.toBe(false);
  });
});
