import type { GithubWebhookEvent } from "@/types/external/github";
import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField } from "../content";

export function parseFallback(event: GithubWebhookEvent): GithubNotificationContent {
  const payload = event.payload;
  const action =
    typeof payload === "object" &&
    payload !== null &&
    "action" in payload &&
    typeof payload.action === "string"
      ? payload.action
      : "unknown";

  return createContent({
    event,
    action,
    title: `GitHub event: ${event.type}`,
    description: "",
    url: undefined,
    fields: [createField("Action", action, true)],
  });
}
