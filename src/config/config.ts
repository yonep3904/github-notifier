import type { Config, ValidConfig } from "@/types/config";
import type { Env } from "@/types/env";
import { validateConfig } from "./validate-config";

export const createConfig = (env: Env): ValidConfig => {
  const config: Config = {
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
        handleEventTypes: undefined,
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

  return validateConfig(config);
};
