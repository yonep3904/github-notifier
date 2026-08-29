import { SUPPORTED_GITHUB_EVENTS, type SupportedGithubEventName } from "@/constants/github-events";

export const allSupportedEvents: SupportedGithubEventName[] = [...SUPPORTED_GITHUB_EVENTS];

// TODO
export const recommendedEvents: SupportedGithubEventName[] = [
  "issues",
  "issue_comment",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
];
