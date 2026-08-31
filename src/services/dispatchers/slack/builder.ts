import { NotificationBuildError } from "@/errors/notification";
import type {
  SlackAttachment,
  SlackBlock,
  SlackNotificationPayload,
  SlackText,
} from "@/types/external/slack";
import type { NotificationBuilder } from "@/types/internal/dispatcher";
import type {
  GithubNotificationContent,
  ManualNotificationContent,
  Notification,
  SystemNotificationContent,
} from "@/types/internal/notification";
import type { RGB } from "@/types/utility/scalars";
import { truncateText } from "@/utils/text";

export class SlackNotificationBuilder implements NotificationBuilder<SlackNotificationPayload> {
  private static readonly MAX_LENGTH = {
    fallbackText: 4000,
    blocks: 50,
    header: 150,
    sectionText: 3000,
    fields: 10,
    fieldText: 2000,
  } as const;
  static readonly SERVICE_NAME = "slack";

  build(notification: Notification): SlackNotificationPayload {
    switch (notification.source) {
      case "manual":
        return this.finalizePayload(this.buildManualNotification(notification.content));
      case "github":
        return this.finalizePayload(this.buildGithubNotification(notification.content));
      case "system":
        return this.finalizePayload(this.buildSystemNotification(notification.content));
      default:
        throw new NotificationBuildError(
          "Unsupported notification source",
          SlackNotificationBuilder.SERVICE_NAME,
        );
    }
  }

  private buildManualNotification(content: ManualNotificationContent): SlackNotificationPayload {
    switch (content.type) {
      case "standard": {
        const text =
          content.title == null ? content.message : `${content.title}\n${content.message}`;
        return {
          text,
        };
      }
      default:
        throw new NotificationBuildError(
          "Unsupported manual notification type",
          SlackNotificationBuilder.SERVICE_NAME,
        );
    }
  }

  private buildGithubNotification(content: GithubNotificationContent): SlackNotificationPayload {
    const title = content.url
      ? `<${this.escapeLinkUrl(content.url)}|${this.escapeText(content.title)}>`
      : `*${this.escapeText(content.title)}*`;
    const mainText = content.description
      ? `${title}\n${this.escapeText(content.description)}`
      : title;
    const fields: SlackText[] = content.fields.map((field) => ({
      type: "mrkdwn",
      text: `*${this.escapeText(field.name)}*\n${this.escapeText(field.value)}`,
    }));
    const actor = content.actor?.url
      ? `<${this.escapeLinkUrl(content.actor.url)}|${this.escapeText(content.actor.login ?? "unknown")}>`
      : this.escapeText(content.actor?.login ?? "unknown");
    const event = `${content.type}${content.action ? ` / ${content.action}` : ""}`;

    const blocks: SlackBlock[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: mainText,
        },
      },
      ...(fields.length > 0 ? [{ type: "section" as const, fields }] : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${actor} · ${this.escapeText(event)} · ${this.escapeText(content.timestamp)}`,
          },
        ],
      },
    ];

    return this.withAttachment(
      `${content.title}${content.description ? `\n${content.description}` : ""}`,
      content.color,
      blocks,
    );
  }

  private buildSystemNotification(content: SystemNotificationContent): SlackNotificationPayload {
    const title = `[${content.type.toUpperCase()}] ${content.title}`;
    return this.withAttachment(`${title}\n${content.message}`, content.color, [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: this.escapeText(content.message),
        },
      },
    ]);
  }

  private withAttachment(text: string, color: RGB, blocks: SlackBlock[]): SlackNotificationPayload {
    this.validateColor(color);
    const attachment: SlackAttachment = {
      color,
      blocks,
    };
    return {
      text,
      attachments: [attachment],
    };
  }

  private finalizePayload(payload: SlackNotificationPayload): SlackNotificationPayload {
    return {
      ...payload,
      text: truncateText(payload.text, SlackNotificationBuilder.MAX_LENGTH.fallbackText),
      blocks: payload.blocks
        ?.slice(0, SlackNotificationBuilder.MAX_LENGTH.blocks)
        .map((block) => this.finalizeBlock(block)),
      attachments: payload.attachments?.map((attachment) => ({
        ...attachment,
        blocks: attachment.blocks
          .slice(0, SlackNotificationBuilder.MAX_LENGTH.blocks)
          .map((block) => this.finalizeBlock(block)),
      })),
    };
  }

  private finalizeBlock(block: SlackBlock): SlackBlock {
    switch (block.type) {
      case "header":
        return {
          ...block,
          text: {
            ...block.text,
            text: truncateText(block.text.text, SlackNotificationBuilder.MAX_LENGTH.header),
          },
        };
      case "section":
        return {
          ...block,
          text: block.text
            ? {
                ...block.text,
                text: truncateText(
                  block.text.text,
                  SlackNotificationBuilder.MAX_LENGTH.sectionText,
                ),
              }
            : undefined,
          fields: block.fields
            ?.slice(0, SlackNotificationBuilder.MAX_LENGTH.fields)
            .map((field) => ({
              ...field,
              text: truncateText(field.text, SlackNotificationBuilder.MAX_LENGTH.fieldText),
            })),
        };
      case "context":
        return block;
    }
  }

  private validateColor(color: RGB): void {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      throw new NotificationBuildError("Invalid color", SlackNotificationBuilder.SERVICE_NAME);
    }
  }

  /** Escape control characters interpreted by Slack mrkdwn. */
  private escapeText(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  private escapeLinkUrl(url: string): string {
    return url.replaceAll("&", "&amp;").replaceAll("<", "%3C").replaceAll(">", "%3E");
  }
}
