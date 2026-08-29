import type { Config, ConfigIssue, ValidateConfigResult } from "@/config";
import type { Channel } from "@/config/types";
import { maskWebhookUrl } from "@/utils/mask";

type DisplayStatus = "success" | "warning" | "error";

type ChannelSummary = {
  id: string;
  enabled: boolean;
  sources: Channel["allowedSources"];
  status: DisplayStatus;
  issues: ConfigIssue[];
} & { type: "slack" | "discord"; webhook: string | undefined };

type HandlerSummary = {
  github: {
    enabled: boolean;
    secure: boolean;
    secretSet: boolean;
    acceptedEvents: string[];
    status: DisplayStatus;
    issues: ConfigIssue[];
  };
  manual: {
    enabled: boolean;
    secure: boolean;
    passwordSet: boolean;
    status: DisplayStatus;
    issues: ConfigIssue[];
  };
};

export type StatusSnapshot = {
  status: "valid" | "invalid";
  headline: string;
  summary: string;
  issues: ConfigIssue[];
  handlers: HandlerSummary;
  channels: ChannelSummary[];
  enabledChannelCount: number;
};

function displayStatus(issues: ConfigIssue[]): DisplayStatus {
  if (issues.some(({ severity }) => severity === "error")) return "error";
  if (issues.length > 0) return "warning";
  return "success";
}

const emptyConfig: Config = {
  dispatch: { channels: [] },
  handlers: { github: { allowed: false, handleEventTypes: [] }, manual: { allowed: false } },
  contents: { maxCommitLines: 1, maxWorkflowJobLines: 1 },
};

/** Converts a validation result into presentation data; it does not validate Config. */
export class StatusManager {
  private snapshot: StatusSnapshot | null = null;
  private maskedConfig: Config | null = null;

  constructor(private readonly validation: ValidateConfigResult) {}

  private getDisplayConfig(): Config {
    const candidate = this.validation.config as Partial<Config>;
    if (!candidate.dispatch || !candidate.handlers || !candidate.contents) return emptyConfig;
    if (!candidate.handlers.github || !candidate.handlers.manual) return emptyConfig;
    if (!Array.isArray(candidate.dispatch.channels)) return emptyConfig;
    if (!Array.isArray(candidate.handlers.github.handleEventTypes)) return emptyConfig;
    return candidate as Config;
  }

  private buildSnapshot(): StatusSnapshot {
    const config = this.getDisplayConfig();
    const issues = this.validation.issues;
    const githubIssues = issues.filter((item) => item.path.startsWith("handlers.github"));
    const manualIssues = issues.filter((item) => item.path.startsWith("handlers.manual"));
    const handlers: HandlerSummary = {
      github: {
        enabled: config.handlers.github.allowed,
        secure: config.handlers.github.secret !== undefined,
        secretSet: config.handlers.github.secret !== undefined,
        acceptedEvents: config.handlers.github.handleEventTypes,
        status: displayStatus(githubIssues),
        issues: githubIssues,
      },
      manual: {
        enabled: config.handlers.manual.allowed,
        secure: config.handlers.manual.password !== undefined,
        passwordSet: config.handlers.manual.password !== undefined,
        status: displayStatus(manualIssues),
        issues: manualIssues,
      },
    };
    const channels = config.dispatch.channels.map((channel, index): ChannelSummary => {
      const channelIssues = issues.filter((item) =>
        item.path.startsWith(`dispatch.channels.${index}`),
      );
      return {
        id: channel.id,
        type: channel.type,
        enabled: channel.enabled,
        webhook: channel.webhookUrl ? maskWebhookUrl(channel.webhookUrl) : undefined,
        sources: channel.allowedSources ?? ["github", "manual", "system"],
        status: displayStatus(channelIssues),
        issues: channelIssues,
      };
    });
    const errorCount = issues.filter(({ severity }) => severity === "error").length;
    const warningCount = issues.length - errorCount;
    const summaryParts = [
      errorCount > 0 ? `${errorCount} error${errorCount === 1 ? "" : "s"}` : null,
      warningCount > 0 ? `${warningCount} warning${warningCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean);
    return {
      status: this.validation.status,
      headline:
        this.validation.status === "valid"
          ? "Your GitHub Notifier configuration is valid."
          : "There are errors in your GitHub Notifier configuration.",
      summary:
        issues.length === 0
          ? "No issues detected. Your worker is ready to send notifications."
          : `${summaryParts.join(" and ")} detected. Review the recommendations below.`,
      issues,
      handlers,
      channels,
      enabledChannelCount: config.dispatch.channels.filter(({ enabled }) => enabled).length,
    };
  }

  private maskSensitiveInfo(config: Config): Config {
    const maskedConfig = structuredClone(config);
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
    return this.validation.status;
  }
  getConfig() {
    if (this.maskedConfig === null)
      this.maskedConfig = this.maskSensitiveInfo(this.getDisplayConfig());
    return this.maskedConfig;
  }
  getSnapshot() {
    if (this.snapshot === null) this.snapshot = this.buildSnapshot();
    return this.snapshot;
  }
}
