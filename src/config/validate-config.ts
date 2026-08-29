import { z } from "zod";
import { supportedEventList } from "@/services/producers";
import type { Config, NormalizedConfig, ValidChannel, ValidConfig } from "./types";

export type ConfigIssueSeverity = "error" | "warning";

export type ConfigIssue = {
  severity: ConfigIssueSeverity;
  path: string;
  title: string;
  detail: string;
  fix: string;
};

export type ValidateConfigResult =
  | {
      status: "valid";
      config: Config;
      validConfig: ValidConfig;
      issues: ConfigIssue[];
    }
  | {
      status: "invalid";
      config: Config;
      normalizedConfig?: NormalizedConfig;
      issues: ConfigIssue[];
    };

const notificationSourceSchema = z.enum(["github", "manual", "system"]);
const eventTypeSchema = z.enum(supportedEventList);
const defaultAllowedSources = ["github", "manual", "system"] as const;

export const channelSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("discord"),
    id: z.string().min(1),
    webhookUrl: z.url().optional(),
    allowedSources: z.array(notificationSourceSchema).default([...defaultAllowedSources]),
    enabled: z.boolean(),
  }),
  z.object({
    type: z.literal("slack"),
    id: z.string().min(1),
    webhookUrl: z.url().optional(),
    allowedSources: z.array(notificationSourceSchema).default([...defaultAllowedSources]),
    enabled: z.boolean(),
  }),
]);

export const configSchema = z.object({
  dispatch: z.object({
    channels: z.array(channelSchema),
    timeout: z.number().positive().optional(),
    defaultRetryAfterMs: z.number().positive().optional(),
    reenqueueLimit: z.number().int().nonnegative().optional(),
  }),
  handlers: z.object({
    github: z.object({
      allowed: z.boolean(),
      secret: z.string().min(1).optional(),
      handleEventTypes: z.array(eventTypeSchema),
    }),
    manual: z.object({
      allowed: z.boolean(),
      password: z.string().min(1).optional(),
    }),
  }),
  contents: z.object({
    maxCommitLines: z.number().int().positive(),
    maxWorkflowJobLines: z.number().int().positive(),
  }),
});

export function issue(
  path: string,
  title: string,
  detail: string,
  fix: string,
  severity: ConfigIssueSeverity = "error",
): ConfigIssue {
  return { severity, path, title, detail, fix };
}

export function validateConfig(config: Config): ValidateConfigResult {
  const parsed = configSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((zodIssue) => {
      const path = zodIssue.path.length > 0 ? zodIssue.path.join(".") : "config";
      return issue(
        path,
        `Invalid value at "${path}"`,
        zodIssue.message,
        `Update /src/config/config.ts or its environment variables so "${path}" matches the expected shape.`,
      );
    });

    return { status: "invalid", config, issues };
  }

  const parsedConfig = parsed.data;
  const issues: ConfigIssue[] = [];

  for (const [index, channel] of parsedConfig.dispatch.channels.entries()) {
    const basePath = `dispatch.channels.${index}`;

    if (channel.enabled && !channel.webhookUrl) {
      issues.push(
        issue(
          `${basePath}.webhookUrl`,
          `Channel "${channel.id}" is enabled without a webhook URL`,
          "Enabled channels need a webhook URL before notifications can be delivered.",
          `Set the webhook URL for "${channel.id}" or disable that channel.`,
        ),
      );
    }

    if (channel.enabled && channel.allowedSources.length === 0) {
      issues.push(
        issue(
          `${basePath}.allowedSources`,
          `Channel "${channel.id}" has no allowed sources`,
          "An enabled channel must accept at least one notification source.",
          `Add one or more sources such as "github" or "manual" to "${channel.id}".`,
        ),
      );
    }

    if (!channel.enabled && channel.webhookUrl) {
      issues.push(
        issue(
          `${basePath}.enabled`,
          `Channel "${channel.id}" is configured but disabled`,
          "Its webhook URL is present, but this channel will not receive notifications.",
          `Enable "${channel.id}" if it should receive notifications.`,
          "warning",
        ),
      );
    }
  }

  const enabledChannels = parsedConfig.dispatch.channels.filter((channel) => channel.enabled);
  if (enabledChannels.length === 0) {
    issues.push(
      issue(
        "dispatch.channels",
        "No enabled channel can receive notifications",
        "At least one notification destination must be enabled.",
        "Configure and enable one Discord or Slack channel with a webhook URL.",
      ),
    );
  }

  if (!parsedConfig.handlers.github.allowed && !parsedConfig.handlers.manual.allowed) {
    issues.push(
      issue(
        "handlers",
        "No notification handler is enabled",
        "Neither GitHub nor manual notifications can be received.",
        "Enable at least one of handlers.github.allowed or handlers.manual.allowed.",
      ),
    );
  }

  if (
    parsedConfig.handlers.github.allowed &&
    parsedConfig.handlers.github.handleEventTypes.length === 0
  ) {
    issues.push(
      issue(
        "handlers.github.handleEventTypes",
        "GitHub handler has no event types",
        "GitHub notifications are enabled, but no webhook event types are selected.",
        "Add one or more supported event names to handlers.github.handleEventTypes.",
      ),
    );
  }

  if (parsedConfig.handlers.github.allowed && !parsedConfig.handlers.github.secret) {
    issues.push(
      issue(
        "handlers.github.secret",
        "GitHub webhook secret is missing",
        "The enabled GitHub handler cannot authenticate webhook requests.",
        "Set GITHUB_WEBHOOK_SECRET or disable the GitHub handler.",
      ),
    );
  }

  if (parsedConfig.handlers.manual.allowed && !parsedConfig.handlers.manual.password) {
    issues.push(
      issue(
        "handlers.manual.password",
        "Manual notification password is missing",
        "The enabled manual handler cannot authenticate notification requests.",
        "Set MANUAL_NOTIFICATION_PASSWORD or disable the manual handler.",
      ),
    );
  }

  const hasErrors = issues.some(({ severity }) => severity === "error");

  if (hasErrors) {
    return { status: "invalid", config, normalizedConfig: parsedConfig, issues };
  } else {
    const channels = parsedConfig.dispatch.channels.filter(
      (channel): channel is ValidChannel => channel.webhookUrl !== undefined,
    );

    const validConfig: ValidConfig = {
      ...parsedConfig,
      dispatch: {
        ...parsedConfig.dispatch,
        channels,
      },
    };

    return { status: "valid", config, validConfig, issues };
  }
}
