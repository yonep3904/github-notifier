import type { Config } from "@/types/config";

export function createBaseConfig(overrides: Partial<Config> = {}): Config {
  return {
    dispatch: {
      channels: [
        {
          type: "discord",
          id: "discord-main",
          webhookUrl: "https://discord.example/webhook",
          allowedSources: ["github", "manual", "system"],
          enabled: true,
        },
      ],
      timeout: 5000,
      defaultRetryAfterMs: 3000,
      reenqueueLimit: 5,
    },
    handlers: {
      github: {
        allowed: true,
        secret: "secret",
        handleEventTypes: ["push", "workflow_run"],
      },
      manual: {
        allowed: true,
        password: "password",
      },
    },
    contents: {
      maxCommitLines: 3,
      maxWorkflowJobLines: 2,
    },
    ...overrides,
  };
}
