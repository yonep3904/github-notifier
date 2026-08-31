import type { SlackNotificationBuilder } from "@/services/dispatchers/slack/builder";
import {
  SlackNotificationDispatcher,
  type SlackNotificationDispatcherConfig,
} from "@/services/dispatchers/slack/dispatcher";
import type { SlackNotificationSender } from "@/services/dispatchers/slack/sender";

export function createMockSlackBuilder(): SlackNotificationBuilder {
  return {
    build: vi.fn().mockReturnValue({ text: "payload" }),
  } as unknown as SlackNotificationBuilder;
}

export function createMockSlackSender(): SlackNotificationSender {
  return {
    send: vi.fn().mockResolvedValue(undefined),
  } as unknown as SlackNotificationSender;
}

export function createMockSlackDispatcher(
  config: SlackNotificationDispatcherConfig,
  builder: SlackNotificationBuilder = createMockSlackBuilder(),
  sender: SlackNotificationSender = createMockSlackSender(),
): SlackNotificationDispatcher {
  return new SlackNotificationDispatcher(config, builder, sender);
}

export function createMockSlackDispatchers(
  configs: SlackNotificationDispatcherConfig = {
    id: "test-dispatcher",
  },
): {
  builder: SlackNotificationBuilder;
  sender: SlackNotificationSender;
  dispatcher: SlackNotificationDispatcher;
} {
  const builder = createMockSlackBuilder();
  const sender = createMockSlackSender();
  const dispatcher = new SlackNotificationDispatcher(configs, builder, sender);
  return { builder, sender, dispatcher };
}
