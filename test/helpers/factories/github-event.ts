import type { GithubWebhookEvent, GithubWebhookEventName } from "@/types/external/github";

type GithubEventOf<TName extends GithubWebhookEventName> = Extract<
  GithubWebhookEvent,
  { type: TName }
>;

export function createGithubEvent<TName extends GithubWebhookEventName>(
  type: TName,
  payload: GithubEventOf<TName>["payload"],
  timestamp?: string,
): GithubEventOf<TName>;
export function createGithubEvent<TName extends GithubWebhookEventName>(
  type: TName,
  payload: GithubWebhookEvent["payload"],
  timestamp?: string,
): GithubEventOf<TName>;
export function createGithubEvent<TName extends GithubWebhookEventName>(
  type: TName,
  payload: GithubWebhookEvent["payload"],
  timestamp = "2026-04-04T10:00:00.000Z",
): GithubEventOf<TName> {
  return {
    type,
    payload,
    timestamp,
  } as GithubEventOf<TName>;
}

/**
 * Creates a permissive payload for parser routing smoke tests.
 * Handler behavior tests should pass explicit payloads to createGithubEvent instead.
 */
export function createGithubPayloadStub<
  TName extends GithubWebhookEventName,
>(): GithubEventOf<TName>["payload"] {
  return createDeepStub({
    action: "updated",
    repository: {
      description: "Repository description",
      full_name: "acme/repo",
      html_url: "https://github.com/acme/repo",
    },
    sender: {
      avatar_url: "https://avatars.githubusercontent.com/u/1",
      html_url: "https://github.com/octocat",
      login: "octocat",
    },
  }) as GithubEventOf<TName>["payload"];
}

function createDeepStub(values: Record<string, unknown> = {}, path = "value"): unknown {
  const target = () => undefined;

  return new Proxy(target, {
    apply: () => createDeepStub({}, path),
    get: (_target, property) => {
      if (property === Symbol.iterator) return function* emptyIterator() {};
      if (property === Symbol.toPrimitive) return () => path;
      if (property === "length") return 0;
      if (property === "map" || property === "filter" || property === "slice") return () => [];
      if (property === "replace") return () => "main";
      if (property === "toJSON") return () => undefined;
      if (typeof property === "string" && Object.hasOwn(values, property)) return values[property];
      return createDeepStub({}, typeof property === "string" ? property : path);
    },
  });
}
