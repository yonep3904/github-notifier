import { NotifyController } from "@/controllers/notify";

describe("NotifyController queue result", () => {
  it("reports queued=false when a manual notification has no destination", async () => {
    const manualProducer = { produce: vi.fn().mockResolvedValue(false) };
    const controller = new NotifyController(
      manualProducer as never,
      { produce: vi.fn() } as never,
      { isSupportedEvent: vi.fn() } as never,
    );

    const response = await controller.manual(new Request("https://notifier.example.com/notify"), {
      title: undefined,
      message: "not routed",
    });

    await expect(response.json()).resolves.toEqual({ ok: true, queued: false });
    expect(manualProducer.produce).toHaveBeenCalledWith(
      { type: "standard", title: null, message: "not routed" },
      "https://notifier.example.com",
    );
  });

  it("reports queued=false when a supported GitHub event has no destination", async () => {
    const githubProducer = { produce: vi.fn().mockResolvedValue(false) };
    const controller = new NotifyController(
      { produce: vi.fn() } as never,
      githubProducer as never,
      { isSupportedEvent: vi.fn().mockReturnValue(true) } as never,
    );

    const response = await controller.github(
      new Request("https://notifier.example.com/notify"),
      "push",
      {},
    );

    await expect(response.json()).resolves.toEqual({ ok: true, queued: false });
    expect(githubProducer.produce).toHaveBeenCalledWith("push", {}, "https://notifier.example.com");
  });
});
