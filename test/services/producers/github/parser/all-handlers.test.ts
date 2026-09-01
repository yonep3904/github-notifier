import { createGithubEvent, createGithubPayloadStub } from "test/helpers/factories/github-event";
import { SUPPORTED_GITHUB_EVENTS } from "@/constants/github-events";
import * as handlers from "@/services/producers/github/parser/handlers";
import type { GithubWebhookEvent } from "@/types/external/github";
import type { GithubNotificationContent } from "@/types/internal/notification";

type Handler = (event: GithubWebhookEvent, limit?: number) => GithubNotificationContent | null;

describe("GitHub event handler exports", () => {
  it.each(SUPPORTED_GITHUB_EVENTS)("exports and invokes parse%s", (type) => {
    const handlerName = `parse${type
      .split("_")
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join("")}`;
    const handler = (handlers as Record<string, unknown>)[handlerName];

    expect(handler, `${handlerName} must be exported`).toBeTypeOf("function");

    const event = createGithubEvent(type, createGithubPayloadStub<typeof type>());
    const result = (handler as Handler)(event, 10);

    if (result !== null) {
      expect(result.type).toBe(type);
      expect(result.timestamp).toBe(event.timestamp);
      expect(result.fields).toBeInstanceOf(Array);
    }
  });
});
