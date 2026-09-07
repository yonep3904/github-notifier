import { METADATA } from "@/constants/metadata";

export const cloneCommands = `\
git clone ${METADATA.repLink}.git
cd github-notifier
pnpm install`;

export const cloudflareCommands = `\
pnpm exec wrangler login
pnpm exec wrangler queues create notification-queue`;

export const discordSecretCommand = "pnpm exec wrangler secret put DISCORD_WEBHOOK_URL_1";

export const slackSecretCommand = "pnpm exec wrangler secret put SLACK_WEBHOOK_URL_1";

export const authenticationSecretCommands = `\
pnpm exec wrangler secret put GITHUB_WEBHOOK_SECRET
pnpm exec wrangler secret put MANUAL_NOTIFICATION_PASSWORD`;

export const deployCommands = `\
pnpm run deploy`;

export const channelConfigSample = `\
dispatch: {
  channels: [
    {
      type: "discord",
      id: "discord-1",
      webhookUrl: "https://discord.com/api/webhooks/...",
      allowedSources: ["github", "manual"],
      enabled: true,
    },
    {
      type: "slack",
      id: "slack-1",
      webhookUrl: undefined,
      allowedSources: ["github"],
      enabled: false,
    },
    ...
  ]
}`;

export const handlerConfigSample = `\
handlers: {
  github: {
    allowed: true,
    secret: env.GITHUB_WEBHOOK_SECRET,
    handleEventTypes: ["push", "pull_request", "issues"],
    // handleEventTypes: [...events.standard], // standard events template
  },
  manual: {
    allowed: true,
    password: env.MANUAL_NOTIFICATION_PASSWORD,
  },
}`;

export function manualCurl(baseUrl: string, comment: string): string {
  return `\
# ${comment}
curl -X POST '${baseUrl}/notify/manual' \\
  -H 'Authorization: Bearer <MANUAL_NOTIFICATION_PASSWORD>' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "title": "Deploy completed",
    "message": "Production deployment finished successfully."
  }'`;
}

export function githubSettings(baseUrl: string): string {
  return `\
Payload URL: ${baseUrl}/notify/github
Content type: application/json
Secret: <GITHUB_WEBHOOK_SECRET>`;
}
