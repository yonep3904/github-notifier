import type { Context } from "hono";
import { NotifyController } from "@/controllers/notify";
import type { AppEnv } from "@/types/env";

function createContext(values: Record<string, unknown>) {
  return {
    get: vi.fn((key: string) => values[key]),
    json: vi.fn((body: unknown) => body),
  } as unknown as Context<AppEnv>;
}

describe("NotifyController queue result", () => {
  it("reports queued=false when a manual notification has no destination", async () => {
    const manualProducer = { produce: vi.fn().mockResolvedValue(false) };
    const controller = new NotifyController({
      manualProducer,
      githubProducer: { produce: vi.fn() },
      githubParser: { isSupportedEvent: vi.fn() },
    } as never);
    const context = createContext({
      manualNotify: { title: undefined, message: "not routed" },
    });

    const response = await controller.manual(context);

    expect(response).toEqual({ ok: true, queued: false });
    expect(manualProducer.produce).toHaveBeenCalledOnce();
  });

  it("reports queued=false when a supported GitHub event has no destination", async () => {
    const githubProducer = { produce: vi.fn().mockResolvedValue(false) };
    const controller = new NotifyController({
      manualProducer: { produce: vi.fn() },
      githubProducer,
      githubParser: { isSupportedEvent: vi.fn().mockReturnValue(true) },
    } as never);
    const context = createContext({ githubWebhookEvent: "push", json: {} });

    const response = await controller.github(context);

    expect(response).toEqual({ ok: true, queued: false });
    expect(githubProducer.produce).toHaveBeenCalledOnce();
  });
});
