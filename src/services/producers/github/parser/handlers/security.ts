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

export function parseDependabotAlert(
  event: EventOf<"dependabot_alert">,
): GithubNotificationContent {
  const { action, alert, repository } = event.payload;
  const packageName = alert.dependency.package?.name ?? "unknown package";

  return createContent({
    event,
    action,
    title: `Dependabot alert ${action}: ${alert.security_advisory.summary}`,
    description: packageName,
    url: alert.html_url,
    fields: [
      createField("Action", action, true),
      createField("Severity", alert.security_advisory.severity, true),
      createField("Package", packageName, true),
      createField("State", alert.state, true),
      createRepositoryField(repository),
    ],
  });
}

export function parsePersonalAccessTokenRequest(
  event: EventOf<"personal_access_token_request">,
): GithubNotificationContent {
  const { action, organization, personal_access_token_request: request } = event.payload;

  return createContent({
    event,
    action,
    title: `Personal access token request ${action}: ${request.owner.login}`,
    description: null,
    fields: [
      createField("Action", action, true),
      createField("Owner", request.owner.login, true),
      createField("Token Expired", request.token_expired, true),
      createField("Organization", organization.login, true),
    ],
  });
}

export function parseRepositoryAdvisory(
  event: EventOf<"repository_advisory">,
): GithubNotificationContent {
  const { action, repository, repository_advisory: advisory } = event.payload;

  return createContent({
    event,
    action,
    title: `Repository advisory ${action}: ${advisory.summary}`,
    description: advisory.description,
    url: advisory.html_url,
    fields: [
      createField("Action", action, true),
      createField("GHSA ID", advisory.ghsa_id, true),
      createField("Severity", advisory.severity, true),
      createRepositoryField(repository),
    ],
  });
}
