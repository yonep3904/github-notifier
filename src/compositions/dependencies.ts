import type { Config, ConfigIssue, RuntimeConfig } from "@/config";
import { createConfig, resolveConfig } from "@/config";
import type { Env } from "@/types/env";
import { createDocsServices, type DocsServices } from "./base/docs";
import { createStatusServices, type StatusServices } from "./base/status";
import { createNotifyServices, type NotifyServices } from "./conditional/notify";

interface BaseServices extends DocsServices, StatusServices {}
interface ConditionalServices extends NotifyServices {}

export type Dependencies =
  | ({
      status: "valid";
      config: RuntimeConfig;
      issues: ConfigIssue[];
    } & BaseServices &
      ConditionalServices)
  | ({
      status: "invalid";
      config: Config;
      issues: ConfigIssue[];
    } & BaseServices);

export function createDependencies(env: Env): Dependencies {
  const config = createConfig(env);
  const resolution = resolveConfig(config);

  if (resolution.status === "valid") {
    return {
      status: "valid",
      config: resolution.runtimeConfig,
      issues: resolution.issues,
      ...createDocsServices(),
      ...createStatusServices(resolution),
      ...createNotifyServices(resolution.runtimeConfig, env),
    };
  } else {
    return {
      status: "invalid",
      config: resolution.inputConfig,
      issues: resolution.issues,
      ...createDocsServices(),
      ...createStatusServices(resolution),
    };
  }
}
