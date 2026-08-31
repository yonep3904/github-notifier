import type { SupportedGithubEventName } from "@/constants/github-events";
import type {
  GithubOpenAPIComponents,
  GithubWebhookEvent,
  GithubWebhookEventName,
} from "@/types/external/github";
import type { FieldItem, GithubNotificationContent } from "@/types/internal/notification";
import type { RGB } from "@/types/utility/scalars";

export type StatusColor = "success" | "pending" | "failure" | "unknown";

const colorMap = {
  // Base
  default: "#0969DA", // GitHub blue
  unknown: "#6E7781", // muted gray

  // Status
  success: "#2DA44E", // green
  pending: "#BF8700", // amber
  failure: "#CF222E", // red

  // Event-specific
  issue: "#0969DA",
  pr: "#8250DF", // GitHub PR purple
  push: "#1F883D",
  release: "#BC4C00",
  workflow: "#6F42C1",
  deploy: "#1A7F37",
} as const satisfies Record<string, RGB>;

const eventColorMap: Partial<Record<SupportedGithubEventName, RGB>> = {
  check_run: colorMap.workflow,
  check_suite: colorMap.workflow,

  issues: colorMap.issue,
  issue_comment: colorMap.issue,
  label: colorMap.issue,
  milestone: colorMap.issue,

  pull_request: colorMap.pr,
  pull_request_review: colorMap.pr,
  pull_request_review_comment: colorMap.pr,
  pull_request_review_thread: colorMap.pr,
  merge_group: colorMap.pr,

  push: colorMap.push,

  deployment: colorMap.deploy,
  deployment_status: colorMap.deploy,

  release: colorMap.release,

  workflow_job: colorMap.workflow,
  workflow_run: colorMap.workflow,
};

export function createStateColor<S extends string | null>(
  state: S,
  map: Record<Exclude<S, null>, StatusColor>,
): StatusColor {
  if (state === null) {
    return "unknown";
  }

  return map[state] ?? "unknown";
}

export function createField(
  name: string,
  value: string | number | boolean | null | undefined,
  inline: boolean = false,
): FieldItem | null {
  if (value === undefined) {
    return null;
  }

  return {
    name,
    value: String(value),
    inline,
  };
}

export function createRepositoryField(
  repository: GithubOpenAPIComponents["schemas"]["repository"],
  inline: boolean = true,
): FieldItem | null {
  if (repository === null) {
    return null;
  }

  const name = repository.full_name ?? "unknown repository";
  const url = repository.html_url ?? "unknown url";
  return {
    name: "Repository",
    value: `${name}\n${url}`,
    inline: inline,
  };
}

export function createContent<E extends GithubWebhookEvent>({
  event,
  action,
  title,
  description,
  url,
  fields,
  status,
}: {
  event: E;
  action: string;
  title: string;
  description: string | null | undefined;
  url?: string;
  fields: (FieldItem | null)[];
  status?: StatusColor;
}): GithubNotificationContent {
  const actor = event.payload.sender
    ? {
        login: event.payload.sender.login,
        url: event.payload.sender.html_url,
        avatarUrl: event.payload.sender.avatar_url,
      }
    : undefined;

  return {
    type: event.type,
    action,
    title,
    description: description ?? undefined,
    url,
    actor,
    timestamp: event.timestamp,
    color: resolveEventColor(event.type, status),
    fields: fields.filter((field: FieldItem | null): field is FieldItem => !!field),
  };
}

function resolveEventColor(event: GithubWebhookEventName, status?: StatusColor): RGB {
  if (status !== undefined) {
    return colorMap[status];
  }

  return eventColorMap[event as SupportedGithubEventName] ?? colorMap.default;
}
