import { type Config, createConfig, resolveConfig } from "@/config";
import { createStatusReport } from "../../scripts/lib/config";

function createReport(env: Record<string, string | undefined>): {
  status: "valid" | "invalid";
  report: string;
} {
  const config = createConfig(env);
  const resolution = resolveConfig(config);
  return { status: resolution.status, report: createStatusReport(resolution, false) };
}

describe("config-status", () => {
  it("shows source values and environment variable names without exposing secrets", () => {
    const secret = "__SECRET_PRESENT__DISCORD_WEBHOOK_URL_1";
    const result = createReport({
      DISCORD_WEBHOOK_URL_1: secret,
      GITHUB_WEBHOOK_SECRET: "__SECRET_PRESENT__GITHUB_WEBHOOK_SECRET",
      MANUAL_NOTIFICATION_PASSWORD: "__SECRET_PRESENT__MANUAL_NOTIFICATION_PASSWORD",
    });

    expect(result.status).toBe("valid");
    expect(result.report).toContain("Status: ✔ valid");
    expect(result.report).toContain("Issues: 0");
    expect(result.report).toContain("Dispatch");
    expect(result.report).toMatch(/Timeout\s+5000/);
    expect(result.report).toMatch(/discord-1\s+Enabled\s+true\s+Type\s+discord/);
    expect(result.report).toContain("<environment: DISCORD_WEBHOOK_URL_1>");
    expect(result.report).toMatch(/Webhook URL\s+<unset>/);
    expect(result.report).toContain("<environment: GITHUB_WEBHOOK_SECRET>");
    expect(result.report).not.toContain(secret);
    expect(result.report).not.toContain("pnpm config-check");
  });

  it("supports an arbitrary Wrangler secret name", () => {
    const env = { CUSTOM_WEBHOOK: "__SECRET_PRESENT__CUSTOM_WEBHOOK" };
    const config = createConfig({});
    config.dispatch.channels[0].webhookUrl = env.CUSTOM_WEBHOOK;
    const report = createStatusReport(resolveConfig(config), false);

    expect(report).toContain("<environment: CUSTOM_WEBHOOK>");
    expect(report).not.toContain(env.CUSTOM_WEBHOOK);
  });

  it("summarizes issues and delegates their details to config-check", () => {
    const resolution = resolveConfig(createConfig({}));
    const result = {
      status: resolution.status,
      report: createStatusReport(resolution, false),
    };

    expect(result.status).toBe("invalid");
    expect(result.report).toContain("Status: ✖ invalid");
    expect(result.report).toContain("Issues: 3");
    expect(result.report).toContain("Run `pnpm config-check`");
    expect(result.report).not.toContain("No enabled channel can receive notifications");
  });

  it("does not emit ANSI escapes when colors are disabled", () => {
    const resolution = resolveConfig(createConfig({}));
    expect(createStatusReport(resolution, false)).not.toContain("\u001b[");
  });

  it("renders malformed input without trusting its declared Config type", () => {
    const malformed = {
      dispatch: { channels: "not-an-array" },
      handlers: undefined,
      contents: null,
    } as unknown as Config;

    const report = createStatusReport(resolveConfig(malformed), false);

    expect(report).toContain("Status: ✖ invalid");
    expect(report).toContain("[Channels]\n  <invalid>");
    expect(report).toMatch(/Timeout\s+<unset>/);
  });
});
