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

  it("parses completed check runs with their conclusion color", () => {
    const parser = new GithubWebhookParser({});
    const event = createGithubEvent("check_run", {
      action: "completed",
      check_run: {
        name: "unit tests",
        status: "completed",
        conclusion: "failure",
        head_sha: "1234567890abcdef",
        html_url: "https://github.com/acme/repo/runs/1",
        details_url: "https://ci.example.com/runs/1",
        output: {
          summary: "Two tests failed",
          annotations_count: 2,
        },
      },
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

    expect(parser.parse(event)).toMatchObject({
      type: "check_run",
      action: "completed",
      title: "Check run completed: unit tests",
      description: "Two tests failed",
      url: "https://github.com/acme/repo/runs/1",
      color: "#CF222E",
      fields: expect.arrayContaining([
        { name: "Conclusion", value: "failure", inline: true },
        { name: "SHA", value: "1234567", inline: true },
        { name: "Annotations", value: "2", inline: true },
      ]),
    });
  });

  it("parses destroyed merge groups with their reason", () => {
    const parser = new GithubWebhookParser({});
    const event = createGithubEvent("merge_group", {
      action: "destroyed",
      reason: "merged",
      merge_group: {
        head_ref: "refs/heads/gh-readonly-queue/main/pr-1",
        head_sha: "abcdef1234567890",
        base_ref: "refs/heads/main",
        base_sha: "1234567890abcdef",
        head_commit: { message: "Merge pull request #1" },
      },
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

    expect(parser.parse(event)).toMatchObject({
      type: "merge_group",
      action: "destroyed",
      title: "Merge group destroyed: refs/heads/gh-readonly-queue/main/pr-1",
      description: "Merge pull request #1",
      url: "https://github.com/acme/repo",
      color: "#8250DF",
      fields: expect.arrayContaining([
        { name: "Reason", value: "merged", inline: true },
        { name: "Base", value: "refs/heads/main", inline: true },
        { name: "SHA", value: "abcdef1", inline: true },
      ]),
    });
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
