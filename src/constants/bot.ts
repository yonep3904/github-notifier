import type { NotificationIdentity } from "@/types/internal/notification";

export const BOT_NAME = "GitHub Notifier";

export const BOT_ICON_PATH = "/images/icon.png";

export function createBotIdentity(origin: string): NotificationIdentity {
  return {
    name: BOT_NAME,
    iconUrl: new URL(BOT_ICON_PATH, origin).href,
  };
}
