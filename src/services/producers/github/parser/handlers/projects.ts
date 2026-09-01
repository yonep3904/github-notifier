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

export function parseProjectCard(event: EventOf<"project_card">): GithubNotificationContent {
  const { action, project_card: projectCard, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Project card ${action}: ${projectCard.note ?? `#${projectCard.id}`}`,
    description: projectCard.note,
    url: projectCard.url,
    fields: [
      createField("Action", action, true),
      createField("Card ID", projectCard.id, true),
      createField("Column ID", projectCard.column_id, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}

export function parseProjectColumn(event: EventOf<"project_column">): GithubNotificationContent {
  const { action, project_column: projectColumn, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Project column ${action}: ${projectColumn.name}`,
    description: null,
    url: projectColumn.url,
    fields: [
      createField("Action", action, true),
      createField("Column", projectColumn.name, true),
      createField("Column ID", projectColumn.id, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
