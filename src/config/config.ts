import type { EnvVariables } from "@/types/env";
import { full } from "./templates/github-events";
import type { Config } from "./types";

export const createConfig = (env: EnvVariables): Config => {
  return {
    dispatch: {
      channels: [
        {
          type: "discord",
          id: "discord-1",
          webhookUrl: env.DISCORD_WEBHOOK_URL_1,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.DISCORD_WEBHOOK_URL_1,
        },
        {
          type: "discord",
          id: "discord-2",
          webhookUrl: env.DISCORD_WEBHOOK_URL_2,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.DISCORD_WEBHOOK_URL_2,
        },
        {
          type: "discord",
          id: "discord-3",
          webhookUrl: env.DISCORD_WEBHOOK_URL_3,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.DISCORD_WEBHOOK_URL_3,
        },
        {
          type: "discord",
          id: "discord-4",
          webhookUrl: env.DISCORD_WEBHOOK_URL_4,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.DISCORD_WEBHOOK_URL_4,
        },
        {
          type: "discord",
          id: "discord-5",
          webhookUrl: env.DISCORD_WEBHOOK_URL_5,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.DISCORD_WEBHOOK_URL_5,
        },
        {
          type: "slack",
          id: "slack-1",
          webhookUrl: env.SLACK_WEBHOOK_URL_1,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.SLACK_WEBHOOK_URL_1,
        },
        {
          type: "slack",
          id: "slack-2",
          webhookUrl: env.SLACK_WEBHOOK_URL_2,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.SLACK_WEBHOOK_URL_2,
        },
        {
          type: "slack",
          id: "slack-3",
          webhookUrl: env.SLACK_WEBHOOK_URL_3,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.SLACK_WEBHOOK_URL_3,
        },
        {
          type: "slack",
          id: "slack-4",
          webhookUrl: env.SLACK_WEBHOOK_URL_4,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.SLACK_WEBHOOK_URL_4,
        },
        {
          type: "slack",
          id: "slack-5",
          webhookUrl: env.SLACK_WEBHOOK_URL_5,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.SLACK_WEBHOOK_URL_5,
        },
      ],
      timeout: 5000,
      defaultRetryAfterMs: 60000,
      reenqueueLimit: 3,
    },
    handlers: {
      github: {
        allowed: true,
        secret: env.GITHUB_WEBHOOK_SECRET,
        handleEventTypes: [...full],
      },
      manual: {
        allowed: true,
        password: env.MANUAL_NOTIFICATION_PASSWORD,
      },
    },
    contents: {
      maxCommitLines: 15,
      maxWorkflowJobLines: 10,
    },
  };
};
