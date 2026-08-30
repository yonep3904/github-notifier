import { resolveConfig } from "@/config";
import { checkConfig, createCheckReport, isSecretMetadata } from "../../scripts/config-check";
import { createBaseConfig } from "../helpers/factories/config";

describe("config-check", () => {
  it("accepts the metadata shape returned by wrangler secret list", () => {
    expect(
      isSecretMetadata([
        { name: "DISCORD_WEBHOOK_URL_1", type: "secret_text" },
        { name: "GITHUB_WEBHOOK_SECRET", type: "secret_text" },
      ]),
    ).toBe(true);
  });

  it.each([
    ["non-array output", { name: "DISCORD_WEBHOOK_URL_1", type: "secret_text" }],
    ["missing name", [{ type: "secret_text" }]],
    ["missing type", [{ name: "DISCORD_WEBHOOK_URL_1" }]],
  ])("rejects %s from wrangler secret list", (_name, metadata) => {
    expect(isSecretMetadata(metadata)).toBe(false);
  });

  it("returns a successful stdout report when the relevant secrets exist", () => {
    const output = checkConfig(
      {
        DISCORD_WEBHOOK_URL_1: "__CONFIG_CHECK_SECRET_PRESENT__",
        GITHUB_WEBHOOK_SECRET: "__CONFIG_CHECK_SECRET_PRESENT__",
        MANUAL_NOTIFICATION_PASSWORD: "__CONFIG_CHECK_SECRET_PRESENT__",
      },
      false,
    );

    expect(output).toMatchObject({ exitCode: 0, stderr: "" });
    expect(output.stdout).toContain("Config is valid");
    expect(output.stdout).toContain("No configuration issues found. Ready to deploy.");
  });

  it("returns an invalid stderr report when a notification destination is absent", () => {
    const output = checkConfig({}, false);

    expect(output).toMatchObject({ exitCode: 1, stdout: "" });
    expect(output.stderr).toContain("Config is invalid");
    expect(output.stderr).toContain("dispatch.channels");
  });

  it("renders issue details without colors when requested", () => {
    const config = createBaseConfig();
    config.handlers.github.secret = undefined;

    const report = createCheckReport(resolveConfig(config), false);

    expect(report).toContain("0 errors, 1 warning");
    expect(report).toContain("handlers.github.secret");
    expect(report).toContain("Set GITHUB_WEBHOOK_SECRET");
    expect(report).not.toContain("\u001b[");
  });
});
