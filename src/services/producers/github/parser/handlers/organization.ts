import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
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

export function parseInstallation(event: EventOf<"installation">): GithubNotificationContent {
  const { action, installation, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `GitHub App installation ${action}: ${installation.app_slug}`,
    description: null,
    url: installation.html_url,
    fields: [
      createField("Action", action, true),
      createField("App", installation.app_slug, true),
      createField("Repository Selection", installation.repository_selection, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
