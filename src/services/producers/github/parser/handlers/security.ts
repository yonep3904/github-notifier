import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
import type { EventOf } from "../types";

export function parseCodeScanningAlert(
  event: EventOf<"code_scanning_alert">,
): GithubNotificationContent {
  const { action, alert, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Code scanning alert ${action}: #${alert.number}`,
    description: alert.rule.description,
    url: alert.html_url,
    fields: [
      createField("Action", action, true),
      createField("Severity", alert.rule.severity, true),
      createField("Tool", alert.tool?.name, true),
      createField("State", alert.state, true),
      createRepositoryField(repository),
    ],
  });
}
