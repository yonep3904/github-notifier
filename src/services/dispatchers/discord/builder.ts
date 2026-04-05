import { NotificationBuildError } from "@/errors/notification";
import type { DiscordNotificationPayload } from "@/types/external/discord";
import type { NotificationBuilder } from "@/types/internal/dispatcher";
import type {
  GithubNotificationContent,
  ManualNotificationContent,
  Notification,
  SystemNotificationContent,
} from "@/types/internal/notification";
import type { RGB } from "@/types/utility/scalars";
import { truncateText } from "@/utils/text";

export class DiscordNotificationBuilder implements NotificationBuilder<DiscordNotificationPayload> {
  private static MAX_LENGTH = {
    content: 2000,
    embeds: 25,
    embedTitle: 256,
    embedDescription: 4096,
    embedTotal: 6000, // Not Implemented: This is the total maximum length of all embed fields combined
    fieldName: 256,
    fieldValue: 1024,
  } as const;
  static readonly SERVICE_NAME = "discord";

  /**
   * Builds a DiscordNotificationPayload from a generic Notification object.
   * It also applies truncation to ensure that the payload adheres to Discord's limits on content and embed lengths.
   * @param notification The generic Notification object to be transformed into a DiscordNotificationPayload
   * @returns A DiscordNotificationPayload object ready to be sent to the Discord webhook
   * @throws {NotificationBuildError} If the notification source or type is unsupported, or if any required fields are missing
   */
  build(notification: Notification): DiscordNotificationPayload {
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
          DiscordNotificationBuilder.SERVICE_NAME,
        );
    }
  }

  private buildManualNotification(content: ManualNotificationContent): DiscordNotificationPayload {
    switch (content.type) {
      case "standard":
        if (content.title == null) {
          return {
            content: content.message,
          };
        } else {
          return {
            content: `# ${content.title}\n${content.message}`,
          };
        }
      default:
        throw new NotificationBuildError(
          "Unsupported manual notification type",
          DiscordNotificationBuilder.SERVICE_NAME,
        );
    }
  }

  private buildGithubNotification(content: GithubNotificationContent): DiscordNotificationPayload {
    return {
      embeds: [
        {
          title: content.title,
          description: content.description,
          url: content.url,
          timestamp: content.timestamp,
          author: {
            name: content.actor?.login ?? "unknown",
            url: content.actor?.url ?? undefined,
            icon_url: content.actor?.avatarUrl ?? undefined,
          },
          footer: {
            text: `${content.type}${content.action ? ` / ${content.action}` : ""}`,
          },
          color: this.toDiscordColor(content.color),
          fields: content.fields,
        },
      ],
    };
  }

  private buildSystemNotification(content: SystemNotificationContent): DiscordNotificationPayload {
    return {
      embeds: [
        {
          title: `[${content.type.toUpperCase()}] ${content.title}`,
          description: content.message,
          color: this.toDiscordColor(content.color),
        },
      ],
    };
  }

  private finalizePayload(payload: DiscordNotificationPayload): DiscordNotificationPayload {
    const content: DiscordNotificationPayload["content"] = payload.content
      ? truncateText(payload.content, DiscordNotificationBuilder.MAX_LENGTH.content)
      : undefined;

    const embeds: DiscordNotificationPayload["embeds"] = payload.embeds
      ?.slice(0, DiscordNotificationBuilder.MAX_LENGTH.embeds)
      .map((embed) => ({
        ...embed,
        title: embed.title
          ? truncateText(embed.title, DiscordNotificationBuilder.MAX_LENGTH.embedTitle)
          : undefined,
        description: embed.description
          ? truncateText(embed.description, DiscordNotificationBuilder.MAX_LENGTH.embedDescription)
          : undefined,
        fields: embed.fields
          ?.slice(0, DiscordNotificationBuilder.MAX_LENGTH.embeds)
          .map((field) => ({
            name: truncateText(field.name, DiscordNotificationBuilder.MAX_LENGTH.fieldName),
            value: truncateText(field.value, DiscordNotificationBuilder.MAX_LENGTH.fieldValue),
          })),
      }));

    return {
      ...payload,
      content,
      embeds,
    };
  }

  private toDiscordColor(color: RGB): number {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      throw new NotificationBuildError("Invalid color", DiscordNotificationBuilder.SERVICE_NAME);
    }
    return parseInt(color.replace("#", ""), 16);
  }
}
