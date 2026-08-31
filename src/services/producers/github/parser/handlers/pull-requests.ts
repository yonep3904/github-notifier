import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField } from "../content";
import type { EventOf } from "../types";

export function parseMergeGroup(event: EventOf<"merge_group">): GithubNotificationContent {
  const payload = event.payload;
  const { action, merge_group: mergeGroup, repository } = payload;
  const reason = "reason" in payload ? payload.reason : undefined;

  return createContent({
    event,
    action,
    title: `Merge group ${action}: ${mergeGroup.head_ref}`,
    description: mergeGroup.head_commit.message,
    url: repository?.html_url,
    fields: [
      createField("Action", action, true),
      createField("Reason", reason, true),
      createField("Base", mergeGroup.base_ref, true),
      createField("Head", mergeGroup.head_ref, true),
      createField("SHA", mergeGroup.head_sha.slice(0, 7), true),
      repository ? createRepositoryField(repository) : null,
    ],
  });
}

export function parsePullRequest(event: EventOf<"pull_request">): GithubNotificationContent {
  const payload = event.payload;
  const { action, pull_request: pr, repository } = payload;

  return createContent({
    event,
    action,
    title: `Pull request ${action ?? "updated"}: ${pr.title ?? "unknown pull request"}`,
    description: pr.body,
    url: pr.html_url,
    fields: [
      createField("Action", action, true),
      createField("Base", pr.base.ref, true),
      createField("Head", pr.head.ref, true),
      createField("State", pr.state, true),
      createRepositoryField(repository),
    ],
  });
}

export function parsePullRequestReviewThread(
  event: EventOf<"pull_request_review_thread">,
): GithubNotificationContent {
  const payload = event.payload;
  const { action, pull_request: pr, thread, repository } = payload;
  const commentCount = thread.comments.length;

  return createContent({
    event,
    action,
    title: `PR review thread ${action}: ${pr.title ?? "unknown pull request"}`,
    description: null,
    url: pr.html_url,
    fields: [
      createField("Action", action, true),
      createField("PR State", pr.state, true),
      createField("Comments", commentCount, true),
      createRepositoryField(repository),
    ],
  });
}

export function parsePullRequestReviewComment(
  event: EventOf<"pull_request_review_comment">,
): GithubNotificationContent {
  const payload = event.payload;
  const { action, pull_request: pr, comment, repository } = payload;

  return createContent({
    event,
    action,
    title: `PR review comment ${action ?? "updated"}: ${pr.title ?? "unknown pull request"}`,
    description: comment.body,
    url: comment.html_url,
    fields: [
      createField("Action", action, true),
      createField("PR State", pr.state, true),
      createField("File", comment.path, true),
      createField("Line", comment.line, true),
      createRepositoryField(repository),
    ],
  });
}

export function parsePullRequestReview(
  event: EventOf<"pull_request_review">,
): GithubNotificationContent {
  const payload = event.payload;
  const { action, pull_request: pr, review, repository } = payload;

  return createContent({
    event,
    action,
    title: `PR review ${action ?? "updated"}: ${pr.title ?? "unknown pull request"}`,
    description: review.body,
    url: review.html_url,
    fields: [
      createField("Action", action, true),
      createField("Review State", review.state, true),
      createField("PR State", pr.state, true),
      createRepositoryField(repository),
    ],
  });
}
