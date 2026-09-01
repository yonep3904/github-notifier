import { createGithubEvent } from "test/helpers/factories/github-event";
import {
  createContent,
  createField,
  createRepositoryField,
  createStateColor,
} from "@/services/producers/github/parser/content";
import { parseFallback } from "@/services/producers/github/parser/handlers";
import type { GithubWebhookEvent } from "@/types/external/github";

describe("GitHub notification content helpers", () => {
  it("omits only undefined fields and stringifies other scalar values", () => {
    expect(createField("Missing", undefined)).toBeNull();
    expect(createField("Empty", null)).toEqual({ name: "Empty", value: "null", inline: false });
    expect(createField("Count", 0, true)).toEqual({ name: "Count", value: "0", inline: true });
    expect(createField("Enabled", false)).toEqual({
      name: "Enabled",
      value: "false",
      inline: false,
    });
  });

  it("creates a linked repository field and handles a null repository", () => {
    expect(createRepositoryField(null)).toBeNull();
    expect(
      createRepositoryField({
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      } as Parameters<typeof createRepositoryField>[0]),
    ).toEqual({
      name: "Repository",
      value: "acme/repo\nhttps://github.com/acme/repo",
      inline: true,
    });
  });

  it("maps known states and falls back to unknown", () => {
    const colorMap = { completed: "success", failed: "failure" } as const;

    expect(createStateColor("completed", colorMap)).toBe("success");
    expect(createStateColor("missing" as "completed", colorMap)).toBe("unknown");
    expect(createStateColor(null, colorMap)).toBe("unknown");
  });

  it("adds actor metadata, timestamp, color, and filters empty fields", () => {
    const event = createGithubEvent("watch", {
      action: "started",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: {
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/octocat",
        login: "octocat",
      },
    } as GithubWebhookEvent["payload"]);

    expect(
      createContent({
        event,
        action: "started",
        title: "Repository starred",
        description: null,
        fields: [createField("Action", "started"), null],
      }),
    ).toEqual({
      type: "watch",
      action: "started",
      title: "Repository starred",
      actor: {
        login: "octocat",
        url: "https://github.com/octocat",
        avatarUrl: "https://avatars.githubusercontent.com/u/1",
      },
      timestamp: "2026-04-04T10:00:00.000Z",
      color: "#0969DA",
      fields: [{ name: "Action", value: "started", inline: false }],
    });
  });
});

describe("parseFallback", () => {
  it("preserves a string action when parsing an unregistered event", () => {
    const event = {
      type: "unknown_event",
      payload: { action: "opened", sender: null },
      timestamp: "2026-04-04T10:00:00.000Z",
    } as unknown as GithubWebhookEvent;

    expect(parseFallback(event)).toMatchObject({
      action: "opened",
      title: "GitHub event: unknown_event",
    });
  });

  it("uses an unknown action when the payload has no string action", () => {
    const event = {
      type: "unknown_event",
      payload: { sender: null },
      timestamp: "2026-04-04T10:00:00.000Z",
    } as unknown as GithubWebhookEvent;

    expect(parseFallback(event).action).toBe("unknown");
  });
});
