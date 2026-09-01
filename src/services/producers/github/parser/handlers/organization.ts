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

export function parseInstallationRepositories(
  event: EventOf<"installation_repositories">,
): GithubNotificationContent {
  const {
    action,
    installation,
    repositories_added: repositoriesAdded,
    repositories_removed: repositoriesRemoved,
    repository_selection: repositorySelection,
  } = event.payload;

  return createContent({
    event,
    action,
    title: `Installation repositories ${action}`,
    description: null,
    url: installation.html_url,
    fields: [
      createField("Action", action, true),
      createField("Added", repositoriesAdded.length, true),
      createField("Removed", repositoriesRemoved.length, true),
      createField("Repository Selection", repositorySelection, true),
    ],
  });
}

export function parseInstallationTarget(
  event: EventOf<"installation_target">,
): GithubNotificationContent {
  const { account, action, target_type: targetType } = event.payload;
  const accountName = account.login ?? account.slug ?? account.name ?? "unknown account";

  return createContent({
    event,
    action,
    title: `Installation target ${action}: ${accountName}`,
    description: null,
    url: account.html_url,
    fields: [
      createField("Action", action, true),
      createField("Account", accountName, true),
      createField("Target Type", targetType, true),
    ],
  });
}

export function parseMarketplacePurchase(
  event: EventOf<"marketplace_purchase">,
): GithubNotificationContent {
  const { action, effective_date: effectiveDate, marketplace_purchase: purchase } = event.payload;

  return createContent({
    event,
    action,
    title: `Marketplace purchase ${action}: ${purchase.plan.name}`,
    description: purchase.plan.description,
    fields: [
      createField("Action", action, true),
      createField("Account", purchase.account.login, true),
      createField("Plan", purchase.plan.name, true),
      createField("Billing Cycle", purchase.billing_cycle, true),
      createField("Effective Date", effectiveDate, true),
    ],
  });
}

export function parseMembership(event: EventOf<"membership">): GithubNotificationContent {
  const { action, member, organization, repository, scope } = event.payload;
  const memberLogin = member?.login ?? "unknown member";

  return createContent({
    event,
    action,
    title: `Organization membership ${action}: ${memberLogin}`,
    description: null,
    url: member?.html_url,
    fields: [
      createField("Action", action, true),
      createField("Member", memberLogin, true),
      createField("Scope", scope, true),
      createField("Organization", organization.login, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}

export function parseOrganization(event: EventOf<"organization">): GithubNotificationContent {
  const { action, organization, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Organization ${action}: ${organization.login}`,
    description: organization.description,
    url: organization.url,
    fields: [
      createField("Action", action, true),
      createField("Organization", organization.login, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}

export function parseOrgBlock(event: EventOf<"org_block">): GithubNotificationContent {
  const { action, blocked_user: blockedUser, organization, repository } = event.payload;
  const blockedUserLogin = blockedUser?.login ?? "unknown user";

  return createContent({
    event,
    action,
    title: `Organization user ${action}: ${blockedUserLogin}`,
    description: null,
    url: blockedUser?.html_url,
    fields: [
      createField("Action", action, true),
      createField("User", blockedUserLogin, true),
      createField("Organization", organization.login, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}
