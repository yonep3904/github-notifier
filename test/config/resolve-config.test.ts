import { resolveConfig } from "@/config";
import { createBaseConfig } from "../helpers/factories/config";

describe("resolveConfig", () => {
  it("returns a valid config and removes channels without webhook URLs", () => {
    const config = createBaseConfig();
    config.dispatch.channels.push({ type: "slack", id: "disabled-slack", enabled: false });

    const result = resolveConfig(config);

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid config");
    expect(result.runtimeConfig.dispatch.channels.map(({ id }) => id)).toEqual(["discord-main"]);
    expect(result.issues).toEqual([]);
  });

  it("applies the allowedSources default to RuntimeConfig", () => {
    const config = createBaseConfig();
    config.dispatch.channels[0] = {
      type: "discord",
      id: "discord-main",
      webhookUrl: "https://discord.example/webhook",
      enabled: true,
    };

    const result = resolveConfig(config);

    expect(result.status).toBe("valid");
    if (result.status !== "valid") throw new Error("expected valid config");
    expect(result.runtimeConfig.dispatch.channels[0]?.allowedSources).toEqual([
      "github",
      "manual",
      "system",
    ]);
  });

  it.each([
    [
      "enabled channel without webhook",
      (config: ReturnType<typeof createBaseConfig>) => {
        config.dispatch.channels[0] = { type: "discord", id: "discord-main", enabled: true };
      },
      "dispatch.channels.0.webhookUrl",
    ],
    [
      "no enabled channel",
      (config: ReturnType<typeof createBaseConfig>) => {
        config.dispatch.channels[0] = { type: "discord", id: "discord-main", enabled: false };
      },
      "dispatch.channels",
    ],
    [
      "empty allowed sources",
      (config: ReturnType<typeof createBaseConfig>) => {
        const channel = config.dispatch.channels[0];
        if (channel) config.dispatch.channels[0] = { ...channel, allowedSources: [] };
      },
      "dispatch.channels.0.allowedSources",
    ],
    [
      "no enabled handler",
      (config: ReturnType<typeof createBaseConfig>) => {
        config.handlers.github.allowed = false;
        config.handlers.manual.allowed = false;
      },
      "handlers",
    ],
    [
      "no GitHub event types",
      (config: ReturnType<typeof createBaseConfig>) => {
        config.handlers.github.handleEventTypes = [];
      },
      "handlers.github.handleEventTypes",
    ],
  ])("returns an error issue for %s", (_name, mutate, expectedPath) => {
    const config = createBaseConfig();
    mutate(config);
    const result = resolveConfig(config);
    expect(result.status).toBe("invalid");
    expect(result.issues).toContainEqual(
      expect.objectContaining({ severity: "error", path: expectedPath }),
    );
  });

  it.each([
    [
      "GitHub secret",
      (config: ReturnType<typeof createBaseConfig>) => {
        config.handlers.github.secret = undefined;
      },
      "handlers.github.secret",
    ],
    [
      "manual password",
      (config: ReturnType<typeof createBaseConfig>) => {
        config.handlers.manual.password = undefined;
      },
      "handlers.manual.password",
    ],
  ])("keeps Config valid and returns a warning when %s is missing", (_name, mutate, path) => {
    const config = createBaseConfig();
    mutate(config);

    const result = resolveConfig(config);

    expect(result.status).toBe("valid");
    expect(result.issues).toContainEqual(expect.objectContaining({ severity: "warning", path }));
  });

  it("keeps the status valid when only warnings exist", () => {
    const config = createBaseConfig();
    config.dispatch.channels.push({
      type: "slack",
      id: "disabled-slack",
      enabled: false,
      webhookUrl: "https://hooks.slack.example/test",
    });
    const result = resolveConfig(config);
    expect(result.status).toBe("valid");
    expect(result.issues).toContainEqual(
      expect.objectContaining({ severity: "warning", path: "dispatch.channels.1.enabled" }),
    );
  });

  it("turns schema failures into structured issues", () => {
    const config = createBaseConfig();
    config.contents.maxCommitLines = 0;
    const result = resolveConfig(config);
    expect(result).toMatchObject({
      status: "invalid",
      issues: [expect.objectContaining({ severity: "error", path: "contents.maxCommitLines" })],
    });
  });

  it("only checks the presence of environment-derived credential values", () => {
    const config = createBaseConfig();
    config.dispatch.channels[0] = {
      type: "discord",
      id: "discord-main",
      webhookUrl: "opaque-secret-value",
      enabled: true,
    };
    config.handlers.github.secret = "opaque-secret-value";
    config.handlers.manual.password = "opaque-secret-value";

    const result = resolveConfig(config);

    expect(result.status).toBe("valid");
    expect(result.issues).toEqual([]);
  });
});
