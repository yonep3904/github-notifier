import { createGithubEvent } from "test/helpers/factories/github-event";
import {
  parseCheckRun,
  parseDeployKey,
  parseDeploymentProtectionRule,
  parseDeploymentReview,
  parseMergeGroup,
  parsePackage,
  parsePageBuild,
  parsePush,
  parseRegistryPackage,
  parseWorkflowDispatch,
  parseWorkflowJob,
  parseWorkflowRun,
} from "@/services/producers/github/parser/handlers";
import type { GithubWebhookEvent } from "@/types/external/github";

describe("GitHub event handlers", () => {
  it("parses registry package events", () => {
    const event = createGithubEvent("registry_package", {
      action: "published",
      registry_package: {
        name: "container",
        namespace: "acme",
        ecosystem: "container",
        package_type: "container",
        description: "Application image",
        html_url: "https://github.com/acme/packages/container/1",
        package_version: { version: "sha-1234567" },
      },
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: { login: "octocat" },
    } as unknown as GithubWebhookEvent["payload"]);

    expect(parseRegistryPackage(event)).toMatchObject({
      type: "registry_package",
      action: "published",
      title: "Registry package published: container",
      description: "Application image",
      fields: expect.arrayContaining([
        { name: "Type", value: "container", inline: true },
        { name: "Version", value: "sha-1234567", inline: true },
      ]),
    });
  });

  it("parses package events", () => {
    const event = createGithubEvent("package", {
      action: "published",
      package: {
        name: "github-notifier",
        namespace: "acme",
        ecosystem: "npm",
        package_type: "npm",
        description: "GitHub notifications",
        html_url: "https://github.com/acme/github-notifier/packages/1",
        package_version: { version: "1.2.3" },
      },
      repository: {
        full_name: "acme/github-notifier",
        html_url: "https://github.com/acme/github-notifier",
      },
      sender: { login: "octocat" },
    } as unknown as GithubWebhookEvent["payload"]);

    expect(parsePackage(event)).toMatchObject({
      type: "package",
      action: "published",
      title: "Package published: github-notifier",
      description: "GitHub notifications",
      fields: expect.arrayContaining([
        { name: "Ecosystem", value: "npm", inline: true },
        { name: "Version", value: "1.2.3", inline: true },
      ]),
    });
  });

  it("parses deployment reviews", () => {
    const event = createGithubEvent("deployment_review", {
      action: "approved",
      comment: "Approved for production",
      workflow_run: {
        display_title: "Deploy production",
        name: "Deploy",
        status: "in_progress",
        conclusion: null,
        html_url: "https://github.com/acme/repo/actions/runs/1",
      },
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: { login: "octocat" },
    } as unknown as GithubWebhookEvent["payload"]);

    expect(parseDeploymentReview(event)).toMatchObject({
      type: "deployment_review",
      action: "approved",
      title: "Deployment review approved: Deploy production",
      description: "Approved for production",
      url: "https://github.com/acme/repo/actions/runs/1",
      fields: expect.arrayContaining([
        { name: "Workflow", value: "Deploy", inline: true },
        { name: "Status", value: "in_progress", inline: true },
      ]),
    });
  });

  it("parses deployment protection rule requests", () => {
    const event = createGithubEvent("deployment_protection_rule", {
      action: "requested",
      environment: "production",
      event: "push",
      ref: "refs/heads/main",
      sha: "1234567890abcdef",
      deployment_callback_url: "https://api.github.com/deployments/callback",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: { login: "octocat" },
    } as GithubWebhookEvent["payload"]);

    expect(parseDeploymentProtectionRule(event)).toMatchObject({
      type: "deployment_protection_rule",
      action: "requested",
      title: "Deployment protection rule requested: production",
      url: "https://api.github.com/deployments/callback",
      fields: expect.arrayContaining([
        { name: "Environment", value: "production", inline: true },
        { name: "SHA", value: "1234567", inline: true },
      ]),
    });
  });

  it("parses deploy key events", () => {
    const event = createGithubEvent("deploy_key", {
      action: "created",
      key: { title: "production", read_only: true, verified: true },
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: { login: "octocat" },
    } as GithubWebhookEvent["payload"]);

    expect(parseDeployKey(event)).toMatchObject({
      type: "deploy_key",
      action: "created",
      title: "Deploy key created: production",
      fields: expect.arrayContaining([
        { name: "Read Only", value: "true", inline: true },
        { name: "Verified", value: "true", inline: true },
      ]),
    });
  });

  it("parses workflow dispatches", () => {
    const event = createGithubEvent("workflow_dispatch", {
      workflow: "deploy.yml",
      ref: "main",
      inputs: { environment: "production" },
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: { login: "octocat" },
    } as unknown as GithubWebhookEvent["payload"]);

    expect(parseWorkflowDispatch(event)).toMatchObject({
      type: "workflow_dispatch",
      action: "dispatched",
      title: "Workflow dispatched: deploy.yml",
      description: '{\n  "environment": "production"\n}',
      fields: expect.arrayContaining([
        { name: "Workflow", value: "deploy.yml", inline: true },
        { name: "Ref", value: "main", inline: true },
      ]),
    });
  });

  it("parses page builds", () => {
    const event = createGithubEvent("page_build", {
      build: {
        status: "built",
        commit: "1234567890abcdef",
        duration: 1250,
        error: { message: null },
        url: "https://api.github.com/repos/acme/repo/pages/builds/1",
      },
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: { login: "octocat" },
    } as GithubWebhookEvent["payload"]);

    expect(parsePageBuild(event)).toMatchObject({
      type: "page_build",
      action: "built",
      title: "Page build built",
      url: "https://api.github.com/repos/acme/repo/pages/builds/1",
      fields: expect.arrayContaining([
        { name: "Commit", value: "1234567", inline: true },
        { name: "Duration", value: "1250 ms", inline: true },
      ]),
    });
  });

  it("parses completed check runs with their conclusion color", () => {
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

    expect(parseCheckRun(event)).toMatchObject({
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

    expect(parseMergeGroup(event)).toMatchObject({
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

    const result = parsePush(event, 2);

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

    expect(parseWorkflowRun(event)).toBeNull();
  });

  it("maps completed workflow runs to status colors and fields", () => {
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

    const result = parseWorkflowRun(event);

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

    expect(parseWorkflowJob(event, 10)).toBeNull();
  });
});
