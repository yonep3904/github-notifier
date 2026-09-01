import type { GithubWebhookEvent, GithubWebhookEventName } from "@/types/external/github";
import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";

type GithubEventOf<T extends GithubWebhookEventName> = Extract<GithubWebhookEvent, { type: T }>;

export function parsePing(event: GithubEventOf<"ping">): GithubNotificationContent {
  const { hook, hook_id: hookId, repository, zen } = event.payload;
  const action = "ping";

  return createContent({
    event,
    action,
    title: "GitHub webhook ping",
    description: zen,
    url: hook?.config.url ?? repository?.html_url,
    fields: [
      createField("Action", action, true),
      createField("Hook ID", hookId, true),
      createField("Active", hook ? (hook.active ? "yes" : "no") : undefined, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
