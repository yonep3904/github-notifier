import {
  createGithubNotification,
  createManualNotification,
} from "test/helpers/factories/notification";
import { createMockDiscordDispatchers } from "test/helpers/mocks/discord-dispatcher";

describe("DiscordNotificationDispatcher", () => {
  it("dispatches notifications from allowed sources", async () => {
    const { builder, sender, dispatcher } = createMockDiscordDispatchers({
      id: "discord-main",
      allowSources: ["github"],
    });

    const notification = createGithubNotification();
    await dispatcher.dispatch(notification);

    expect(builder.build).toHaveBeenCalledOnce();
    expect(sender.send).toHaveBeenCalledWith({ content: "payload" });
  });

  it("skips notifications from disallowed sources", async () => {
    const { builder, sender, dispatcher } = createMockDiscordDispatchers({
      id: "discord-main",
      allowSources: ["github"],
    });

    const notification = createManualNotification();
    await dispatcher.dispatch(notification);

    expect(builder.build).not.toHaveBeenCalled();
    expect(sender.send).not.toHaveBeenCalled();
  });
});
