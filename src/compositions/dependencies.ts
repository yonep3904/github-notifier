import { checkConfig, createConfig } from "@/config";
import type { Config, ValidConfig } from "@/types/config";
import type { Env } from "@/types/env";
import { createStatusServices, type StatusServices } from "./base/status";
import { createNotifyServices, type NotifyServices } from "./conditional/notify";

interface BaseServices extends StatusServices {}
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
      ...createStatusServices("ready", config.config),
      ...createNotifyServices(config.validConfig, env),
    };
  } else {
    return {
      status: "invalid",
      config: config.config,
      error: config.error,
      ...createStatusServices("invalid", config.config),
    };
  }
}
