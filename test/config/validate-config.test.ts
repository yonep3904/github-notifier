import { validateConfig } from "@/config";
import { InvalidConfigurationError } from "@/errors/config";
import { createBaseConfig } from "../helpers/factories/config";

describe("validateConfig", () => {
  it("returns a validated config and removes channels without webhookUrl", () => {
    const config = createBaseConfig();
    config.dispatch.channels.push({
      type: "slack",
      id: "disabled-slack",
      enabled: false,
    });

    const result = validateConfig(config);

    expect(result.dispatch.channels).toHaveLength(1);
    expect(result.dispatch.channels[0]?.id).toBe("discord-main");
  });

  it("throws when an enabled channel is missing webhookUrl", () => {
    const config = createBaseConfig();
    config.dispatch.channels[0] = {
      type: "discord",
      id: "discord-main",
      enabled: true,
    };

    expect(() => validateConfig(config)).toThrow(InvalidConfigurationError);
  });

  it("throws when every channel is filtered out", () => {
    const config = createBaseConfig();
    config.dispatch.channels = [
      {
        type: "discord",
        id: "disabled-no-webhook",
        enabled: false,
      },
    ];

    expect(() => validateConfig(config)).toThrow("At least one channel must be enabled");
  });

  it("throws when an enabled channel has an empty allowedSources list", () => {
    const config = createBaseConfig();
    config.dispatch.channels[0] = {
      ...config.dispatch.channels[0],
      allowedSources: [],
    };

    expect(() => validateConfig(config)).toThrow(/allowedSources is empty/);
  });

  it("throws when every handler is disabled", () => {
    const config = createBaseConfig();
    config.handlers.github.allowed = false;
    config.handlers.manual.allowed = false;

    expect(() => validateConfig(config)).toThrow("At least one handler must be enabled");
  });

  it("throws when github handler is enabled without any event types", () => {
    const config = createBaseConfig();
    config.handlers.github.handleEventTypes = [];

    expect(() => validateConfig(config)).toThrow(
      "GitHub handler is enabled but no event types are specified",
    );
  });
});
