import { createGithubNotification } from "test/helpers/factories/notification";
import { createMockDiscordDispatchers } from "test/helpers/mocks/discord-dispatcher";

describe("DiscordNotificationDispatcher", () => {
  it("exposes its channel ID and dispatches notifications", async () => {
    const { builder, sender, dispatcher } = createMockDiscordDispatchers({
      id: "discord-main",
    });

    const notification = createGithubNotification();
    await dispatcher.dispatch(notification);

    expect(dispatcher.id).toBe("discord-main");
    expect(builder.build).toHaveBeenCalledOnce();
    expect(sender.send).toHaveBeenCalledWith({ content: "payload" });
  });
});
