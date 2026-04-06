import {
  maskDiscordWebhookUrl,
  maskOtherUrl,
  maskSlackWebhookUrl,
  maskString,
  maskWebhookUrl,
} from "@/utils/mask";

describe("maskWebhookUrl", () => {
  it("masks a Discord webhook URL", () => {
    const input = "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz";

    const result = maskWebhookUrl(input);

    expect(result).toMatch(/^https:\/\/discord\.com\/api\/webhooks\/123456789012345678\/\*+wxyz$/);
  });

  it("masks a Slack webhook URL", () => {
    const input = "https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnopqrstuvwx";

    const result = maskWebhookUrl(input);

    expect(result).toMatch(
      /^https:\/\/hooks\.slack\.com\/services\/T00000000\/B00000000\/\*+uvwx$/,
    );
  });

  it("falls back to generic masking for unknown URLs", () => {
    const input = "https://example.com/some/very/secret/path";

    const result = maskWebhookUrl(input);

    expect(result).toMatch(/^https:\/\/example\.com\/some\*+path$/);
  });

  it("masks non-URL strings", () => {
    const input = "supersecret";

    const result = maskWebhookUrl(input);

    expect(result).toMatch(/^\*+cret$/);
  });
});

describe("maskDiscordWebhookUrl", () => {
  it("returns masked Discord webhook when valid", () => {
    const input = "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz";

    const result = maskDiscordWebhookUrl(input);

    expect(result).not.toBeUndefined();
    expect(result).toMatch(/\/\*+wxyz$/);
  });

  it("returns null for non-Discord URLs", () => {
    const input = "https://example.com/test";

    const result = maskDiscordWebhookUrl(input);

    expect(result).toBeUndefined();
  });
});

describe("maskSlackWebhookUrl", () => {
  it("returns masked Slack webhook when valid", () => {
    const input = "https://hooks.slack.com/services/T00000000/B00000000/abcdefghijklmnopqrstuvwx";

    const result = maskSlackWebhookUrl(input);

    expect(result).not.toBeUndefined();
    expect(result).toMatch(/\/\*+uvwx$/);
  });

  it("returns null for non-Slack URLs", () => {
    const input = "https://example.com/test";

    const result = maskSlackWebhookUrl(input);

    expect(result).toBeUndefined();
  });
});

describe("maskOtherUrl", () => {
  it("masks path of a generic URL", () => {
    const input = "https://example.com/very/secret/path";

    const result = maskOtherUrl(input);

    expect(result).toMatch(/^https:\/\/example\.com\/very\*+path$/);
  });

  it("falls back to masking entire string if not a URL", () => {
    const input = "not-a-url";

    const result = maskOtherUrl(input);

    expect(result).toMatch(/^\*+-url$/);
  });
});

describe("maskString", () => {
  it("masks middle of a string while keeping head and tail", () => {
    const result = maskString("abcdefghij", 2, 2);

    expect(result).toBe("ab******ij");
  });

  it("masks entire string when shorter than visible range", () => {
    const result = maskString("abc", 2, 2);

    expect(result).toMatch(/^\*{6}$/);
  });

  it("respects custom mask symbol", () => {
    const result = maskString("abcdefghij", 2, 2, "#");

    expect(result).toBe("ab######ij");
  });
});
