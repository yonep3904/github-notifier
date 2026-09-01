import type { GithubOpenAPIComponents } from "@/types/external/github";
import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
import type { EventOf } from "../types";

export function parseCustomProperty(event: EventOf<"custom_property">): GithubNotificationContent {
  const { action, definition } = event.payload;

  return createContent({
    event,
    action,
    title: `Custom property ${action}: ${definition.property_name}`,
    description: null,
    fields: [
      createField("Action", action, true),
      createField("Property", definition.property_name, true),
    ],
  });
}

export function parseCustomPropertyValues(
  event: EventOf<"custom_property_values">,
): GithubNotificationContent {
  const { action, new_property_values: propertyValues, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Custom property values ${action}: ${repository.full_name}`,
    description: null,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Properties", propertyValues.length, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseBranchProtectionConfiguration(
  event: EventOf<"branch_protection_configuration">,
): GithubNotificationContent {
  const { action, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Branch protection configuration ${action}`,
    description: null,
    url: repository.html_url,
    fields: [createField("Action", action, true), createRepositoryField(repository)],
  });
}

export function parseBranchProtectionRule(
  event: EventOf<"branch_protection_rule">,
): GithubNotificationContent {
  const payload = event.payload;
  const { action, repository, rule } = payload;

  return createContent({
    event,
    action,
    title: `Branch protection rule ${action}: ${rule.name}`,
    description: null,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Rule", rule.name, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseCommitComment(event: EventOf<"commit_comment">): GithubNotificationContent {
  const payload = event.payload;
  const { action, comment, repository } = payload;

  return createContent({
    event,
    action,
    title: `Commit comment ${action}: ${comment.commit_id.slice(0, 7)}`,
    description: comment.body,
    url: comment.html_url,
    fields: [
      createField("Action", action, true),
      createField("Commit", comment.commit_id.slice(0, 7), true),
      createRepositoryField(repository),
    ],
  });
}

export function parseCreate(event: EventOf<"create">): GithubNotificationContent {
  const payload = event.payload;
  const action = "create";

  const { ref, ref_type: refType, description, repository } = payload;

  return createContent({
    event,
    action: action,
    title: `Create ${refType}: ${ref}`,
    description: description,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Ref Type", refType, true),
      createField("Ref", ref, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseDelete(event: EventOf<"delete">): GithubNotificationContent {
  const payload = event.payload;
  const action = "delete";
  const { ref, ref_type: refType, repository } = payload;

  return createContent({
    event,
    action: action,
    title: `Delete ${refType}: ${ref}`,
    description: null,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Ref Type", refType, true),
      createField("Ref", ref, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseFork(event: EventOf<"fork">): GithubNotificationContent {
  const payload = event.payload;
  const action = "fork";
  const { forkee, repository } = payload;

  return createContent({
    event,
    action: action,
    title: `Repository forked: ${forkee.full_name ?? "unknown repository"}`,
    description: forkee.description,
    url: forkee.html_url,
    fields: [
      createField("Fork", forkee.full_name ?? "unknown", true),
      createField("Owner", forkee.owner.login ?? "unknown", true),
      createRepositoryField(repository),
    ],
  });
}

export function parseGollum(event: EventOf<"gollum">): GithubNotificationContent {
  const { pages, repository } = event.payload;
  const page = pages[0];
  const action = page?.action ?? "updated";

  return createContent({
    event,
    action,
    title: `Wiki ${action}: ${page?.title ?? "unknown page"}`,
    description: page?.summary,
    url: page?.html_url ?? repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Pages", pages.length, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseMember(event: EventOf<"member">): GithubNotificationContent {
  const payload = event.payload;
  const { action, member, repository } = payload;
  const memberLogin = member?.login ?? "unknown member";
  const memberUrl = member?.html_url ?? repository.html_url;

  return createContent({
    event,
    action,
    title: `Repository member ${action}: ${memberLogin}`,
    description: null,
    url: memberUrl,
    fields: [
      createField("Action", action, true),
      createField("Member", memberLogin, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseMeta(event: EventOf<"meta">): GithubNotificationContent {
  const { action, hook } = event.payload;

  return createContent({
    event,
    action,
    title: `Webhook ${action}`,
    description: null,
    url: hook.config.url,
    fields: [
      createField("Action", action, true),
      createField("Active", hook.active ? "yes" : "no", true),
      createField("Events", hook.events.length, true),
    ],
  });
}

export function parsePublic(event: EventOf<"public">): GithubNotificationContent {
  const payload = event.payload;
  const action = "publicized";
  const { repository } = payload;

  return createContent({
    event,
    action,
    title: `Repository made public: ${repository.full_name}`,
    description: repository.description,
    url: repository.html_url,
    fields: [createRepositoryField(repository)],
  });
}

export function parsePush(
  event: EventOf<"push">,
  maxCommitLines: number,
): GithubNotificationContent {
  const payload = event.payload;
  const action = "push";
  const { commits, ref, compare, head_commit: headCommit, repository } = payload;

  const createCommitSummary = (c: typeof commits) => {
    const commitLines = c
      .slice(0, maxCommitLines)
      .map(
        (commit: { id: string; message: string }) =>
          `- ${commit.id.slice(0, 7)}: ${commit.message ?? "no message"}`,
      );
    const moreCount = c.length - commitLines.length;
    const summary = commitLines.length
      ? `${commitLines.join("\n")}${moreCount > 0 ? `\n...and ${moreCount} more` : ""}`
      : headCommit?.message;
    return summary;
  };

  const refName = ref.replace(/refs\/heads\//, "") ?? "unknown";

  return createContent({
    event,
    action: action,
    title: `Push to ${refName}`,
    description: createCommitSummary(commits),
    url: compare ?? headCommit?.url,
    fields: [
      createField("Action", action, true),
      createField("Ref", refName, true),
      createField("Commits", commits.length, true),
      createRepositoryField(
        repository as GithubOpenAPIComponents["schemas"]["repository"], // GitHub のドキュメント通りなら GithubOpenAPIComponents['schemas']['repository'] 型のはず
      ),
    ],
  });
}

export function parseRelease(event: EventOf<"release">): GithubNotificationContent {
  const payload = event.payload;
  const { action, release, repository } = payload;

  return createContent({
    event,
    action,
    title: `Release ${action ?? "updated"}: ${release.name ?? "unknown release"}`,
    description: release.body,
    url: release.html_url,
    fields: [
      createField("Action", action, true),
      createField("Tag", release.tag_name, true),
      createField("Target", release.target_commitish, true),
      createField("Draft", release.draft ? "yes" : "no", true),
      createField("Prerelease", release.prerelease ? "yes" : "no", true),
      createField("Author", release.author?.login, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseRepository(event: EventOf<"repository">): GithubNotificationContent {
  const payload = event.payload;
  const { action, repository } = payload;

  return createContent({
    event,
    action,
    title: `Repository ${action ?? "updated"}`,
    description: repository.description,
    url: repository.html_url,
    fields: [createField("Action", action, true), createRepositoryField(repository)],
  });
}

export function parseRepositoryDispatch(
  event: EventOf<"repository_dispatch">,
): GithubNotificationContent {
  const { action, branch, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Repository dispatch: ${action}`,
    description: null,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Branch", branch, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseRepositoryImport(
  event: EventOf<"repository_import">,
): GithubNotificationContent {
  const { status, repository } = event.payload;
  const action = status;

  return createContent({
    event,
    action,
    title: `Repository import ${status}: ${repository.full_name}`,
    description: repository.description,
    url: repository.html_url,
    fields: [createField("Status", status, true), createRepositoryField(repository)],
  });
}

export function parseRepositoryRuleset(
  event: EventOf<"repository_ruleset">,
): GithubNotificationContent {
  const { action, repository, repository_ruleset: ruleset } = event.payload;

  return createContent({
    event,
    action,
    title: `Repository ruleset ${action}: ${ruleset.name}`,
    description: null,
    url: repository?.html_url,
    fields: [
      createField("Action", action, true),
      createField("Ruleset", ruleset.name, true),
      createField("Enforcement", ruleset.enforcement, true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}

export function parseStar(event: EventOf<"star">): GithubNotificationContent {
  const { action, repository, starred_at: starredAt } = event.payload;

  return createContent({
    event,
    action,
    title: `Repository star ${action}: ${repository.full_name}`,
    description: repository.description,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Starred At", typeof starredAt === "string" ? starredAt : null, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseWatch(event: EventOf<"watch">): GithubNotificationContent {
  const payload = event.payload;
  const { action, repository } = payload;

  return createContent({
    event,
    action,
    title: `Repository starred: ${repository.full_name}`,
    description: repository.description,
    url: repository.html_url,
    fields: [createField("Action", action, true), createRepositoryField(repository)],
  });
}
