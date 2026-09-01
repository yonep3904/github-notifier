import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
import type { EventOf } from "../types";

export function parseProject(event: EventOf<"project">): GithubNotificationContent {
  const { action, project, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Project ${action}: ${project.name}`,
    description: project.body,
    url: project.html_url,
    fields: [
      createField("Action", action, true),
      createField("Project #", project.number, true),
      createField("State", project.state, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
