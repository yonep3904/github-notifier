import { configSchema } from "@/config";
import type { Channel, Config } from "@/types/config";
import { maskWebhookUrl } from "@/utils/mask";

type Issue = {
  path: string;
  title: string;
  detail: string;
  fix: string;
  severity: "error";
};

type ChannelSummary = {
  id: string;
  enabled: boolean;
  sources: Channel["allowedSources"];

  status: "success" | "warning" | "error";
  issues: Issue[];
} & (
  | {
      type: "slack";
      webhook: string | undefined;
    }
  | {
      type: "discord";
      webhook: string | undefined;
    }
);

type HandlerSummary = {
  github: {
    enabled: boolean;
    secure: boolean;
    secretSet: boolean;
    acceptedEvents: string[];

    status: "success" | "warning" | "error";
    issues: Issue[];
  };
  manual: {
    enabled: boolean;
    secure: boolean;
    passwordSet: boolean;

    status: "success" | "warning" | "error";
    issues: Issue[];
  };
};

export type StatusSnapshot = {
  status: "ready" | "invalid";
  headline: string;
  summary: string;
  issues: Issue[];

  handlers: HandlerSummary;
  channels: ChannelSummary[];

  enabledChannelCount: number;
};

export class StatusManager {
  private snapshot: StatusSnapshot | null = null;
  private maskedConfig: Config | null = null;

  constructor(
    private readonly status: "ready" | "invalid",
    private readonly config: Config,
  ) {}

