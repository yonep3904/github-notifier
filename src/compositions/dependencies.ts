import { checkConfig, createConfig } from "@/config";
import type { Config, ValidConfig } from "@/types/config";
import type { Env } from "@/types/env";
import { createNotifyServices, type NotifyServices } from "./conditional/notify";

// biome-ignore lint/suspicious/noEmptyInterface: This interface is intentionally left empty as a placeholder for potential future base services that are not conditional on configuration validity.
interface BaseServices {}
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
      ...createNotifyServices(config.validConfig, env),
    };
  } else {
    return {
      status: "invalid",
      config: config.config,
      error: config.error,
    };
  }
}
