import { createTestEnv } from "test/helpers/env";
import app from "@/app/main";
import { METADATA } from "@/constants/metadata";

describe("/", () => {
  it("renders the application landing page", async () => {
    const response = await app.fetch(new Request("https://example.com/"), createTestEnv());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("GitHub Notifier");
    expect(html).toContain('href="/docs"');
    expect(html).toContain('href="/status"');
    expect(html).toContain(`href="${METADATA.repLink}"`);
    expect(html).toContain("Powered by Cloudflare Workers and Hono");
  });
});
