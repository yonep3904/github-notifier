import type { StatusChannelModel } from "@/services/status";
import { ChannelCardList } from "@/views/components/status";

function createChannel(overrides: Partial<StatusChannelModel> = {}): StatusChannelModel {
  return {
    id: "discord-main",
    type: "discord",
    enabled: true,
    webhook: "https://discord.com/api/webhooks/********",
    sources: [],
    status: "success",
    issues: [],
    ...overrides,
  };
}

describe("ChannelCardList", () => {
  it("hides disabled channel cards behind an unchecked switch by default", async () => {
    const page = ChannelCardList({
      channels: [
        createChannel(),
        createChannel({ id: "discord-disabled", enabled: false, status: "warning" }),
      ],
    });

    const html = await page.toString();

    expect(html).toContain('type="checkbox"');
    expect(html).not.toContain("checked");
    expect(html).toContain("Show disabled channels");
    expect(html).toContain("channel-card-disabled");
    expect(html).toContain("discord-disabled");
  });

  it("omits the switch when every channel is enabled", async () => {
    const page = ChannelCardList({ channels: [createChannel()] });

    const html = await page.toString();

    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain("Show disabled channels");
  });

  it("shows an enabled-channel empty state until disabled cards are revealed", async () => {
    const page = ChannelCardList({
      channels: [createChannel({ id: "discord-disabled", enabled: false, status: "warning" })],
    });

    const html = await page.toString();

    expect(html).toContain("channel-card-list-empty");
    expect(html).toContain("No enabled channels are configured.");
  });
});
