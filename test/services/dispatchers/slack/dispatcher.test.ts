import { createGithubNotification } from "test/helpers/factories/notification";
import { createMockSlackDispatchers } from "test/helpers/mocks/slack-dispatcher";

describe("SlackNotificationDispatcher", () => {
  it("exposes its channel ID and dispatches notifications", async () => {
    const { builder, sender, dispatcher } = createMockSlackDispatchers({ id: "slack-main" });
    await dispatcher.dispatch(createGithubNotification());

    expect(dispatcher.id).toBe("slack-main");
    expect(builder.build).toHaveBeenCalledOnce();
    expect(sender.send).toHaveBeenCalledWith({ text: "payload" });
  });
});
