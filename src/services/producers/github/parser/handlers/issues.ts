import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
import type { EventOf } from "../types";

export function parseDiscussion(event: EventOf<"discussion">): GithubNotificationContent {
  const { action, discussion, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Discussion ${action}: ${discussion.title}`,
    description: discussion.body,
    url: discussion.html_url,
    fields: [
      createField("Action", action, true),
      createField("Discussion #", discussion.number, true),
      createField("Category", discussion.category.name, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseDiscussionComment(
  event: EventOf<"discussion_comment">,
): GithubNotificationContent {
  const { action, comment, discussion, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Discussion comment ${action}: ${discussion.title}`,
    description: comment.body,
    url: comment.html_url,
    fields: [
      createField("Action", action, true),
      createField("Discussion #", discussion.number, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseIssueComment(event: EventOf<"issue_comment">): GithubNotificationContent {
  const payload = event.payload;
  const { action, issue, comment, repository } = payload;

  return createContent({
    event,
    action,
    title: `Issue comment ${action ?? "updated"}: ${issue.title ?? "unknown issue"}`,
    description: comment.body,
    url: comment.html_url,
    fields: [
      createField("Action", action, true),
      createField("Issue #", issue.number, true),
      createField("State", issue.state, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseIssueDependencies(
  event: EventOf<"issue_dependencies">,
): GithubNotificationContent {
  const {
    action,
    blocked_issue: blockedIssue,
    blocking_issue: blockingIssue,
    repository,
  } = event.payload;

  return createContent({
    event,
    action,
    title: `Issue dependency ${action}`,
    description: null,
    url: blockedIssue?.html_url ?? blockingIssue?.html_url ?? repository.html_url,
    fields: [
      createField("Action", action, true),
      createField(
        "Blocked Issue",
        blockedIssue ? `#${blockedIssue.number} ${blockedIssue.title}` : null,
      ),
      createField(
        "Blocking Issue",
        blockingIssue ? `#${blockingIssue.number} ${blockingIssue.title}` : null,
      ),
      createRepositoryField(repository),
    ],
  });
}

export function parseIssues(event: EventOf<"issues">): GithubNotificationContent {
  const payload = event.payload;
  const { action, issue, repository } = payload;

  return createContent({
    event,
    action,
    title: `Issue ${action ?? "updated"}: ${issue.title ?? "unknown issue"}`,
    description: issue.body,
    url: issue.html_url,
    fields: [
      createField("Action", action, true),
      createField("State", issue.state, true),
      createField("Issue #", issue.number, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseLabel(event: EventOf<"label">): GithubNotificationContent {
  const payload = event.payload;
  const { action, label, repository } = payload;

  return createContent({
    event,
    action,
    title: `Label ${action}: ${label.name}`,
    description: label.description,
    url: repository.html_url,
    fields: [
      createField("Action", action, true),
      createField("Label", label.name, true),
      createField("Color", `#${label.color}`, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseMilestone(event: EventOf<"milestone">): GithubNotificationContent {
  const payload = event.payload;
  const { action, milestone, repository } = payload;

  return createContent({
    event,
    action,
    title: `Milestone ${action}: ${milestone.title}`,
    description: milestone.description,
    url: milestone.html_url,
    fields: [
      createField("Action", action, true),
      createField("State", milestone.state, true),
      createField("Open Issues", milestone.open_issues, true),
      createField("Closed Issues", milestone.closed_issues, true),
      createField("Due On", milestone.due_on, true),
      createRepositoryField(repository),
    ],
  });
}

export function parseSubIssues(event: EventOf<"sub_issues">): GithubNotificationContent {
  const { action, parent_issue: parentIssue, sub_issue: subIssue, repository } = event.payload;

  return createContent({
    event,
    action,
    title: `Sub-issue ${action}`,
    description: null,
    url: subIssue?.html_url ?? parentIssue?.html_url ?? repository.html_url,
    fields: [
      createField("Action", action, true),
      createField(
        "Parent Issue",
        parentIssue ? `#${parentIssue.number} ${parentIssue.title}` : null,
      ),
      createField("Sub-issue", subIssue ? `#${subIssue.number} ${subIssue.title}` : null),
      createRepositoryField(repository),
    ],
  });
}
