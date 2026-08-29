import { z } from "zod";
import { SUPPORTED_GITHUB_EVENTS } from "@/constants/github-events";
import type { Config, NormalizedConfig, RuntimeChannel, RuntimeConfig } from "./types";

export type ConfigIssueSeverity = "error" | "warning";

export type ConfigIssue = {
  severity: ConfigIssueSeverity;
  path: string;
  title: string;
  detail: string;
  fix: string;
};

export type ResolveConfigResult =
  | {
      status: "valid";
      inputConfig: Config;
      normalizedConfig: NormalizedConfig;
      runtimeConfig: RuntimeConfig;
      issues: ConfigIssue[];
    }
  | {
      status: "invalid";
      inputConfig: Config;
      normalizedConfig?: NormalizedConfig;
      issues: ConfigIssue[];
    };

function createIssue(
  path: string,
  title: string,
  detail: string,
  fix: string,
  severity: ConfigIssueSeverity = "error",
): ConfigIssue {
  return { severity, path, title, detail, fix };
}

function parseConfig(
  config: Config,
): { success: true; config: NormalizedConfig } | { success: false; issues: ConfigIssue[] } {
  const notificationSourceSchema = z.enum(["github", "manual", "system"]);
  const eventTypeSchema = z.enum(SUPPORTED_GITHUB_EVENTS);
  const defaultAllowedSources = ["github", "manual", "system"] as const;

  const channelSchema = z.discriminatedUnion("type", [
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

  const configSchema = z.object({
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

  const parsed = configSchema.safeParse(config);
  if (parsed.success) {
    return { success: true, config: parsed.data };
  }

  return {
    success: false,
    issues: parsed.error.issues.map((zodIssue) => {
      const path = zodIssue.path.length > 0 ? zodIssue.path.join(".") : "config";
      return createIssue(
        path,
        `Invalid value at "${path}"`,
        zodIssue.message,
        `Update /src/config/config.ts or its environment variables so "${path}" matches the expected shape.`,
      );
    }),
  };
}

function validateNormalizedConfig(config: NormalizedConfig): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  for (const [index, channel] of config.dispatch.channels.entries()) {
    const basePath = `dispatch.channels.${index}`;

    if (channel.enabled && !channel.webhookUrl) {
      issues.push(
        createIssue(
          `${basePath}.webhookUrl`,
          `Channel "${channel.id}" is enabled without a webhook URL`,
          "Enabled channels need a webhook URL before notifications can be delivered.",
          `Set the webhook URL for "${channel.id}" or disable that channel.`,
        ),
      );
    }
    if (channel.enabled && channel.allowedSources.length === 0) {
      issues.push(
        createIssue(
          `${basePath}.allowedSources`,
          `Channel "${channel.id}" has no allowed sources`,
          "An enabled channel must accept at least one notification source.",
          `Add one or more sources such as "github" or "manual" to "${channel.id}".`,
        ),
      );
    }
    if (!channel.enabled && channel.webhookUrl) {
      issues.push(
        createIssue(
          `${basePath}.enabled`,
          `Channel "${channel.id}" is configured but disabled`,
          "Its webhook URL is present, but this channel will not receive notifications.",
          `Enable "${channel.id}" if it should receive notifications.`,
          "warning",
        ),
      );
    }
  }

  if (!config.dispatch.channels.some(({ enabled }) => enabled)) {
    issues.push(
      createIssue(
        "dispatch.channels",
        "No enabled channel can receive notifications",
        "At least one notification destination must be enabled.",
        "Configure and enable one Discord or Slack channel with a webhook URL.",
      ),
    );
  }
  if (!config.handlers.github.allowed && !config.handlers.manual.allowed) {
    issues.push(
      createIssue(
        "handlers",
        "No notification handler is enabled",
        "Neither GitHub nor manual notifications can be received.",
        "Enable at least one of handlers.github.allowed or handlers.manual.allowed.",
      ),
    );
  }
  if (config.handlers.github.allowed && config.handlers.github.handleEventTypes.length === 0) {
    issues.push(
      createIssue(
        "handlers.github.handleEventTypes",
        "GitHub handler has no event types",
        "GitHub notifications are enabled, but no webhook event types are selected.",
        "Add one or more supported event names to handlers.github.handleEventTypes.",
      ),
    );
  }
  if (config.handlers.github.allowed && !config.handlers.github.secret) {
    issues.push(
      createIssue(
        "handlers.github.secret",
        "GitHub webhook secret is missing",
        "The enabled GitHub handler cannot authenticate webhook requests.",
        "Set GITHUB_WEBHOOK_SECRET or disable the GitHub handler.",
      ),
    );
  }
  if (config.handlers.manual.allowed && !config.handlers.manual.password) {
    issues.push(
      createIssue(
        "handlers.manual.password",
        "Manual notification password is missing",
        "The enabled manual handler cannot authenticate notification requests.",
        "Set MANUAL_NOTIFICATION_PASSWORD or disable the manual handler.",
      ),
    );
  }

  return issues;
}

function createRuntimeConfig(config: NormalizedConfig): RuntimeConfig {
  const channels = config.dispatch.channels.filter(
    (channel): channel is RuntimeChannel => channel.webhookUrl !== undefined,
  );
  return { ...config, dispatch: { ...config.dispatch, channels } };
}

export function resolveConfig(inputConfig: Config): ResolveConfigResult {
  const parsed = parseConfig(inputConfig);
  if (!parsed.success) {
    return { status: "invalid", inputConfig, issues: parsed.issues };
  }

  const normalizedConfig = parsed.config;
  const issues = validateNormalizedConfig(normalizedConfig);
  if (issues.some(({ severity }) => severity === "error")) {
    return { status: "invalid", inputConfig, normalizedConfig, issues };
  }

  return {
    status: "valid",
    inputConfig,
    normalizedConfig,
    runtimeConfig: createRuntimeConfig(normalizedConfig),
    issues,
  };
}
