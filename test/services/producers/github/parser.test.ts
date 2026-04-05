import { createGithubEvent } from "test/helpers/factories/github-event";
import { GithubWebhookParser } from "@/services/producers/github/parser";
import type { GithubWebhookEvent } from "@/types/external/github";

describe("GithubWebhookParser", () => {
  it("returns null for unsupported events", () => {
    const parser = new GithubWebhookParser({});

    const event = createGithubEvent("check_run", {
      sender: {
        login: "octocat",
        html_url: "https://github.com/octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as GithubWebhookEvent["payload"]);

    expect(parser.parse(event)).toBeNull();
  });

  it("summarizes push commits and appends an overflow marker", () => {
    const parser = new GithubWebhookParser({ maxCommitLines: 2 });

    const event = createGithubEvent("push", {
      ref: "refs/heads/main",
      compare: "https://github.com/acme/repo/compare/base...head",
      head_commit: {
        message: "head commit",
        url: "https://github.com/acme/repo/commit/3",
      },
      commits: [
        { id: "1111111aaaaaaa", message: "first commit" },
        { id: "2222222bbbbbbb", message: "second commit" },
        { id: "3333333ccccccc", message: "third commit" },
      ],
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

    const result = parser.parse(event);

    expect(result).toMatchObject({
      type: "push",
      action: "push",
      title: "Push to main",
      description: "- 1111111: first commit\n- 2222222: second commit\n...and 1 more",
      url: "https://github.com/acme/repo/compare/base...head",
      color: "#1F883D",
    });
    expect(result?.fields).toEqual(
      expect.arrayContaining([
        { name: "Commits", value: "3", inline: true },
        {
          name: "Repository",
          value: "acme/repo\nhttps://github.com/acme/repo",
          inline: true,
        },
      ]),
    );
  });

  it("returns null for workflow_run events that are not completed", () => {
    const parser = new GithubWebhookParser({});

    const event = createGithubEvent("workflow_run", {
      action: "requested",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      workflow_run: {
        status: "in_progress",
      },
      workflow: {
        name: "CI",
      },
      sender: {
        login: "octocat",
        html_url: "https://github.com/octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as GithubWebhookEvent["payload"]);

    expect(parser.parse(event)).toBeNull();
  });

  it("maps completed workflow runs to status colors and fields", () => {
    const parser = new GithubWebhookParser({});

    const event = createGithubEvent("workflow_run", {
      action: "completed",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      workflow_run: {
        status: "completed",
        conclusion: "success",
        name: "CI",
        display_title: "CI / test",
        html_url: "https://github.com/acme/repo/actions/runs/1",
        head_branch: "main",
        event: "push",
      },
      workflow: {
        name: "CI fallback",
      },
      sender: {
        login: "octocat",
        html_url: "https://github.com/octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as GithubWebhookEvent["payload"]);

    const result = parser.parse(event);

    expect(result).toMatchObject({
      type: "workflow_run",
      action: "completed",
      title: "Workflow run completed: CI",
      description: "CI / test",
      url: "https://github.com/acme/repo/actions/runs/1",
      color: "#2DA44E",
      actor: {
        login: "octocat",
      },
    });
    expect(result?.fields).toEqual(
      expect.arrayContaining([
        { name: "Status", value: "completed", inline: true },
        { name: "Conclusion", value: "success", inline: true },
        { name: "Branch", value: "main", inline: true },
        { name: "Event", value: "push", inline: true },
      ]),
    );
  });

  it("ignores queued workflow_job events", () => {
    const parser = new GithubWebhookParser({});

    const event = createGithubEvent("workflow_job", {
      workflow_job: {
        status: "queued",
      },
      sender: {
        login: "octocat",
        html_url: "https://github.com/octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
      },
    } as GithubWebhookEvent["payload"]);

    expect(parser.parse(event)).toBeNull();
  });
});
