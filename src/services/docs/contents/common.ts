import { METADATA } from "@/constants/metadata";

export const cloneCommands = `\
git clone ${METADATA.repLink}.git
cd github-notifier
pnpm install`;

export const queueCommands = `pnpm exec wrangler queues create notification-queue`;

export const secretCommands = `\
pnpm exec wrangler secret put DISCORD_WEBHOOK_URL_1
pnpm exec wrangler secret put GITHUB_WEBHOOK_SECRET
pnpm exec wrangler secret put MANUAL_NOTIFICATION_PASSWORD`;

export const deployCommands = `pnpm deploy`;

export function manualCurl(baseUrl: string): string {
  return `\
# Omit the Authorization header when MANUAL_NOTIFICATION_PASSWORD is not configured.
curl -X POST '${baseUrl}/notify/manual' \\
-H 'Authorization: Bearer <MANUAL_NOTIFICATION_PASSWORD>' \\
-H 'content-type: application/json' \\
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
