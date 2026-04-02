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

export class DiscordNotificationBuilder implements NotificationBuilder<DiscordNotificationPayload> {
  static readonly SERVICE_NAME = "discord";

  build(notification: Notification): DiscordNotificationPayload {
    switch (notification.source) {
      case "manual":
        return this.buildManualNotification(notification.content);
      case "github":
        return this.buildGithubNotification(notification.content);
      case "system":
        return this.buildSystemNotification(notification.content);
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

  private toDiscordColor(color: RGB): number {
    if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
      throw new NotificationBuildError("Invalid color", DiscordNotificationBuilder.SERVICE_NAME);
    }
    return parseInt(color.replace("#", ""), 16);
  }
}
