import pc from "picocolors";
import {
  type Channel,
  type Config,
  type ConfigIssue,
  createConfig,
  type ResolveConfigResult,
  resolveConfig,
} from "@/config";
import { getSecret, type ProcessEnv } from "./wrangler";

export type ConfigCheckResult = {
  status: "valid" | "invalid";
  report: string;
};

export function configCheck(env: ProcessEnv, color = pc.isColorSupported): ConfigCheckResult {
  const config = createConfig(env);
  const resolution = resolveConfig(config);
  const report = createCheckReport(resolution, color);
  return {
    status: resolution.status,
    report,
  };
}

export function createCheckReport(result: ResolveConfigResult, color: boolean): string {
  const colors = pc.createColors(color);

  const errorCount = result.issues.filter(({ severity }) => severity === "error").length;
  const warningCount = result.issues.filter(({ severity }) => severity === "warning").length;

  const heading =
    result.status === "valid"
      ? `${colors.green("✔")} ${colors.green(colors.bold("Config is valid"))}`
      : `${colors.red("✖")} ${colors.red(colors.bold("Config is invalid"))}`;

  const summary = `${errorCount} error${errorCount === 1 ? "" : "s"}, ${warningCount} warning${warningCount === 1 ? "" : "s"}`;

  const formatIssue = (issue: ConfigIssue): string => {
    const label =
      issue.severity === "error"
        ? `${colors.red("✖")} ${colors.red(colors.bold("ERROR"))}`
        : `${colors.yellow("▲")} ${colors.yellow(colors.bold("WARNING"))}`;

    return [
      `${label} ${colors.bold(issue.title)}`,
      `  ${colors.dim("Path:")}   ${colors.cyan(issue.path)}`,
      `  ${colors.dim("Detail:")} ${issue.detail}`,
      `  ${colors.dim("Fix:")}    ${colors.green(issue.fix)}`,
    ].join("\n");
  };

  if (result.issues.length === 0) {
    return [
      `${colors.bold("GitHub Notifier · Config Check")}`,
      `${colors.dim("─".repeat(38))}`,
      `${heading} ${colors.dim(`(${summary})`)}`,
      ``,
      `${colors.green("No configuration issues found. Ready to deploy.")}`,
      ``,
    ].join("\n");
  } else {
    return [
      `${colors.bold("GitHub Notifier · Config Check")}`,
      `${colors.dim("─".repeat(38))}`,
      `${heading} ${colors.dim(`(${summary})`)}`,
      ``,
      result.issues.map((issue) => formatIssue(issue)).join("\n\n"),
      ``,
      ``,
    ].join("\n");
  }
}

export type ConfigStatusResult = {
  status: "valid" | "invalid";
  report: string;
};

export function configStatus(env: ProcessEnv, color = pc.isColorSupported): ConfigStatusResult {
  const config = createConfig(env);
  const resolution = resolveConfig(config);
  const report = createStatusReport(resolution, color);

  return {
    status: resolution.status,
    report,
  };
}

export function createStatusReport(result: ResolveConfigResult, color: boolean): string {
  const colors = pc.createColors(color);

  const issueCount = result.issues.length;
  const status =
    result.status === "valid"
      ? `${colors.green("✔")} ${colors.green(colors.bold("valid"))}`
      : `${colors.red("✖")} ${colors.red(colors.bold("invalid"))}`;
  const lines = [
    colors.bold("GitHub Notifier · Config Status"),
    colors.dim("─".repeat(38)),
    `Status: ${status}`,
    `Issues: ${issueCount}`,
  ];

  if (issueCount > 0) {
    lines.push(colors.yellow("Run `pnpm config-check` to review the configuration issues."));
  }

  lines.push("", ...formatConfig(result.inputConfig, color), "");

  return lines.join("\n");
}

