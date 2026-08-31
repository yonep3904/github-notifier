import { createTestEnv } from "test/helpers/env";
import { createBaseConfig } from "test/helpers/factories/config";
import { createMockQueue } from "test/helpers/mocks/queue";
import { createNotifyServices } from "@/compositions/conditional/notify";
import { resolveConfig } from "@/config";

describe("createNotifyServices", () => {
  it("connects every enabled Discord channel to notification fan-out", async () => {
    const config = createBaseConfig();
    config.dispatch.channels = [
      {
        type: "discord",
        id: "discord-github",
        webhookUrl: "https://discord.example/github",
        allowedSources: ["github"],
        enabled: true,
      },
      {
        type: "discord",
        id: "discord-manual",
        webhookUrl: "https://discord.example/manual",
        allowedSources: ["manual"],
        enabled: true,
      },
      {
        type: "discord",
        id: "discord-disabled",
        webhookUrl: "https://discord.example/disabled",
        allowedSources: ["manual"],
        enabled: false,
      },
    ];
    const resolution = resolveConfig(config);
    if (resolution.status !== "valid") throw new Error("expected valid config");
    const queue = createMockQueue();
    const services = createNotifyServices(
      resolution.runtimeConfig,
      createTestEnv({ NOTIFICATION_QUEUE: queue }),
    );

    await services.manualProducer.produce({
      type: "standard",
      title: null,
      message: "test",
    });

    expect(queue.sendBatch).toHaveBeenCalledWith([
      {
        body: expect.objectContaining({
          channelId: "discord-manual",
          reenqueueCount: 0,
        }),
      },
    ]);
  });

  it("connects an enabled Slack channel to notification fan-out", async () => {
    const config = createBaseConfig();
    config.dispatch.channels = [
      {
        type: "slack",
        id: "slack-manual",
        webhookUrl: "https://hooks.slack.test/services/test",
        allowedSources: ["manual"],
        enabled: true,
      },
    ];
    const resolution = resolveConfig(config);
    if (resolution.status !== "valid") throw new Error("expected valid config");
    const queue = createMockQueue();
    const services = createNotifyServices(
      resolution.runtimeConfig,
      createTestEnv({ NOTIFICATION_QUEUE: queue }),
    );

    await services.manualProducer.produce({ type: "standard", title: null, message: "test" });

    expect(queue.sendBatch).toHaveBeenCalledWith([
      { body: expect.objectContaining({ channelId: "slack-manual", reenqueueCount: 0 }) },
    ]);
  });
});
