import type { GithubNotificationContent } from "./github";
import type { ManualNotificationContent } from "./manual";
import type { SystemNotificationContent } from "./system";

export type Notification =
  | {
      source: "github";
      content: GithubNotificationContent;
    }
  | {
      source: "manual";
      content: ManualNotificationContent;
    }
  | {
      source: "system";
      content: SystemNotificationContent;
    };

export type NotificationSource = Notification["source"];
