#!/usr/bin/env node

import pc from "picocolors";
import { type ConfigIssue, createConfig, type ResolveConfigResult, resolveConfig } from "@/config";

/*
$ wrangler secret list --format json
[
  {
    "name": "DISCORD_WEBHOOK_URL_1",
    "type": "secret_text"
  },
  {
    "name": "GITHUB_WEBHOOK_SECRET",
    "type": "secret_text"
  }
]
*/

type Output = {
  exitCode: 0 | 1 | 2;
  stdout: string;
  stderr: string;
};

type WranglerSecretMetadata = {
  name: string;
  type: string;
};

const DUMMY_SECRET_VALUE = "__CONFIG_CHECK_SECRET_PRESENT__";

async function createValidationEnv(): Promise<Record<string, string | undefined>> {
  const env = { ...process.env };
  const { execFile } = await import("node:child_process");

  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      "wrangler",
      ["secret", "list", "--format", "json"],
      { encoding: "utf8" },
      (error, stdout) => {
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve(stdout);
        }
      },
    );
  });

  const metadata: unknown = JSON.parse(stdout);

  if (!isSecretMetadata(metadata)) {
    throw new Error("Unexpected output from `wrangler secret list`");
  }

  const secretNames = metadata.map((item) => item.name);
  for (const name of secretNames) {
    env[name] = DUMMY_SECRET_VALUE;
  }

  return env;
}

export function isSecretMetadata(value: unknown): value is WranglerSecretMetadata[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).name === "string" &&
        typeof (item as Record<string, unknown>).type === "string",
    )
  );
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

export function checkConfig(
  env: Record<string, string | undefined>,
  color = pc.isColorSupported,
): Output {
  const config = createConfig(env);
  const resolution = resolveConfig(config);
  const report = createCheckReport(resolution, color);

  return resolution.status === "valid"
    ? { exitCode: 0, stdout: report, stderr: "" }
    : { exitCode: 1, stdout: "", stderr: report };
}

async function main(): Promise<void> {
  let output: Output;

  try {
    const env = await createValidationEnv();
    output = checkConfig(env);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    output = {
      exitCode: 2,
      stdout: "",
      stderr: `${pc.red("✖")} ${pc.red(pc.bold("ERROR"))} ${pc.red(message)}\n`,
    };
  }

  if (output.stdout) process.stdout.write(output.stdout);
  if (output.stderr) process.stderr.write(output.stderr);
  process.exitCode = output.exitCode;
}

if (typeof process !== "undefined" && process.argv[1]?.endsWith("scripts/config-check.ts")) {
  await main();
}
