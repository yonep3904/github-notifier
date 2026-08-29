import type { Config, ConfigIssue, ValidConfig } from "@/config";
import { createConfig, validateConfig } from "@/config";
import type { Env } from "@/types/env";
import { createDocsServices, type DocsServices } from "./base/docs";
import { createStatusServices, type StatusServices } from "./base/status";
import { createNotifyServices, type NotifyServices } from "./conditional/notify";

interface BaseServices extends DocsServices, StatusServices {}
interface ConditionalServices extends NotifyServices {}

export type Dependencies =
  | ({
      status: "valid";
      config: ValidConfig;
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
  const validation = validateConfig(config);

  if (validation.status === "valid") {
    return {
      status: "valid",
      config: validation.validConfig,
      issues: validation.issues,
      ...createDocsServices(),
      ...createStatusServices(validation),
      ...createNotifyServices(validation.validConfig, env),
    };
  } else {
    return {
      status: "invalid",
      config: validation.config,
      issues: validation.issues,
      ...createDocsServices(),
      ...createStatusServices(validation),
    };
  }
}
