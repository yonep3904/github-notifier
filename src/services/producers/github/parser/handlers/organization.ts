import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField } from "../content";
import type { EventOf } from "../types";

export function parseGithubAppAuthorization(
  event: EventOf<"github_app_authorization">,
): GithubNotificationContent {
  const { action, sender } = event.payload;

  return createContent({
    event,
    action,
    title: `GitHub App authorization ${action}: ${sender.login}`,
    description: null,
    url: sender.html_url,
    fields: [createField("Action", action, true), createField("Account", sender.login, true)],
  });
}
