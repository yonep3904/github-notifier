import type { SupportedEventName } from "@/services/producers/github";
import type { NotificationSource } from "@/types/internal/notification";

export type Channel =
  | {
      type: "discord";
      id: string;
      webhookUrl: string;
      allowedSources?: NotificationSource[];
      enabled: boolean;
    }
  | {
      type: "slack";
      id: string;
      webhookUrl: string;
      allowedSources?: NotificationSource[];
      enabled: boolean;
    };

export type Config = {
  dispatch: {
    channels: Channel[];
    timeout?: number;
    defaultRetryAfterMs?: number;
    reenqueueLimit?: number;
  };
  handlers: {
    github: {
      allowed: boolean;
      secret?: string;
      handleEventTypes?: SupportedEventName[];
    };
    manual: {
      allowed: boolean;
      password?: string;
    };
  };
  contents: {
    maxCommitLines: number;
    maxWorkflowJobLines: number;
  };
};
