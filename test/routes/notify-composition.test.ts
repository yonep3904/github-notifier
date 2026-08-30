import { createBaseConfig } from "test/helpers/factories/config";
import { type RuntimeConfig, resolveConfig } from "@/config";
import type { NotifyController } from "@/controllers";
import { createAvailableNotifyRoutes } from "@/routes";

function createRuntimeConfig(): RuntimeConfig {
  const resolution = resolveConfig(createBaseConfig());
  if (resolution.status !== "valid") throw new Error("expected valid config");
  return resolution.runtimeConfig;
}

function createController(): NotifyController {
  return {
    manual: vi.fn((c) => c.json({ ok: true })),
    github: vi.fn((c) => c.json({ ok: true })),
  } as unknown as NotifyController;
}

describe("available notify route composition", () => {
  it("allows manual notifications when password authentication is not configured", async () => {
    const config = createRuntimeConfig();
    config.handlers.manual.password = undefined;
    const controller = createController();
    const router = createAvailableNotifyRoutes(controller, config);

    const response = await router.request("/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });

    expect(response.status).toBe(200);
    expect(controller.manual).toHaveBeenCalledOnce();
  });

  it("allows GitHub webhooks when secret authentication is not configured", async () => {
    const config = createRuntimeConfig();
    config.handlers.github.secret = undefined;
    const controller = createController();
    const router = createAvailableNotifyRoutes(controller, config);

    const response = await router.request("/github", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "push",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(200);
    expect(controller.github).toHaveBeenCalledOnce();
  });
});
