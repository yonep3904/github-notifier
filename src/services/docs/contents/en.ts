import type { DocsLocale, DocsPageModel, DocsSectionModel } from "../types";
import {
  authenticationSecretCommands,
  channelConfigSample,
  cloneCommands,
  cloudflareCommands,
  deployCommands,
  discordSecretCommand,
  githubSettings,
  handlerConfigSample,
  manualCurl,
  slackSecretCommand,
} from "./common";

export function englishDocs(baseUrl: string, locale: DocsLocale): DocsPageModel {
  return {
    locale,
    title: "Documentation",
    introduction:
      "Learn how to deploy GitHub Notifier, configure destinations and handlers, and use GitHub Webhooks and manual notifications.",
    baseUrlLabel: "Base URL",
    baseUrl,
    contentsLabel: "Contents",
    sections: englishSections(baseUrl),
  };
}

function englishSections(baseUrl: string): DocsSectionModel[] {
  const sections: DocsSectionModel[] = [
    {
      id: "overview",
      title: "Overview",
      description:
        "Receive GitHub events or arbitrary messages and deliver them to Discord or Slack through Cloudflare Queues.",
      blocks: [
        {
          type: "table",
          label: "Endpoints",
          columns: ["Method / Path", "Purpose"],
          rows: [
            ["GET /", "Show the root page"],
            ["GET /docs", "Show the English documentation"],
            ["GET /docs/ja", "Show the Japanese documentation"],
            ["GET /status", "Review configuration, runtime status, destinations, and issues"],
            ["POST /notify/github", "Receive GitHub Webhooks"],
            ["POST /notify/manual", "Receive manual notifications"],
            ["POST /notify", "Alias for manual notifications (/notify/manual)"],
          ],
        },
      ],
    },
    {
      id: "deployment",
      title: "Deployment",
      description:
        "Deploy to Cloudflare Workers using the environment variables provided by the default Config.",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Prepare the repository",
              paragraphs: [
                "Install Node.js 24 and pnpm 11.9.0. Fork the repository before cloning if you intend to maintain custom configuration or notification behavior.",
              ],
              codeSamples: [{ title: "Clone and install", language: "bash", code: cloneCommands }],
            },
            {
              title: "Prepare Cloudflare and the Queue",
              paragraphs: [
                "Sign in to Cloudflare with Wrangler and create the notification-queue referenced by wrangler.jsonc. Skip queue creation if it already exists.",
              ],
              codeSamples: [
                { title: "Login and create queue", language: "bash", code: cloudflareCommands },
              ],
            },
            {
              title: "Register a destination",
              paragraphs: [
                "Store a Discord or Slack Webhook URL as a Cloudflare Secret. You can use both services and register up to five destinations of each type with variables numbered 1 through 5. You must register at least one destination.",
              ],
              codeSamples: [
                { title: "Discord", language: "bash", code: discordSecretCommand },
                { title: "Slack", language: "bash", code: slackSecretCommand },
              ],
            },
            {
              title: "Protect receiving endpoints (optional)",
              paragraphs: [
                "Register Secrets for GitHub signature verification and manual notification Bearer authentication. You may omit credentials for handlers you do not use, but credentials are recommended for every publicly enabled handler.",
              ],
              codeSamples: [
                {
                  title: "Configure authentication",
                  language: "bash",
                  code: authenticationSecretCommands,
                },
              ],
            },
            {
              title: "Deploy",
              paragraphs: [
                "Deploy the Worker to Cloudflare. On your first deployment, Wrangler may ask you to configure a workers.dev subdomain or other account settings. Follow the prompts to complete the setup.",
              ],
              codeSamples: [{ title: "Deploy", language: "bash", code: deployCommands }],
            },
          ],
        },
        {
          type: "table",
          label: "Environment variable summary",
          columns: ["Variable", "Purpose"],
          rows: [
            ["DISCORD_WEBHOOK_URL_1 … 5", "Enable the corresponding Discord destinations"],
            ["SLACK_WEBHOOK_URL_1 … 5", "Enable the corresponding Slack destinations"],
            ["GITHUB_WEBHOOK_SECRET", "Verify GitHub Webhook HMAC-SHA256 signatures"],
            ["MANUAL_NOTIFICATION_PASSWORD", "Require Bearer authentication for the manual API"],
          ],
        },
      ],
    },
    {
      id: "configuration",
      title: "Config",
      description:
        "Edit src/config/config.ts to configure destinations, allowed sources, handlers, accepted events, and other behavior more flexibly.",
      blocks: [
        {
          type: "note",
          tone: "info",
          title: "Environment variables and Config",
          body: "The default src/config/config.ts builds Config from predefined environment variables so that users can configure the application with commands alone. The application consumes the resulting Config, so you are not required to keep this environment-variable layout. However, avoid hard-coding Webhook URLs, passwords, and other sensitive values. Read them from Cloudflare Secrets or another secure binding instead.",
        },
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "Configure destinations",
              paragraphs: [
                "Add Discord or Slack channels to dispatch.channels. Keep each id unique and stable during operation. Use enabled to toggle delivery and allowedSources to select github, manual, or system notifications. Omitting allowedSources permits every source.",
              ],
              codeSamples: [
                { title: "Channel example", language: "typescript", code: channelConfigSample },
              ],
            },
            {
              title: "Configure handlers",
              paragraphs: [
                "Enable receiving with handlers.github.allowed and handlers.manual.allowed. For GitHub, list accepted events in handleEventTypes. For manual notifications, use password to configure Bearer authentication. More than 70 event types are available; templates from the events module make it easy to select common groups of events.",
              ],
              codeSamples: [
                { title: "Handler example", language: "typescript", code: handlerConfigSample },
              ],
            },
          ],
        },
        {
          type: "table",
          label: "Other Config fields",
          columns: ["Field", "Purpose", "Default"],
          rows: [
            ["dispatch.timeout", "External Webhook request timeout in milliseconds", "5000"],
            [
              "dispatch.defaultRetryAfterMs",
              "Delay when a rate-limit response has no usable retry value, in milliseconds",
              "60000",
            ],
            ["dispatch.reenqueueLimit", "Application-level Queue re-enqueue limit", "3"],
            ["contents.maxCommitLines", "Maximum commit lines shown in push notifications", "15"],
            [
              "contents.maxWorkflowJobLines",
              "Maximum lines shown in Workflow Job notifications",
              "10",
            ],
          ],
        },
      ],
    },
    {
      id: "github-webhook",
      title: "GitHub Webhook",
      description: "Send selected repository events from GitHub to the Worker.",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Add the webhook",
              paragraphs: [
                "Open Repository settings → Webhooks → Add webhook. If GITHUB_WEBHOOK_SECRET is configured on the Worker, enter the same value in GitHub. Select application/json as the content type.",
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
                "Select the events to send on GitHub. As described in the Config section below, you can also enable or disable individual events, or disable GitHub notifications entirely, on the receiving side.",
              ],
            },
            {
              title: "Verify delivery",
              paragraphs: [
                "Review Recent Deliveries in the GitHub Webhook settings. Delivery to Discord or Slack is asynchronous after the Worker accepts a request, so confirm final delivery in the destination and Cloudflare logs.",
              ],
            },
          ],
        },
        {
          type: "note",
          tone: "info",
          title: "Asynchronous delivery",
          body: "queued: true from a notification API means that jobs were added to the Queue. It does not confirm delivery to Discord or Slack.",
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
                "Use application/json as the Content-Type. message is required and must contain a non-whitespace character; title is optional. When MANUAL_NOTIFICATION_PASSWORD is configured, send it as a Bearer token. Omit the Authorization header only when no password is configured. POST /notify performs the same operation.",
              ],
              codeSamples: [
                {
                  title: "Send a test notification",
                  language: "bash",
                  code: manualCurl(
                    baseUrl,
                    "Remove the Authorization header when no password is configured.",
                  ),
                },
              ],
            },
          ],
        },
        {
          type: "table",
          label: "Success responses",
          columns: ["Response", "Meaning"],
          rows: [
            ['{ "ok": true, "queued": true }', "One or more delivery jobs were queued"],
            [
              '{ "ok": true, "queued": false }',
              "No enabled channel accepts manual notifications, so no job was queued",
            ],
            [
              '{ "ok": false, "error": ..., "message": ... }',
              "No job was queued because of an authentication, JSON parsing, input validation, or similar error",
            ],
          ],
        },
      ],
    },
    {
      id: "diagnostics",
      title: "Diagnostics",
      description:
        "After changing settings, check Status, send a test notification, and then inspect external services.",
      blocks: [
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "Check /status",
              paragraphs: [
                "When the configuration is invalid and has an Error, notification features are disabled. Warnings are recommendations about security or disabled channels and do not affect operation. Status shows only whether Secrets and passwords exist and masks Webhook URLs.",
              ],
            },
            {
              title: "If delivery fails",
              paragraphs: [
                "Confirm that the handler is enabled, the channel is enabled, allowedSources contains the source, and the Webhook URL is correct. For GitHub, also confirm that the event is selected both in handleEventTypes and on GitHub.",
              ],
            },
            {
              title: "Check HTTP errors",
              paragraphs: [
                "For 401, check the GitHub signature or Bearer token. For 400, check headers, JSON, and manual request fields. A 413 response indicates an oversized body. Notify endpoints return 503 while Config is invalid.",
              ],
            },
            {
              title: "Check Queue delivery",
              paragraphs: [
                "For failures after an API returns queued: true, inspect Cloudflare Worker and Queue logs. Rate limits, temporary service failures, and invalid Webhook URLs are logged when retried or dropped.",
              ],
            },
          ],
        },
      ],
    },
  ];

  const sectionOrder = [
    "overview",
    "deployment",
    "github-webhook",
    "manual-notification",
    "configuration",
    "diagnostics",
  ];

  return sections.sort(
    (left, right) => sectionOrder.indexOf(left.id) - sectionOrder.indexOf(right.id),
  );
}
