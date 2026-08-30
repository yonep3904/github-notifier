import { createTestEnv } from "test/helpers/env";
import app from "@/app/main";

describe("/docs", () => {
  it.each([
    ["/docs", "en", "Overview"],
    ["/docs/ja", "ja", "概要"],
    ["/docs/en", "en", "Overview"],
  ])("renders %s in %s", async (path, locale, heading) => {
    const response = await app.fetch(new Request(`https://example.com${path}`), createTestEnv());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(`<html lang="${locale}">`);
    expect(html).toContain(`>${heading}</h2>`);
    expect(html).toContain('href="/docs/ja"');
    expect(html).toContain('href="/docs/en"');
  });
});
