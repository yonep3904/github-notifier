import { type SupportedEventName, supportedEventList } from "@/services/producers/github";

export const allSupportedEvents: SupportedEventName[] = supportedEventList;

// TODO
export const recommendedEvents: SupportedEventName[] = [
  "issues",
  "issue_comment",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
];
