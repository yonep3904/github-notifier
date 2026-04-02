import type { GithubWebhookEvent, GithubWebhookEventName } from "@/types/external/github";

export const supportedEventList: GithubWebhookEventName[] = [
  "branch_protection_rule",
  "check_suite",
  "commit_comment",
  "create",
  "delete",
  "deployment",
  "deployment_status",
  "fork",
  "issue_comment",
  "issues",
  "label",
  "member",
  "milestone",
  "public",
  "pull_request",
  "pull_request_review_comment",
  "pull_request_review",
  "pull_request_review_thread",
  "push",
  "release",
  "repository",
  "status",
  "watch",
  "workflow_job",
  "workflow_run",
];

export type SupportedEventName = Extract<
  GithubWebhookEventName,
  (typeof supportedEventList)[number]
>;

export type SupportedEvent = Extract<GithubWebhookEvent, { type: SupportedEventName }>;