  private buildZodIssues(config: Config): Issue[] {
    const parsed = configSchema.safeParse(config);
    if (parsed.success) {
      return [];
    }

    const error = parsed.error;

    return error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "config";

      return {
        path,
        title: `Invalid value at "${path}"`,
        detail: issue.message,
        fix: `Update /src/config/config.ts so "${path}" matches the expected type and required shape.`,
        severity: "error",
      };
    });
  }

  private buildLogicIssues(config: Config): Issue[] {
    const issues: Issue[] = [];

    // 2. A channel with { webhookUrl: undefined } is considered invalid
    for (const [index, channel] of config.dispatch.channels.entries()) {
      if (channel.enabled && !channel.webhookUrl) {
        issues.push({
          path: `dispatch.channels.${index}.webhookUrl`,
          title: `Channel "${channel.id}" is enabled without a webhook URL`,
          detail: "Enabled channels need a webhook URL before notifications can be delivered.",
          fix: `Set the webhook URL for "${channel.id}" with an environment variable or disable that channel.`,
          severity: "error",
        });
      }
    }

    // 3. Ensure at least one channel is enabled
    if (config.dispatch.channels.length === 0) {
      issues.push({
        path: "dispatch.channels",
        title: "No channels are configured",
        detail: "The application has no notification destination.",
        fix: "Add at least one channel in /src/config/config.ts.",
        severity: "error",
      });
    }
    if (config.dispatch.channels.filter((channel) => channel.enabled).length === 0) {
      issues.push({
        path: "dispatch.channels",
        title: "No enabled channel can receive notifications",
        detail: "At least one enabled channel with a valid webhook URL is required.",
        fix: "Configure one enabled Discord or Slack channel with a webhook URL.",
        severity: "error",
      });
    }

    // 4. Each enabled channel must specify at least one allowed source
    for (const [index, channel] of config.dispatch.channels.entries()) {
      if (channel.enabled && channel.allowedSources?.length === 0) {
        issues.push({
          path: `dispatch.channels.${index}.allowedSources`,
          title: `Channel "${channel.id}" has no allowed sources`,
          detail: "An enabled channel must accept at least one notification source.",
          fix: `Add one or more sources such as "github" or "manual" to "${channel.id}".`,
          severity: "error",
        });
      }
    }

    // 5. Ensure at least one handler is enabled
    if (
      config.handlers.github.allowed &&
      (!config.handlers.github.handleEventTypes ||
        config.handlers.github.handleEventTypes.length === 0)
    ) {
      issues.push({
        path: "handlers.github.handleEventTypes",
        title: "GitHub handler has no event types",
        detail: "GitHub notifications are enabled, but no webhook event types are selected.",
        fix: "Add one or more GitHub event names to handlers.github.handleEventTypes.",
        severity: "error",
      });
    }

    // 6. If GitHub handler is enabled, at least one event type must be specified
    if (!config.handlers.github.allowed && !config.handlers.manual.allowed) {
      issues.push({
        path: "handlers",
        title: "No notification handler is enabled",
        detail:
          "The worker can receive requests, but neither GitHub nor manual notifications are enabled.",
        fix: "Enable at least one of handlers.github.allowed or handlers.manual.allowed.",
        severity: "error",
      });
    }

    return issues;
  }

  private buildHandlers(config: Config, issues: Issue[]): HandlerSummary {
    const githubIssues = issues.filter((issue) => issue.path.startsWith("handlers.github"));
    const manualIssues = issues.filter((issue) => issue.path.startsWith("handlers.manual"));

    return {
      github: {
        enabled: config.handlers.github.allowed,
        secure: config.handlers.github.secret !== undefined,
        secretSet: config.handlers.github.secret !== undefined,
        acceptedEvents: config.handlers.github.handleEventTypes,
        status: githubIssues.length === 0 ? "success" : "error",
        issues: githubIssues,
      },
      manual: {
        enabled: config.handlers.manual.allowed,
        secure: config.handlers.manual.password !== undefined,
        passwordSet: config.handlers.manual.password !== undefined,
        status: manualIssues.length === 0 ? "success" : "error",
        issues: manualIssues,
      },
    };
  }

  private buildChannels(config: Config, issues: Issue[]): ChannelSummary[] {
    return config.dispatch.channels.map((ch, index) => {
      const channelIssues = issues.filter((issue) =>
        issue.path.startsWith(`dispatch.channels.${index}`),
      );
      return {
        id: ch.id,
        type: ch.type,
        enabled: ch.enabled,
        webhook: ch.webhookUrl ? maskWebhookUrl(ch.webhookUrl) : undefined,
        sources: ch.allowedSources ?? ["github", "manual", "system"],
        status: channelIssues.length ? "error" : "success",
        issues: channelIssues,
      };
    });
  }

  private buildSnapshot(config: Config): StatusSnapshot {
    const issues = [...this.buildZodIssues(config), ...this.buildLogicIssues(config)];
    const handlers = this.buildHandlers(config, issues);
    const channels = this.buildChannels(config, issues);

    const status = this.status === "ready" && issues.length === 0 ? "ready" : "invalid";
    const headline =
      status === "ready"
        ? "Your GitHub Notifier configuration looks good!"
        : "There are issues with your GitHub Notifier configuration.";
    const summary =
      issues.length === 0
        ? "No issues detected. Your worker is ready to send notifications."
        : `${issues.length} issue${issues.length !== 1 ? "s" : ""} detected. Please review and fix them to ensure proper functionality.`;

    const enabledChannelCount = config.dispatch.channels.filter(
      (channel) => channel.enabled,
    ).length;

    return {
      status,
      headline,
      summary,
      issues,
      handlers,
      channels,
      enabledChannelCount,
    };
  }

  private maskSensitiveInfo(config: Config): Config {
    const maskedConfig = JSON.parse(JSON.stringify(config)) as Config;

    maskedConfig.handlers.github.secret = maskedConfig.handlers.github.secret
      ? "[REDACTED]"
      : undefined;
    maskedConfig.handlers.manual.password = maskedConfig.handlers.manual.password
      ? "[REDACTED]"
      : undefined;

    maskedConfig.dispatch.channels = maskedConfig.dispatch.channels.map((channel) => ({
      ...channel,
      webhookUrl: channel.webhookUrl ? maskWebhookUrl(channel.webhookUrl) : undefined,
    }));

    return maskedConfig;
  }

  getStatus() {
    return this.status;
  }

  getConfig() {
    if (this.maskedConfig === null) {
      this.maskedConfig = this.maskSensitiveInfo(this.config);
    }
    return this.maskedConfig;
  }

  getSnapshot() {
    if (this.snapshot === null) {
      this.snapshot = this.buildSnapshot(this.config);
    }
    return this.snapshot;
  }
}
