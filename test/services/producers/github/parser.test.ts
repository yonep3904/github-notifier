import { createGithubEvent } from "test/helpers/factories/github-event";
import { GithubWebhookParser } from "@/services/producers/github/parser";
import type { GithubWebhookEvent } from "@/types/external/github";

describe("GithubWebhookParser", () => {
  it("returns null for unsupported events", () => {
    const parser = new GithubWebhookParser({});

    const event = createGithubEvent("gollum", {
      sender: {
        login: "octocat",
        html_url: "https://github.com/octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as GithubWebhookEvent["payload"]);

    expect(parser.parse(event)).toBeNull();
  });

  it("routes supported events to their handler", () => {
    const parser = new GithubWebhookParser({});
    const event = createGithubEvent("watch", {
      action: "started",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: {
        login: "octocat",
        html_url: "https://github.com/octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as GithubWebhookEvent["payload"]);

    expect(parser.parse(event)).toMatchObject({ type: "watch", action: "started" });
  });
});
