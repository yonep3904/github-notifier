import type { SupportedEventName } from "@/services/producers/github";
import type { NotificationSource } from "@/types/internal/notification";

type _Config<ChannelType> = {
  dispatch: {
    channels: ChannelType[];
    timeout?: number;
    defaultRetryAfterMs?: number;
    reenqueueLimit?: number;
  };
  handlers: {
    github: {
      allowed: boolean;
      secret?: string;
      handleEventTypes: SupportedEventName[];
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

export type Channel =
  | {
      type: "discord";
      id: string;
      webhookUrl?: string;
      allowedSources?: NotificationSource[];
      enabled: boolean;
    }
  | {
      type: "slack";
      id: string;
      webhookUrl?: string;
      allowedSources?: NotificationSource[];
      enabled: boolean;
    };

export type ValidChannel = Channel & {
  webhookUrl: string;
  allowedSources: NotificationSource[];
};

export type NormalizedChannel = Channel & {
  allowedSources: NotificationSource[];
};

export type Config = _Config<Channel>;

export type NormalizedConfig = _Config<NormalizedChannel>;

export type ValidConfig = _Config<ValidChannel>;
