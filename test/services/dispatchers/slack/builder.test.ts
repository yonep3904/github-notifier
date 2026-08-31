import {
  createGithubNotification,
  createManualNotification,
  createSystemNotification,
} from "test/helpers/factories/notification";
import { NotificationBuildError } from "@/errors/notification";
import { SlackNotificationBuilder } from "@/services/dispatchers/slack/builder";

describe("SlackNotificationBuilder", () => {
  const builder = new SlackNotificationBuilder();

  it("builds a manual notification as plain text", () => {
    expect(builder.build(createManualNotification())).toEqual({
      text: "Manual Title\nManual message",
    });
  });

  it("builds a GitHub notification with fallback text and Block Kit fields", () => {
    const payload = builder.build(createGithubNotification());

    expect(payload.text).toBe("Push to main\nabc1234: initial commit");
    expect(payload.attachments?.[0]?.color).toBe("#1F883D");
    expect(payload.attachments?.[0]?.blocks).toEqual([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "<https://github.com/acme/repo/compare/base...head|Push to main>\nabc1234: initial commit",
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: "*Action*\npush" },
          {
            type: "mrkdwn",
            text: "*Repository*\nacme/repo\nhttps://github.com/acme/repo",
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "<https://github.com/octocat|octocat> · push / push · 2026-04-04T10:00:00.000Z",
          },
        ],
      },
    ]);
  });

  it("applies Slack Block Kit limits and escapes mrkdwn control characters", () => {
    const payload = builder.build(
      createGithubNotification({
        content: {
          ...createGithubNotification().content,
          title: "<unsafe> & title",
          description: "d".repeat(4000),
          fields: Array.from({ length: 12 }, (_, index) => ({
            name: `field-${index}`,
            value: "v".repeat(2200),
          })),
        },
      }),
    );
    const blocks = payload.attachments?.[0]?.blocks;
    const main = blocks?.[0]?.type === "section" ? blocks[0].text?.text : undefined;
    const fields = blocks?.[1]?.type === "section" ? blocks[1].fields : undefined;

    expect(main).toContain("&lt;unsafe&gt; &amp; title");
    expect(main).toHaveLength(3000);
    expect(fields).toHaveLength(10);
    expect(fields?.[0]?.text).toHaveLength(2000);
  });

  it("builds a colored system notification", () => {
    const payload = builder.build(createSystemNotification());
    expect(payload.text).toBe("[WARNING] System Warning\nSystem message");
    expect(payload.attachments?.[0]).toMatchObject({
      color: "#FFAA00",
      blocks: [
        { type: "header", text: { type: "plain_text", text: "[WARNING] System Warning" } },
        { type: "section", text: { type: "mrkdwn", text: "System message" } },
      ],
    });
  });

  it("rejects an invalid attachment color", () => {
    expect(() =>
      builder.build(
        createSystemNotification({
          content: { ...createSystemNotification().content, color: "red" as "#FF0000" },
        }),
      ),
    ).toThrow(NotificationBuildError);
  });
});
