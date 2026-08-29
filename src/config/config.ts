import type { Env } from "@/types/env";
import { allSupportedEvents } from "./templates/github-events";
import type { Config } from "./types";

export const createConfig = (env: Env): Config => {
  return {
    dispatch: {
      channels: [
        {
          type: "discord",
          id: "discord-main",
          webhookUrl: env.DISCORD_WEBHOOK_URL_1,
          allowedSources: ["github", "manual", "system"],
          enabled: !!env.DISCORD_WEBHOOK_URL_1,
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
        handleEventTypes: [...allSupportedEvents],
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
