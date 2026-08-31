import type { DocsLocale, DocsPageModel, DocsSectionModel } from "../types";
import {
  cloneCommands,
  deployCommands,
  githubSettings,
  manualCurl,
  queueCommands,
  secretCommands,
} from "./common";

export function englishDocs(baseUrl: string, locale: DocsLocale): DocsPageModel {
  return {
    locale,
    title: "Documentation",
    introduction:
      "A guide to deploying GitHub Notifier, configuring destinations and GitHub Webhooks, and verifying delivery.",
    baseUrlLabel: "Base URL for this deployment",
    baseUrl,
    contentsLabel: "Contents",
    statusLinkLabel: "Open status",
    sections: englishSections(baseUrl),
  };
}

function englishSections(baseUrl: string): DocsSectionModel[] {
  return [
    {
      id: "overview",
      title: "Overview",
      description: "Pages and endpoints exposed by this application.",
      blocks: [
        {
          type: "table",
          label: "Endpoints",
          columns: ["Path", "Purpose"],
          rows: [
            ["GET /docs", "Deployment, configuration, and usage documentation"],
            ["GET /status", "Configuration status, errors, and warnings"],
            ["POST /notify/github", "GitHub Webhook receiver"],
            ["POST /notify/manual", "Send a manual notification from JSON"],
            ["POST /notify/", "Send a manual notification from JSON (alias for /notify/manual)"],
          ],
        },
      ],
    },
    {
      id: "deployment",
      title: "Deployment",
      description: "Basic setup using Cloudflare Workers and Queues.",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Prepare the repository",
              paragraphs: [
                "Clone the repository. Fork it first if you plan to maintain custom configuration or notification logic.",
              ],
              codeSamples: [{ title: "Clone and install", language: "bash", code: cloneCommands }],
            },
            {
              title: "Create the notification queue",
              paragraphs: ["Create the Cloudflare Queue referenced by wrangler.jsonc."],
              codeSamples: [{ title: "Create queue", language: "bash", code: queueCommands }],
            },
            {
              title: "Configure secrets",
              paragraphs: [
                "Register the Discord destination. Authentication credentials are optional but recommended for enabled handlers.",
              ],
              codeSamples: [{ title: "Configure secrets", language: "bash", code: secretCommands }],
            },
            {
              title: "Deploy",
              paragraphs: ["Deploy the Worker and keep the generated URL."],
              codeSamples: [{ title: "Deploy", language: "bash", code: deployCommands }],
            },
            {
              title: "Check the configuration",
              paragraphs: [
                `Open ${baseUrl}/status. Docs and status remain available when configuration is invalid, while notify endpoints are unavailable.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: "configuration",
      title: "Configuration",
      description:
        "Start with environment variables, then customize src/config/config.ts when needed.",
      blocks: [
        {
          type: "table",
          label: "Environment variables",
          columns: ["Variable", "Description"],
          rows: [
            ["DISCORD_WEBHOOK_URL_1 … 5", "Discord destinations. Unset entries are disabled."],
            ["SLACK_WEBHOOK_URL_1 … 5", "Slack destinations. Unset entries are disabled."],
            [
              "GITHUB_WEBHOOK_SECRET",
              "Optional. When set, incoming GitHub Webhooks must have a valid signature.",
            ],
            [
              "MANUAL_NOTIFICATION_PASSWORD",
              "Optional. When set, manual notifications require a matching Bearer token.",
            ],
          ],
        },
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "Channels and sources",
              paragraphs: [
                "Configure destinations, webhook URLs, and allowed github, manual, or system sources in dispatch.channels. Omitting allowedSources enables all sources.",
              ],
            },
            {
              title: "Handlers and content",
              paragraphs: [
                "Configure GitHub and manual handlers under handlers. Use contents to control commit and Workflow Job line limits.",
              ],
            },
          ],
        },
        {
          type: "note",
          tone: "info",
          title: "Config resolution",
          body: "Config is resolved and validated at startup. /status shows each issue and its recommended fix.",
        },
      ],
    },
    {
      id: "github-webhook",
      title: "GitHub Webhook",
      description: "Send repository events from GitHub to the Worker.",
      blocks: [
        {
          type: "cards",
          items: [
            {
              title: "Add the webhook",
              paragraphs: [
                "Open Repository settings → Webhooks → Add webhook. If GITHUB_WEBHOOK_SECRET is configured on the Worker, enter the same value in GitHub. Leaving it unset disables signature verification and produces a warning.",
              ],
              codeSamples: [
                {
                  title: "GitHub webhook settings",
                  language: "text",
                  code: githubSettings(baseUrl),
                },
              ],
            },
            {
              title: "Select events",
              paragraphs: [
                "Select events in GitHub and in handlers.github.handleEventTypes. Unsupported events are ignored without sending a notification.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "manual-notification",
      title: "Manual notification",
      description: "Send an arbitrary message from CI or an operations script.",
      blocks: [
        {
          type: "cards",
          items: [
            {
              title: "Send a notification",
              paragraphs: [
                "If MANUAL_NOTIFICATION_PASSWORD is configured, send it as a Bearer token; otherwise omit the Authorization header. message is required and title is optional. Check the queued response field: false means no enabled channel accepts manual notifications.",
              ],
              codeSamples: [
                { title: "Send a test notification", language: "bash", code: manualCurl(baseUrl) },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "diagnostics",
      title: "Diagnostics",
      description: "Check configuration and service status before sending notifications.",
      blocks: [
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "Check /status",
              paragraphs: [
                "Errors disable notify endpoints. Warnings are recommendations and leave Config valid. Secret, password, and full webhook values are not exposed.",
              ],
            },
            {
              title: "If delivery fails",
              paragraphs: [
                "Check that the channel is enabled, its URL is correct, and allowedSources includes the notification source. For GitHub, also check the event type.",
              ],
            },
          ],
        },
      ],
    },
  ];
}
