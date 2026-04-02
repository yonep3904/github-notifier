import type { GithubWebhookEventName } from "@/types/external/github";
import type { ISO8601, RGB } from "@/types/utility/scalars";

export type FieldItem = {
  name: string;
  value: string;
  inline?: boolean;
};

export type GithubNotificationContent = {
  type: GithubWebhookEventName;
  action: string;

  title: string;
  description?: string;
  url?: string;
  actor?: {
    login?: string;
    url?: string;
    avatarUrl?: string;
  };
  timestamp: ISO8601;

  color: RGB;
  fields: FieldItem[];
};
