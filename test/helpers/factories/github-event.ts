import type { GithubWebhookEvent, GithubWebhookEventName } from "@/types/external/github";

export function createGithubEvent<TName extends GithubWebhookEventName>(
  type: TName,
  payload: GithubWebhookEvent["payload"],
): Extract<GithubWebhookEvent, { type: TName }> {
  return {
    type,
    payload,
    timestamp: "2026-04-04T10:00:00.000Z",
  } as Extract<GithubWebhookEvent, { type: TName }>;
}