function formatConfig(config: Config, color: boolean): string[] {
  const colors = pc.createColors(color);

  const PAD_LENGTH = 25;

  const _value = (value: unknown): string => {
    if (value === undefined) {
      return colors.red("<unset>");
    }
    if (typeof value === "string" && getSecret(value) !== undefined) {
      return colors.cyan(`<environment: ${getSecret(value)}>`);
    }
    if (
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string" ||
      value === null
    ) {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.length === 0 ? colors.dim("none") : value.map(String).join(", ");
    }

    return colors.red("<invalid>");
  };

  const label = (level: number, label: string): string => {
    const indent = "  ".repeat(level);
    return `${indent}${label}`;
  };

  const item = (level: number, label: string, value: unknown): string => {
    const indent = "  ".repeat(level);
    return `${(indent + label).padEnd(PAD_LENGTH)}${_value(value)}`;
  };

  const listItem = (
    level: number,
    label: string,
    value: unknown[] | undefined,
    direction: "horizontal" | "vertical" | "auto" = "horizontal",
  ): string => {
    const indent = "  ".repeat(level);

    if (value === undefined) {
      return `${(indent + label).padEnd(PAD_LENGTH)}${_value(value)}`;
    }

    const horizontal = () => {
      return `${(indent + label).padEnd(PAD_LENGTH)}${_value(value)}`;
    };
    const vertical = () => {
      const space = " ".repeat(PAD_LENGTH);
      const head = `${(indent + label).padEnd(PAD_LENGTH)}${value.length > 0 ? _value(value[0]) : colors.dim("none")}`;
      const additional = value.slice(1).map((v) => `${space}${_value(v)}`);
      return [head, ...additional].join("\n");
    };

    const threshold = 80;
    const textLength = `${(indent + label).padEnd(PAD_LENGTH)}${_value(value)}`.length;

    switch (direction) {
      case "horizontal":
        return horizontal();
      case "vertical":
        return vertical();
      case "auto":
        if (textLength <= threshold) {
          return horizontal();
        } else {
          return vertical();
        }
    }
  };

  const input = config as Partial<Config>;
  const dispatch = input?.dispatch;
  const github = input?.handlers?.github;
  const manual = input?.handlers?.manual;
  const contents = input?.contents;
  const lines = [];

  lines.push(
    label(0, colors.bold("[Dispatch]")),
    item(1, "Timeout", dispatch?.timeout),
    item(1, "Default retry delay", dispatch?.defaultRetryAfterMs),
    item(1, "Re-enqueue limit", dispatch?.reenqueueLimit),
    "",
  );

  lines.push(
    label(0, colors.bold("[Contents]")),
    item(1, "Max commit lines", contents?.maxCommitLines),
    item(1, "Max workflow job lines", contents?.maxWorkflowJobLines),
    "",
  );

  lines.push(label(0, colors.bold("[Channels]")));
  if (!Array.isArray(dispatch?.channels)) {
    lines.push(label(1, colors.red("<invalid>")));
    return lines;
  }

  if (dispatch.channels.length === 0) {
    lines.push(label(1, colors.dim("none")));
    return lines;
  }

  for (const channelValue of dispatch.channels) {
    const channel = channelValue as Partial<Channel> | null | undefined;
    const channelColor = channel?.enabled ? colors.green : colors.yellow;
    lines.push(
      label(1, channelColor(colors.bold(_value(channel?.id)))),
      item(2, "Enabled", channel?.enabled),
      item(2, "Type", channel?.type),
      item(2, "Webhook URL", channel?.webhookUrl),
      listItem(2, "Allowed sources", channel?.allowedSources, "horizontal"),
    );
  }

  lines.push(
    "",
    label(0, colors.bold("[Handlers]")),
    label(1, colors.bold("Manual")),
    item(3, "Enabled", manual?.allowed),
    item(3, "Password", manual?.password),
    "",
    label(1, colors.bold("GitHub")),
    item(3, "Enabled", github?.allowed),
    item(3, "Secret", github?.secret),
    listItem(
      3,
      `Events(${github?.handleEventTypes?.length || ""})`,
      github?.handleEventTypes,
      "auto",
    ),
    "",
  );

  return lines;
}
