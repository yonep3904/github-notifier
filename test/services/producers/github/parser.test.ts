import { createGithubEvent, createGithubPayloadStub } from "test/helpers/factories/github-event";
import { SUPPORTED_GITHUB_EVENTS } from "@/constants/github-events";
import { GithubWebhookParser } from "@/services/producers/github/parser";
import type { GithubWebhookEvent } from "@/types/external/github";

describe("GithubWebhookParser", () => {
  const parser = new GithubWebhookParser({});

  it.each(SUPPORTED_GITHUB_EVENTS)("accepts and routes the %s event", (type) => {
    const event = createGithubEvent(type, createGithubPayloadStub<typeof type>());

    expect(() => parser.parse(event)).not.toThrow();
  });

  it("recognizes every registered event and rejects unknown names", () => {
    for (const eventName of SUPPORTED_GITHUB_EVENTS) {
      expect(parser.isSupportedEvent(eventName)).toBe(true);
    }
    expect(parser.isSupportedEvent("unknown_event")).toBe(false);
  });

  it("returns null for an unknown event", () => {
    const event = {
      type: "unknown_event",
      payload: createGithubPayloadStub<"push">(),
      timestamp: "2026-04-04T10:00:00.000Z",
    } as unknown as GithubWebhookEvent;

    expect(parser.parse(event)).toBeNull();
  });

  it("returns null when the payload is missing", () => {
    const event = {
      type: "push",
      payload: null,
      timestamp: "2026-04-04T10:00:00.000Z",
    } as unknown as GithubWebhookEvent;

    expect(parser.parse(event)).toBeNull();
  });

  it("passes maxCommitLines to the push handler", () => {
    const configuredParser = new GithubWebhookParser({ maxCommitLines: 1 });
    const event = createGithubEvent("push", {
      commits: [
        { id: "1111111aaaaaaa", message: "first" },
        { id: "2222222bbbbbbb", message: "second" },
      ],
      compare: "https://github.com/acme/repo/compare/base...head",
      head_commit: null,
      ref: "refs/heads/main",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: null,
    } as unknown as Parameters<typeof createGithubEvent<"push">>[1]);

    expect(configuredParser.parse(event)?.description).toBe("- 1111111: first\n...and 1 more");
  });

  it("passes maxWorkflowJobLines to the workflow job handler", () => {
    const configuredParser = new GithubWebhookParser({ maxWorkflowJobLines: 1 });
    const event = createGithubEvent("workflow_job", {
      action: "completed",
      repository: {
        full_name: "acme/repo",
        html_url: "https://github.com/acme/repo",
      },
      sender: null,
      workflow_job: {
        conclusion: "success",
        html_url: "https://github.com/acme/repo/actions/runs/1/job/1",
        name: "test",
        status: "completed",
        steps: [
          { conclusion: "success", name: "first" },
          { conclusion: "success", name: "second" },
        ],
      },
    } as unknown as Parameters<typeof createGithubEvent<"workflow_job">>[1]);

    expect(configuredParser.parse(event)?.description).toBe(
      "- first: success\n...and 1 more steps",
    );
  });
});
