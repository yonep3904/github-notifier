import { z } from "zod";
import { InvalidConfigurationError } from "@/errors/config";
import { supportedEventList } from "@/services/producers";
import type { Config, ValidChannel, ValidConfig } from "@/types/config";

const notificationSourceSchema = z.enum(["github", "manual", "system"]);
const eventTypeSchema = z.enum(supportedEventList);

const channelSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("discord"),
    id: z.string().min(1),
    webhookUrl: z.url().optional(),
    allowedSources: z.array(notificationSourceSchema).optional(),
    enabled: z.boolean(),
  }),
  z.object({
    type: z.literal("slack"),
    id: z.string().min(1),
    webhookUrl: z.url().optional(),
    allowedSources: z.array(notificationSourceSchema).optional(),
    enabled: z.boolean(),
  }),
]);

const configSchema = z.object({
  dispatch: z.object({
    channels: z.array(channelSchema),
    timeout: z.number().positive().optional(),
    defaultRetryAfterMs: z.number().positive().optional(),
    reenqueueLimit: z.number().int().nonnegative().optional(),
  }),
  handlers: z.object({
    github: z.object({
      allowed: z.boolean(),
      secret: z.string().optional(),
      handleEventTypes: z.array(eventTypeSchema).optional(),
    }),
    manual: z.object({
      allowed: z.boolean(),
      password: z.string().optional(),
    }),
  }),
  contents: z.object({
    maxCommitLines: z.number().int().positive(),
    maxWorkflowJobLines: z.number().int().positive(),
  }),
});

/**
 * Validates the given configuration object.
 * Returns a strongly-typed ValidConfig if validation succeeds.
 * Throws an error if the configuration is invalid.
 * @param config - The configuration object to validate
 * @returns A validated configuration object
 */
export function validateConfig(config: Config): ValidConfig {
  // 1. Validate the overall structure using Zod
  const parsed = configSchema.parse(config);

  // 2. A channel with { webhookUrl: undefined } is considered invalid
  //    If an enabled channel is missing webhookUrl, throw an error
  for (const ch of parsed.dispatch.channels.filter((c) => c.enabled)) {
    if (!ch.webhookUrl) {
      throw new InvalidConfigurationError(
        `Channel "${ch.id}" (${ch.type}) is enabled but webhookUrl is missing`,
      );
    }
  }

  //    Remove channels without webhookUrl instead of throwing an error
  const channels = parsed.dispatch.channels.filter((ch) => ch.webhookUrl) as ValidChannel[]; // safe

  const newConfig: ValidConfig = {
    ...parsed,
    dispatch: {
      ...parsed.dispatch,
      channels,
    },
  };

  // 3. Ensure at least one channel is enabled
  if (newConfig.dispatch.channels.length === 0) {
    throw new InvalidConfigurationError("At least one channel must be enabled");
  }

  // 4. Each enabled channel must specify at least one allowed source
  for (const ch of newConfig.dispatch.channels) {
    if (ch.enabled && ch.allowedSources?.length === 0) {
      throw new InvalidConfigurationError(
        `Channel "${ch.id}" (${ch.type}) is enabled but allowedSources is empty`,
      );
    }
  }

  // 5. Ensure at least one handler is enabled
  if (!newConfig.handlers.github.allowed && !newConfig.handlers.manual.allowed) {
    throw new InvalidConfigurationError("At least one handler must be enabled");
  }

  // 6. If GitHub handler is enabled, at least one event type must be specified
  if (
    newConfig.handlers.github.allowed &&
    (!newConfig.handlers.github.handleEventTypes ||
      newConfig.handlers.github.handleEventTypes.length === 0)
  ) {
    throw new InvalidConfigurationError(
      "GitHub handler is enabled but no event types are specified",
    );
  }

  return newConfig;
}

/**
 * A wrapper function that checks the configuration and returns a result object instead of throwing errors.
 * @param config - The configuration object to check
 * @returns An object indicating whether the configuration is valid and either the validated config or an error message
 */
export function checkConfig(
  config: Config,
):
  | { status: "ready"; config: Config; validConfig: ValidConfig }
  | { status: "invalid"; config: Config; error: string } {
  try {
    const validatedConfig = validateConfig(config);
    return { status: "ready", validConfig: validatedConfig, config };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { status: "invalid", error: `Configuration validation error: ${err.message}`, config };
    } else if (err instanceof InvalidConfigurationError) {
      return { status: "invalid", error: `Invalid configuration: ${err.message}`, config };
    } else {
      return { status: "invalid", error: `Unknown error during configuration validation`, config };
    }
  }
}
