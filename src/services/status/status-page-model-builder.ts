import type { Channel, ConfigIssue, NormalizedConfig, ValidateConfigResult } from "@/config";
import { maskWebhookUrl } from "@/utils/mask";
import type { Tone } from "@/views/constants";

export type StatusDisplayState = "success" | "warning" | "error";

export type StatusMetric = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

export type StatusHeroModel = {
  headline: string;
  summary: string;
};

export type StatusChannelModel = {
  id: string;
  type: Channel["type"];
  enabled: boolean;
  webhook: string | undefined;
  sources: NonNullable<Channel["allowedSources"]>;
  status: StatusDisplayState;
  issues: ConfigIssue[];
};

export type GithubHandlerStatusModel = {
  endpoint: string;
  enabled: boolean;
  secretSet: boolean;
  acceptedEvents: string[];
  status: StatusDisplayState;
  issues: ConfigIssue[];
};

export type ManualHandlerStatusModel = {
  endpoint: string;
  enabled: boolean;
  passwordSet: boolean;
  status: StatusDisplayState;
  issues: ConfigIssue[];
};

export type StatusPageModel = {
  hero: StatusHeroModel;
  metrics: StatusMetric[];
  issues: ConfigIssue[];
  githubHandler: GithubHandlerStatusModel;
  manualHandler: ManualHandlerStatusModel;
  channels: StatusChannelModel[];
};

const emptyConfig: NormalizedConfig = {
  dispatch: { channels: [] },
  handlers: { github: { allowed: false, handleEventTypes: [] }, manual: { allowed: false } },
  contents: { maxCommitLines: 1, maxWorkflowJobLines: 1 },
};

function getDisplayState(issues: ConfigIssue[]): StatusDisplayState {
  if (issues.some(({ severity }) => severity === "error")) return "error";
  if (issues.length > 0) return "warning";
  return "success";
}

function getDisplayConfig(validation: ValidateConfigResult): NormalizedConfig {
  if (validation.status === "valid") return validation.validConfig;
  return validation.normalizedConfig ?? emptyConfig;
}

/** Builds status-page presentation data from an already validated Config result. */
export class StatusPageModelBuilder {
  constructor(private readonly validation: ValidateConfigResult) {}

  createPageModel(baseUrl: string): StatusPageModel {
    const config = getDisplayConfig(this.validation);
    const { issues, status } = this.validation;
    const enabledChannelCount = config.dispatch.channels.filter(({ enabled }) => enabled).length;
    const githubIssues = issues.filter(({ path }) => path.startsWith("handlers.github"));
    const manualIssues = issues.filter(({ path }) => path.startsWith("handlers.manual"));
    const errorCount = issues.filter(({ severity }) => severity === "error").length;
    const warningCount = issues.length - errorCount;

    return {
      hero: {
        headline:
          status === "valid"
            ? "Your GitHub Notifier configuration is valid."
            : "There are errors in your GitHub Notifier configuration.",
        summary: this.createIssueSummary(errorCount, warningCount),
      },
      metrics: [
        {
          label: "Worker status",
          value: status === "valid" ? "Ready" : "Invalid",
          detail:
            status === "valid"
              ? "Worker is running correctly."
              : "Worker is not functioning properly.",
          tone: status === "valid" ? "success" : "danger",
        },
        {
          label: "Enabled channels",
          value: String(enabledChannelCount),
          detail:
            enabledChannelCount > 0
              ? `When a notification is received, it will be sent to ${enabledChannelCount} channel${enabledChannelCount === 1 ? "" : "s"}.`
              : "No channels are enabled. Notifications will not be sent anywhere.",
          tone: enabledChannelCount > 0 ? "info" : "warning",
        },
        this.createHandlerMetric(
          "GitHub Webhook",
          "GitHub webhook notifications",
          config.handlers.github.allowed,
        ),
        this.createHandlerMetric(
          "Manual notify",
          "manual notifications",
          config.handlers.manual.allowed,
        ),
      ],
      issues,
      githubHandler: {
        endpoint: `${baseUrl}/notify/github`,
        enabled: config.handlers.github.allowed,
        secretSet: config.handlers.github.secret !== undefined,
        acceptedEvents: config.handlers.github.handleEventTypes,
        status: getDisplayState(githubIssues),
        issues: githubIssues,
      },
      manualHandler: {
        endpoint: `${baseUrl}/notify`,
        enabled: config.handlers.manual.allowed,
        passwordSet: config.handlers.manual.password !== undefined,
        status: getDisplayState(manualIssues),
        issues: manualIssues,
      },
      channels: config.dispatch.channels.map((channel, index) => {
        const channelIssues = issues.filter(({ path }) =>
          path.startsWith(`dispatch.channels.${index}`),
        );
        return {
          id: channel.id,
          type: channel.type,
          enabled: channel.enabled,
          webhook: channel.webhookUrl ? maskWebhookUrl(channel.webhookUrl) : undefined,
          sources: channel.allowedSources,
          status: getDisplayState(channelIssues),
          issues: channelIssues,
        };
      }),
    };
  }

  private createIssueSummary(errorCount: number, warningCount: number): string {
    if (errorCount === 0 && warningCount === 0) {
      return "No issues detected. Your worker is ready to send notifications.";
    }
    const parts = [
      errorCount > 0 ? `${errorCount} error${errorCount === 1 ? "" : "s"}` : null,
      warningCount > 0 ? `${warningCount} warning${warningCount === 1 ? "" : "s"}` : null,
    ].filter((part): part is string => part !== null);
    return `${parts.join(" and ")} detected. Review the recommendations below.`;
  }

  private createHandlerMetric(
    label: string,
    notificationType: string,
    enabled: boolean,
  ): StatusMetric {
    return {
      label,
      value: enabled ? "Enabled" : "Disabled",
      detail: enabled
        ? `Worker is configured to receive ${notificationType}.`
        : `Worker will not accept ${notificationType}.`,
      tone: enabled ? "info" : "warning",
    };
  }
}
