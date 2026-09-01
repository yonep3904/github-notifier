import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
import type { EventOf } from "../types";

export function parsePackage(event: EventOf<"package">): GithubNotificationContent {
  const { action, package: packageInfo, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Package ${action}: ${packageInfo.name}`,
    description: packageInfo.description,
    url: packageInfo.html_url,
    fields: [
      createField("Namespace", packageInfo.namespace, true),
      createField("Ecosystem", packageInfo.ecosystem, true),
      createField("Type", packageInfo.package_type, true),
      createField("Version", packageInfo.package_version?.version, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}

export function parseRegistryPackage(
  event: EventOf<"registry_package">,
): GithubNotificationContent {
  const { action, registry_package: packageInfo, repository } = event.payload;
  const description = typeof packageInfo.description === "string" ? packageInfo.description : null;

  return createContent({
    event,
    action,
    title: `Registry package ${action}: ${packageInfo.name}`,
    description,
    url: packageInfo.html_url,
    fields: [
      createField("Namespace", packageInfo.namespace, true),
      createField("Ecosystem", packageInfo.ecosystem, true),
      createField("Type", packageInfo.package_type, true),
      createField("Version", packageInfo.package_version?.version, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
