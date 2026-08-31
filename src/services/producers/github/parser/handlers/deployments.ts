import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField, createStateColor } from "../content";
import type { EventOf } from "../types";

export function parseDeployKey(event: EventOf<"deploy_key">): GithubNotificationContent {
  const { action, key, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Deploy key ${action}: ${key.title}`,
    description: null,
    url: repository.html_url,
    fields: [
      createField("Title", key.title, true),
      createField("Read Only", key.read_only, true),
      createField("Verified", key.verified, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseDeployment(event: EventOf<"deployment">): GithubNotificationContent {
  const payload = event.payload;
  const action = "created";
  const { deployment, repository } = payload;

  return createContent({
    event,
    action,
    title: `Deployment created: ${deployment.environment}`,
    description: deployment.description,
    url: repository.html_url,
    fields: [
      createField("Ref", deployment.ref, true),
      createField("SHA", deployment.sha.slice(0, 7), true),
      createField("Environment", deployment.environment, true),
      createField("Task", deployment.task, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseDeploymentProtectionRule(
  event: EventOf<"deployment_protection_rule">,
): GithubNotificationContent {
  const payload = event.payload;
  const action = payload.action ?? "requested";

  return createContent({
    event,
    action,
    title: `Deployment protection rule ${action}: ${payload.environment ?? "unknown environment"}`,
    description: null,
    url: payload.deployment_callback_url ?? payload.repository?.html_url,
    fields: [
      createField("Environment", payload.environment, true),
      createField("Event", payload.event, true),
      createField("Ref", payload.ref, true),
      createField("SHA", payload.sha?.slice(0, 7), true),
      payload.repository ? createRepositoryField(payload.repository) : null,
    ],
  });
}

export function parseDeploymentStatus(
  event: EventOf<"deployment_status">,
): GithubNotificationContent {
  const payload = event.payload;
  const action = "created";
  const { deployment, deployment_status: deploymentStatus, repository } = payload;

  const statusColor = createStateColor(deploymentStatus.state, {
    success: "success",
    pending: "pending",
    failure: "failure",
    error: "failure",
    inactive: "pending",
    in_progress: "pending",
    queued: "pending",
  });

  return createContent({
    event,
    action,
    title: `Deployment status: ${deploymentStatus.state}`,
    description: deploymentStatus.description,
    url:
      deploymentStatus.environment_url ??
      deploymentStatus.log_url ??
      deploymentStatus.target_url ??
      repository.html_url,
    fields: [
      createField("State", deploymentStatus.state, true),
      createField("Environment", deployment.environment, true),
      createField("Ref", deployment.ref, true),
      createField("SHA", deployment.sha.slice(0, 7), true),
      createRepositoryField(repository),
    ],
    status: statusColor,
  });
}
