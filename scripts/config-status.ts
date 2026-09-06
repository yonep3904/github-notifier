#!/usr/bin/env node

import pc from "picocolors";
import { configStatus } from "./lib/config";
import { createProcessEnv } from "./lib/wrangler";

export async function main(): Promise<void> {
  try {
    const env = await createProcessEnv();
    const result = configStatus(env);

    process.stdout.write(result.report);
    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${pc.red("✖")} ${pc.red(pc.bold("ERROR"))} ${pc.red(message)}\n`);
    process.exitCode = 2;
  }
}

if (typeof process !== "undefined" && process.argv[1]?.endsWith("scripts/config-status.ts")) {
  await main();
}
