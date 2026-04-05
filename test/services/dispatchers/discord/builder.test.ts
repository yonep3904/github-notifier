import {
  createGithubNotification,
  createManualNotification,
  createSystemNotification,
} from "test//helpers/factories/notification";
import { NotificationBuildError } from "@/errors/notification";
import { DiscordNotificationBuilder } from "@/services/dispatchers/discord/builder";

describe("manual builder", () => {
  it("builds a manual notification with a title into plain content", () => {
    const builder = new DiscordNotificationBuilder();

    const payload = builder.build(createManualNotification());

    expect(payload).toEqual({
      content: "# Manual Title\nManual message",
    });
  });
});

describe("github builder", () => {
  it("builds a github notification into a discord embed", () => {
    const builder = new DiscordNotificationBuilder();

    const payload = builder.build(createGithubNotification());

    expect(payload.embeds).toHaveLength(1);
    expect(payload.embeds?.[0]).toMatchObject({
      title: "Push to main",
      description: "abc1234: initial commit",
      url: "https://github.com/acme/repo/compare/base...head",
      color: 0x1f883d,
      footer: {
        text: "push / push",
      },
      author: {
        name: "octocat",
        url: "https://github.com/octocat",
        icon_url: "https://avatars.githubusercontent.com/u/1",
      },
    });
  });

  it("truncates content, embed text, and fields to discord limits", () => {
    const builder = new DiscordNotificationBuilder();

    const payload = builder.build(
      createGithubNotification({
        content: {
          ...createGithubNotification().content,
          title: "t".repeat(300),
          description: "d".repeat(5000),
          fields: Array.from({ length: 30 }, (_, index) => ({
            name: `field-${index}-${"n".repeat(260)}`,
            value: `value-${index}-${"v".repeat(1100)}`,
            inline: true,
          })),
        },
      }),
    );
    const embed = payload.embeds?.[0];

    expect(embed?.title).toHaveLength(256);
    expect(embed?.description).toHaveLength(4096);
    expect(embed?.fields).toHaveLength(25);
    expect(embed?.fields?.[0]?.name).toHaveLength(256);
    expect(embed?.fields?.[0]?.value).toHaveLength(1024);
  });
});

describe("system builder", () => {
  it("builds a system notification into an embed with severity prefix", () => {
    const builder = new DiscordNotificationBuilder();

    const payload = builder.build(createSystemNotification());

    expect(payload.embeds?.[0]).toMatchObject({
      title: "[WARNING] System Warning",
      description: "System message",
      color: 0xffaa00,
    });
  });
});

describe("error handling", () => {
  it("throws when a color is invalid(not a hex code)", () => {
    const builder = new DiscordNotificationBuilder();

    expect(() =>
      builder.build(
        createSystemNotification({
          content: {
            ...createSystemNotification().content,
            color: "red" as "#FF0000", // Invalid color type
          },
        }),
      ),
    ).toThrow(NotificationBuildError);
  });

  it("throws when a color is invalid(incorrect format)", () => {
    const builder = new DiscordNotificationBuilder();
    expect(() =>
      builder.build(
        createSystemNotification({
          content: {
            ...createSystemNotification().content,
            color: "FF0000" as "#FF0000", // Invalid color type
          },
        }),
      ),
    ).toThrow(NotificationBuildError);
  });
});
