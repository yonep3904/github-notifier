import { resolveConfig } from "@/config";
import { configCheck, createCheckReport } from "../../scripts/lib/config";
import { createBaseConfig } from "../helpers/factories/config";

describe("config-check", () => {
  it("returns a successful stdout report when the relevant secrets exist", () => {
    const result = configCheck(
      {
        DISCORD_WEBHOOK_URL_1: "__CONFIG_CHECK_SECRET_PRESENT__",
        GITHUB_WEBHOOK_SECRET: "__CONFIG_CHECK_SECRET_PRESENT__",
        MANUAL_NOTIFICATION_PASSWORD: "__CONFIG_CHECK_SECRET_PRESENT__",
      },
      false,
    );

    expect(result).toMatchObject({ status: "valid", report: expect.any(String) });
    expect(result.report).toContain("Config is valid");
    expect(result.report).toContain("No configuration issues found. Ready to deploy.");
  });

  it("returns an invalid stderr report when a notification destination is absent", () => {
    const result = configCheck({}, false);

    expect(result).toMatchObject({ status: "invalid", report: expect.any(String) });
    expect(result.report).toContain("Config is invalid");
    expect(result.report).toContain("dispatch.channels");
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
