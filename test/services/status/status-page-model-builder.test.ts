import { validateConfig } from "@/config";
import { StatusPageModelBuilder } from "@/services/status";
import { createBaseConfig } from "../../helpers/factories/config";

describe("StatusPageModelBuilder", () => {
  it("creates a complete page model without exposing secrets", () => {
    const config = createBaseConfig();
    config.handlers.github.secret = "github-sensitive-value";
    config.handlers.manual.password = "manual-sensitive-value";
    const validation = validateConfig(config);
    const model = new StatusPageModelBuilder(validation).createPageModel(
      "https://notifier.example",
    );

    expect(model.hero.headline).toContain("valid");
    expect(model.metrics).toHaveLength(4);
    expect(model.githubHandler).toMatchObject({
      endpoint: "https://notifier.example/notify/github",
      enabled: true,
      secretSet: true,
      status: "success",
    });
    expect(model.manualHandler.endpoint).toBe("https://notifier.example/notify");
    expect(model.channels[0]?.webhook).not.toContain("discord.example/webhook");
    expect(JSON.stringify(model)).not.toContain("github-sensitive-value");
    expect(JSON.stringify(model)).not.toContain("manual-sensitive-value");
  });

  it("does not cache page models", () => {
    const modelBuilder = new StatusPageModelBuilder(validateConfig(createBaseConfig()));
    expect(modelBuilder.createPageModel("https://notifier.example")).not.toBe(
      modelBuilder.createPageModel("https://notifier.example"),
    );
  });

  it("represents warnings without treating their section as an error", () => {
    const config = createBaseConfig();
    config.dispatch.channels.push({
      type: "slack",
      id: "disabled-slack",
      enabled: false,
      webhookUrl: "https://hooks.slack.example/test",
    });
    const model = new StatusPageModelBuilder(validateConfig(config)).createPageModel(
      "https://notifier.example",
    );

    expect(model.channels[1]).toMatchObject({ status: "warning", enabled: false });
    expect(model.hero.headline).toContain("valid");
  });

  it("keeps issue indexes aligned when ValidConfig filters an earlier channel", () => {
    const config = createBaseConfig();
    config.dispatch.channels = [
      { type: "discord", id: "removed", enabled: false },
      {
        type: "discord",
        id: "warning-target",
        enabled: false,
        webhookUrl: "https://discord.example/warning-target",
      },
      {
        type: "discord",
        id: "active",
        enabled: true,
        webhookUrl: "https://discord.example/active",
      },
    ];

    const validation = validateConfig(config);
    expect(validation.status).toBe("valid");
    if (validation.status !== "valid") throw new Error("expected valid config");
    expect(validation.validConfig.dispatch.channels.map(({ id }) => id)).toEqual([
      "warning-target",
      "active",
    ]);

    const model = new StatusPageModelBuilder(validation).createPageModel(
      "https://notifier.example",
    );

    expect(model.channels.map(({ id }) => id)).toEqual(["removed", "warning-target", "active"]);
    expect(model.channels[1]).toMatchObject({
      id: "warning-target",
      status: "warning",
      issues: [expect.objectContaining({ path: "dispatch.channels.1.enabled" })],
    });
    expect(model.channels[0]?.issues).toEqual([]);
  });

  it("still creates display data when the config shape is invalid at runtime", () => {
    const config = createBaseConfig();
    const malformedConfig = { ...config, handlers: undefined } as unknown as typeof config;
    const model = new StatusPageModelBuilder(validateConfig(malformedConfig)).createPageModel(
      "https://notifier.example",
    );

    expect(model.hero.headline).toContain("errors");
    expect(model.metrics).toHaveLength(4);
    expect(model.githubHandler.enabled).toBe(false);
    expect(model.channels).toEqual([]);
  });
});
