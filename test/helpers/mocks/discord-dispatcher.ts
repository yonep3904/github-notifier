import type { DiscordNotificationBuilder } from "@/services/dispatchers/discord/builder";
import {
  DiscordNotificationDispatcher,
  type DiscordNotificationDispatcherConfig,
} from "@/services/dispatchers/discord/dispatcher";
import type { DiscordNotificationSender } from "@/services/dispatchers/discord/sender";

export function createMockDiscordBuilder(): DiscordNotificationBuilder {
  return {
    build: vi.fn().mockReturnValue({ content: "payload" }),
  } as unknown as DiscordNotificationBuilder;
}

export function createMockDiscordSender(): DiscordNotificationSender {
  return {
    send: vi.fn().mockResolvedValue(undefined),
  } as unknown as DiscordNotificationSender;
}

export function createMockDiscordDispatcher(
  config: DiscordNotificationDispatcherConfig,
  builder: DiscordNotificationBuilder = createMockDiscordBuilder(),
  sender: DiscordNotificationSender = createMockDiscordSender(),
): DiscordNotificationDispatcher {
  return new DiscordNotificationDispatcher(config, builder, sender);
}

export function createMockDiscordDispatchers(
  configs: DiscordNotificationDispatcherConfig = {
    id: "test-dispatcher",
  },
): {
  builder: DiscordNotificationBuilder;
  sender: DiscordNotificationSender;
  dispatcher: DiscordNotificationDispatcher;
} {
  const builder = createMockDiscordBuilder();
  const sender = createMockDiscordSender();
  const dispatcher = new DiscordNotificationDispatcher(configs, builder, sender);
  return { builder, sender, dispatcher };
}
