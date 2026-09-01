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

export function parseRepositoryVulnerabilityAlert(
  event: EventOf<"repository_vulnerability_alert">,
): GithubNotificationContent {
  const { action, alert, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Repository vulnerability alert ${action}: ${alert.affected_package_name}`,
    description: alert.affected_range,
    url: alert.external_reference ?? repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Package", alert.affected_package_name, true),
      createField("Severity", alert.severity, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseSecretScanningAlert(
  event: EventOf<"secret_scanning_alert">,
): GithubNotificationContent {
  const { action, alert, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Secret scanning alert ${action}: #${alert.number}`,
    description: alert.secret_type_display_name,
    url: alert.html_url,
    fields: [
      createField("Action", action, true),
      createField("Secret Type", alert.secret_type_display_name, true),
      createField("Resolution", alert.resolution, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseSecretScanningAlertLocation(
  event: EventOf<"secret_scanning_alert_location">,
): GithubNotificationContent {
  const { action = "created", alert, location, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Secret scanning alert location ${action}: #${alert.number}`,
    description: alert.secret_type_display_name,
    url: alert.html_url,
    fields: [
      createField("Action", action, true),
      createField("Location Type", location.type, true),
      createField("Secret Type", alert.secret_type_display_name, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseSecretScanningScan(
  event: EventOf<"secret_scanning_scan">,
): GithubNotificationContent {
  const {
    action,
    completed_at: completedAt,
    repository,
    source,
    started_at: startedAt,
    type,
  } = event.payload;

  return createContent({
    event,
    action,
    title: `Secret scanning scan ${action}: ${source}`,
    description: null,
    url: repository?.html_url,
    fields: [
      createField("Action", action, true),
      createField("Type", type, true),
      createField("Source", source, true),
      createField("Started At", startedAt, true),
      createField("Completed At", completedAt, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
