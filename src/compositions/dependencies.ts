import { checkConfig, createConfig } from "@/config";
import type { Config, ValidConfig } from "@/types/config";
import type { Env } from "@/types/env";
import { createDocsServices, type DocsServices } from "./base/docs";
import { createStatusServices, type StatusServices } from "./base/status";
import { createNotifyServices, type NotifyServices } from "./conditional/notify";

interface BaseServices extends DocsServices, StatusServices {}
interface ConditionalServices extends NotifyServices {}

export type Dependencies =
  | ({
      status: "ready";
      config: ValidConfig;
    } & BaseServices &
      ConditionalServices)
  | ({
      status: "invalid";
      config: Config;
      error: string;
    } & BaseServices);

export function createDependencies(env: Env): Dependencies {
  const config = checkConfig(createConfig(env));

  if (config.status === "ready") {
    return {
      status: "ready",
      config: config.validConfig,
      ...createDocsServices(),
      ...createStatusServices("ready", config.config),
      ...createNotifyServices(config.validConfig, env),
    };
  } else {
    return {
      status: "invalid",
      config: config.config,
      error: config.error,
      ...createDocsServices(),
      ...createStatusServices("invalid", config.config),
    };
  }
}
