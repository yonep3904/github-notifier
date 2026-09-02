import pc from "picocolors";
import { type ConfigIssue, createConfig, type ResolveConfigResult, resolveConfig } from "@/config";
import type { ProcessEnv } from "./wrangler";

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
