import { createTestEnv } from "test/helpers/env";
import app from "@/app/main";

describe("/docs", () => {
  it.each([
    [
      "/docs",
      "en",
      "Overview",
      "Environment variables and Config",
      "More than 70 event types are available",
    ],
    [
      "/docs/ja",
      "ja",
      "概要",
      "環境変数による設定とConfigによる設定",
      "イベントタイプは70種類以上あります",
    ],
    [
      "/docs/en",
      "en",
      "Overview",
      "Environment variables and Config",
      "More than 70 event types are available",
    ],
  ])("renders %s in %s", async (path, locale, heading, configText, handlerText) => {
    const response = await app.fetch(new Request(`https://example.com${path}`), createTestEnv());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(`<html lang="${locale}">`);
    expect(html).toContain(`>${heading}</h2>`);
    expect(html).toContain('href="/docs/ja"');
    expect(html).toContain('href="/docs/en"');
    expect(html).toContain(configText);
    expect(html).toContain(handlerText);
    expect(html.toLowerCase()).not.toContain("wiki");

    const deploymentIndex = html.indexOf('id="deployment"');
    const githubIndex = html.indexOf('id="github-webhook"');
    const manualIndex = html.indexOf('id="manual-notification"');
    const configIndex = html.indexOf('id="configuration"');

    expect(deploymentIndex).toBeGreaterThan(-1);
    expect(deploymentIndex).toBeLessThan(githubIndex);
    expect(githubIndex).toBeLessThan(manualIndex);
    expect(manualIndex).toBeLessThan(configIndex);
  });
});
