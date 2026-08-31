import { SUPPORTED_GITHUB_EVENTS, type SupportedGithubEventName } from "@/constants/github-events";
import type { GithubWebhookEvent } from "@/types/external/github";
import type { GithubNotificationContent } from "@/types/internal/notification";
import { createConfig, type DefaultConfig } from "@/utils/create-config";
import {
  parseBranchProtectionRule,
  parseCheckRun,
  parseCheckSuite,
  parseCommitComment,
  parseCreate,
  parseDelete,
  parseDeployment,
  parseDeploymentStatus,
  parseFallback,
  parseFork,
  parseIssueComment,
  parseIssues,
  parseLabel,
  parseMember,
  parseMergeGroup,
  parseMilestone,
  parsePageBuild,
  parsePublic,
  parsePullRequest,
  parsePullRequestReview,
  parsePullRequestReviewComment,
  parsePullRequestReviewThread,
  parsePush,
  parseRelease,
  parseRepository,
  parseStatus,
  parseWatch,
  parseWorkflowJob,
  parseWorkflowRun,
} from "./handlers";

export interface GithubWebhookParserConfig {
  maxCommitLines?: number;
  maxWorkflowJobLines?: number;
}

export class GithubWebhookParser {
  private static readonly DEFAULTS: DefaultConfig<GithubWebhookParserConfig> = {
    maxCommitLines: 15,
    maxWorkflowJobLines: 10,
  };

  private readonly config: Required<GithubWebhookParserConfig>;

  private readonly supportedEventsSet = new Set<SupportedGithubEventName>(SUPPORTED_GITHUB_EVENTS);

  constructor(config: GithubWebhookParserConfig) {
    this.config = createConfig(config, GithubWebhookParser.DEFAULTS);
  }

  parse(event: GithubWebhookEvent): GithubNotificationContent | null {
    if (event.payload == null || !this.isSupportedEvent(event.type)) return null;

    switch (event.type) {
      case "branch_protection_rule":
        return parseBranchProtectionRule(event);
      case "check_run":
        return parseCheckRun(event);
      case "check_suite":
        return parseCheckSuite(event);
      case "commit_comment":
        return parseCommitComment(event);
      case "create":
        return parseCreate(event);
      case "delete":
        return parseDelete(event);
      case "deployment":
        return parseDeployment(event);
      case "deployment_status":
        return parseDeploymentStatus(event);
      case "fork":
        return parseFork(event);
      case "issue_comment":
        return parseIssueComment(event);
      case "issues":
        return parseIssues(event);
      case "label":
        return parseLabel(event);
      case "member":
        return parseMember(event);
      case "merge_group":
        return parseMergeGroup(event);
      case "milestone":
        return parseMilestone(event);
      case "page_build":
        return parsePageBuild(event);
      case "public":
        return parsePublic(event);
      case "pull_request":
        return parsePullRequest(event);
      case "pull_request_review":
        return parsePullRequestReview(event);
      case "pull_request_review_comment":
        return parsePullRequestReviewComment(event);
      case "pull_request_review_thread":
        return parsePullRequestReviewThread(event);
      case "push":
        return parsePush(event, this.config.maxCommitLines);
      case "release":
        return parseRelease(event);
      case "repository":
        return parseRepository(event);
      case "status":
        return parseStatus(event);
      case "watch":
        return parseWatch(event);
      case "workflow_job":
        return parseWorkflowJob(event, this.config.maxWorkflowJobLines);
      case "workflow_run":
        return parseWorkflowRun(event);
      default:
        return parseFallback(event);
    }
  }

  isSupportedEvent(eventName: string): eventName is SupportedGithubEventName {
    return this.supportedEventsSet.has(eventName as SupportedGithubEventName);
  }
}
