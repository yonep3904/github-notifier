import type {
  GithubOpenAPIComponents,
  GithubWebhookEvent,
  GithubWebhookEventName,
} from "@/types/external/github";
import type { FieldItem, GithubNotificationContent } from "@/types/internal/notification";
import type { RGB } from "@/types/utility/scalars";
import { createConfig, type DefaultConfig } from "@/utils/create-config";
import {
  type SupportedEvent,
  type SupportedEventName,
  supportedEventList,
} from "./supported-github-events";

export type StatusColor = "success" | "pending" | "failure" | "unknown";

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

  constructor(config: GithubWebhookParserConfig) {
    this.config = createConfig(config, GithubWebhookParser.DEFAULTS);
  }

  // Set for quick lookup of supported events
  private readonly supportedEventsSet: Set<SupportedEventName> = new Set(supportedEventList);

  // Constants
  private static readonly colorMap = {
    // Base
    default: "#0969DA", // GitHub blue
    unknown: "#6E7781", // muted gray

    // Status
    success: "#2DA44E", // green
    pending: "#BF8700", // amber
    failure: "#CF222E", // red

    // Event-specific
    issue: "#0969DA",
    pr: "#8250DF", // GitHub PR purple
    push: "#1F883D",
    release: "#BC4C00",
    workflow: "#6F42C1",
    deploy: "#1A7F37",
  } as const satisfies Record<string, RGB>;

  private static readonly eventColorMap: Partial<Record<SupportedEventName, RGB>> = {
    branch_protection_rule: GithubWebhookParser.colorMap.default,
    check_suite: GithubWebhookParser.colorMap.workflow,
    // issue
    issues: GithubWebhookParser.colorMap.issue,
    issue_comment: GithubWebhookParser.colorMap.issue,
    label: GithubWebhookParser.colorMap.issue,
    milestone: GithubWebhookParser.colorMap.issue,

    // pr
    pull_request: GithubWebhookParser.colorMap.pr,
    pull_request_review: GithubWebhookParser.colorMap.pr,
    pull_request_review_comment: GithubWebhookParser.colorMap.pr,
    pull_request_review_thread: GithubWebhookParser.colorMap.pr,

    // push
    push: GithubWebhookParser.colorMap.push,

    // deploy
    deployment: GithubWebhookParser.colorMap.deploy,
    deployment_status: GithubWebhookParser.colorMap.deploy,

    // release
    release: GithubWebhookParser.colorMap.release,

    // workflow
    workflow_job: GithubWebhookParser.colorMap.workflow,
    workflow_run: GithubWebhookParser.colorMap.workflow,
  };

  parse(event: GithubWebhookEvent): GithubNotificationContent | null {
    if (event.payload == null) {
      return null;
    }

    if (!this.isSupportedEvent(event.type)) {
      return null;
    }

    switch (event.type) {
      case "branch_protection_rule":
        return this.handleBranchProtectionRule(event);
      case "check_suite":
        return this.handleCheckSuite(event);
      case "commit_comment":
        return this.handleCommitComment(event);
      case "create":
        return this.handleCreate(event);
      case "delete":
        return this.handleDelete(event);
      case "deployment":
        return this.handleDeployment(event);
      case "deployment_status":
        return this.handleDeploymentStatus(event);
      case "fork":
        return this.handleFork(event);
      case "issue_comment":
        return this.handleIssueComment(event);
      case "issues":
        return this.handleIssues(event);
      case "label":
        return this.handleLabel(event);
      case "member":
        return this.handleMember(event);
      case "milestone":
        return this.handleMilestone(event);
      case "public":
        return this.handlePublic(event);
      case "pull_request":
        return this.handlePullRequest(event);
      case "pull_request_review_comment":
        return this.handlePullRequestReviewComment(event);
      case "pull_request_review":
        return this.handlePullRequestReview(event);
      case "pull_request_review_thread":
        return this.handlePullRequestReviewThread(event);
      case "push":
        return this.handlePush(event);
      case "release":
        return this.handleRelease(event);
      case "repository":
        return this.handleRepository(event);
      case "status":
        return this.handleStatus(event);
      case "watch":
        return this.handleWatch(event);
      case "workflow_job":
        return this.handleWorkflowJob(event);
      case "workflow_run":
        return this.handleWorkflowRun(event);
      default:
        return this.handleFallback(event);
    }
  }

  /**
   * Checks if the event is supported for notification.
   * @param eventName The name of the GitHub webhook event
   * @returns True if the event is supported, false otherwise
   */
  isSupportedEvent(eventName: string): eventName is SupportedEventName {
    return this.supportedEventsSet.has(eventName as SupportedEventName);
  }

  private handleBranchProtectionRule(
    event: Extract<SupportedEvent, { type: "branch_protection_rule" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, repository, rule } = payload;

    return this.createContent({
      event,
      action,
      title: `Branch protection rule ${action}: ${rule.name}`,
      description: null,
      url: repository.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Rule", rule.name, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleCheckSuite(
    event: Extract<SupportedEvent, { type: "check_suite" }>,
  ): GithubNotificationContent | null {
    const payload = event.payload;
    const { action, check_suite: checkSuite, repository } = payload;

    if (checkSuite.status !== "completed") {
      return null;
    }

    const statusColor = this.createStateColor(checkSuite.conclusion, {
      success: "success",
      failure: "failure",
      neutral: "pending",
      cancelled: "failure",
      timed_out: "failure",
      action_required: "failure",
      stale: "pending",
      skipped: "pending",
      startup_failure: "failure",
    });

    return this.createContent({
      event,
      action,
      title: `Check suite ${action}: ${checkSuite.head_branch ?? "unknown branch"}`,
      description: null,
      url: checkSuite.check_runs_url ?? repository.html_url,
      fields: [
        this.createField("Status", checkSuite.status, true),
        this.createField("Conclusion", checkSuite.conclusion, true),
        this.createField("Branch", checkSuite.head_branch, true),
        this.createField("SHA", checkSuite.head_sha?.slice(0, 7), true),
        this.createRepositoryField(repository),
      ],
      status: statusColor,
    });
  }

  private handleCommitComment(
    event: Extract<SupportedEvent, { type: "commit_comment" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, comment, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Commit comment ${action}: ${comment.commit_id.slice(0, 7)}`,
      description: comment.body,
      url: comment.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Commit", comment.commit_id.slice(0, 7), true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleCreate(
    event: Extract<SupportedEvent, { type: "create" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const action = "create";

    const { ref, ref_type: refType, description, repository } = payload;

    return this.createContent({
      event,
      action: action,
      title: `Create ${refType}: ${ref}`,
      description: description,
      url: repository.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Ref Type", refType, true),
        this.createField("Ref", ref, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleDelete(
    event: Extract<SupportedEvent, { type: "delete" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const action = "delete";
    const { ref, ref_type: refType, repository } = payload;

    return this.createContent({
      event,
      action: action,
      title: `Delete ${refType}: ${ref}`,
      description: null,
      url: repository.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Ref Type", refType, true),
        this.createField("Ref", ref, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleDeployment(
    event: Extract<SupportedEvent, { type: "deployment" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const action = "created";
    const { deployment, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Deployment created: ${deployment.environment}`,
      description: deployment.description,
      url: repository.html_url,
      fields: [
        this.createField("Ref", deployment.ref, true),
        this.createField("SHA", deployment.sha.slice(0, 7), true),
        this.createField("Environment", deployment.environment, true),
        this.createField("Task", deployment.task, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleDeploymentStatus(
    event: Extract<SupportedEvent, { type: "deployment_status" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const action = "created";
    const { deployment, deployment_status: deploymentStatus, repository } = payload;

    const statusColor = this.createStateColor(deploymentStatus.state, {
      success: "success",
      pending: "pending",
      failure: "failure",
      error: "failure",
      inactive: "pending",
      in_progress: "pending",
      queued: "pending",
    });

    return this.createContent({
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
        this.createField("State", deploymentStatus.state, true),
        this.createField("Environment", deployment.environment, true),
        this.createField("Ref", deployment.ref, true),
        this.createField("SHA", deployment.sha.slice(0, 7), true),
        this.createRepositoryField(repository),
      ],
      status: statusColor,
    });
  }

  private handleFork(event: Extract<SupportedEvent, { type: "fork" }>): GithubNotificationContent {
    const payload = event.payload;
    const action = "fork";
    const { forkee, repository } = payload;

    return this.createContent({
      event,
      action: action,
      title: `Repository forked: ${forkee.full_name ?? "unknown repository"}`,
      description: forkee.description,
      url: forkee.html_url,
      fields: [
        this.createField("Fork", forkee.full_name ?? "unknown", true),
        this.createField("Owner", forkee.owner.login ?? "unknown", true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleIssueComment(
    event: Extract<SupportedEvent, { type: "issue_comment" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, issue, comment, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Issue comment ${action ?? "updated"}: ${issue.title ?? "unknown issue"}`,
      description: comment.body,
      url: comment.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Issue #", issue.number, true),
        this.createField("State", issue.state, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleIssues(
    event: Extract<SupportedEvent, { type: "issues" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, issue, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Issue ${action ?? "updated"}: ${issue.title ?? "unknown issue"}`,
      description: issue.body,
      url: issue.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("State", issue.state, true),
        this.createField("Issue #", issue.number, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleLabel(
    event: Extract<SupportedEvent, { type: "label" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, label, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Label ${action}: ${label.name}`,
      description: label.description,
      url: repository.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Label", label.name, true),
        this.createField("Color", `#${label.color}`, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleMember(
    event: Extract<SupportedEvent, { type: "member" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, member, repository } = payload;
    const memberLogin = member?.login ?? "unknown member";
    const memberUrl = member?.html_url ?? repository.html_url;

    return this.createContent({
      event,
      action,
      title: `Repository member ${action}: ${memberLogin}`,
      description: null,
      url: memberUrl,
      fields: [
        this.createField("Action", action, true),
        this.createField("Member", memberLogin, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleMilestone(
    event: Extract<SupportedEvent, { type: "milestone" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, milestone, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Milestone ${action}: ${milestone.title}`,
      description: milestone.description,
      url: milestone.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("State", milestone.state, true),
        this.createField("Open Issues", milestone.open_issues, true),
        this.createField("Closed Issues", milestone.closed_issues, true),
        this.createField("Due On", milestone.due_on, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handlePublic(
    event: Extract<SupportedEvent, { type: "public" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const action = "publicized";
    const { repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Repository made public: ${repository.full_name}`,
      description: repository.description,
      url: repository.html_url,
      fields: [this.createRepositoryField(repository)],
    });
  }

  private handlePullRequest(
    event: Extract<SupportedEvent, { type: "pull_request" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, pull_request: pr, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Pull request ${action ?? "updated"}: ${pr.title ?? "unknown pull request"}`,
      description: pr.body,
      url: pr.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Base", pr.base.ref, true),
        this.createField("Head", pr.head.ref, true),
        this.createField("State", pr.state, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handlePullRequestReviewThread(
    event: Extract<SupportedEvent, { type: "pull_request_review_thread" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, pull_request: pr, thread, repository } = payload;
    const commentCount = thread.comments.length;

    return this.createContent({
      event,
      action,
      title: `PR review thread ${action}: ${pr.title ?? "unknown pull request"}`,
      description: null,
      url: pr.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("PR State", pr.state, true),
        this.createField("Comments", commentCount, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handlePullRequestReviewComment(
    event: Extract<SupportedEvent, { type: "pull_request_review_comment" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, pull_request: pr, comment, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `PR review comment ${action ?? "updated"}: ${pr.title ?? "unknown pull request"}`,
      description: comment.body,
      url: comment.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("PR State", pr.state, true),
        this.createField("File", comment.path, true),
        this.createField("Line", comment.line, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handlePullRequestReview(
    event: Extract<SupportedEvent, { type: "pull_request_review" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, pull_request: pr, review, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `PR review ${action ?? "updated"}: ${pr.title ?? "unknown pull request"}`,
      description: review.body,
      url: review.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Review State", review.state, true),
        this.createField("PR State", pr.state, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handlePush(event: Extract<SupportedEvent, { type: "push" }>): GithubNotificationContent {
    const payload = event.payload;
    const action = "push";
    const { commits, ref, compare, head_commit: headCommit, repository } = payload;

    const createCommitSummary = (c: typeof commits) => {
      const commitLines = c
        .slice(0, this.config.maxCommitLines)
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

    return this.createContent({
      event,
      action: action,
      title: `Push to ${refName}`,
      description: createCommitSummary(commits),
      url: compare ?? headCommit?.url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Ref", refName, true),
        this.createField("Commits", commits.length, true),
        this.createRepositoryField(
          repository as GithubOpenAPIComponents["schemas"]["repository"], // GitHub のドキュメント通りなら GithubOpenAPIComponents['schemas']['repository'] 型のはず
        ),
      ],
    });
  }

  private handleRelease(
    event: Extract<SupportedEvent, { type: "release" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, release, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Release ${action ?? "updated"}: ${release.name ?? "unknown release"}`,
      description: release.body,
      url: release.html_url,
      fields: [
        this.createField("Action", action, true),
        this.createField("Tag", release.tag_name, true),
        this.createField("Target", release.target_commitish, true),
        this.createField("Draft", release.draft ? "yes" : "no", true),
        this.createField("Prerelease", release.prerelease ? "yes" : "no", true),
        this.createField("Author", release.author?.login, true),
        this.createRepositoryField(repository),
      ],
    });
  }

  private handleRepository(
    event: Extract<SupportedEvent, { type: "repository" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Repository ${action ?? "updated"}`,
      description: repository.description,
      url: repository.html_url,
      fields: [this.createField("Action", action, true), this.createRepositoryField(repository)],
    });
  }

  private handleStatus(
    event: Extract<SupportedEvent, { type: "status" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const action = "status";
    const { state, sha, description, target_url: targetUrl, context, repository } = payload;

    const statusColor = this.createStateColor(state, {
      success: "success",
      pending: "pending",
      failure: "failure",
      error: "failure",
    });

    return this.createContent({
      event,
      action: action,
      title: `Commit status ${state}`,
      description: description,
      url: targetUrl ?? repository.html_url,
      fields: [
        this.createField("Context", context, true),
        this.createField("SHA", sha.slice(0, 7), true),
        this.createRepositoryField(repository),
      ],
      status: statusColor,
    });
  }

  private handleWatch(
    event: Extract<SupportedEvent, { type: "watch" }>,
  ): GithubNotificationContent {
    const payload = event.payload;
    const { action, repository } = payload;

    return this.createContent({
      event,
      action,
      title: `Repository starred: ${repository.full_name}`,
      description: repository.description,
      url: repository.html_url,
      fields: [this.createField("Action", action, true), this.createRepositoryField(repository)],
    });
  }

  private handleWorkflowJob(
    event: Extract<SupportedEvent, { type: "workflow_job" }>,
  ): GithubNotificationContent | null {
    const payload = event.payload;
    const action = "workflow_job";
    const { status } = payload.workflow_job;
    if (status === "queued" || status === "in_progress") {
      return null;
    } // Only notify when the workflow job is completed (success, failure, cancelled, etc.)

    const { workflow_job: workflowJob, repository } = payload;

    const createJobSummary = (job: typeof workflowJob) => {
      const stepLines = job.steps
        .slice(0, this.config.maxWorkflowJobLines)
        .map(
          (step: { name: string; conclusion: string | null }) =>
            `- ${step.name ?? "step"}: ${step.conclusion ?? "unknown"}`,
        );
      const moreCount = job.steps.length - stepLines.length;
      return stepLines.length
        ? `${stepLines.join("\n")}${moreCount > 0 ? `\n...and ${moreCount} more steps` : ""}`
        : null;
    };

    const statusColor = this.createStateColor(workflowJob.conclusion, {
      success: "success",
      failure: "failure",
      neutral: "pending",
      cancelled: "failure",
      timed_out: "failure",
      action_required: "failure",
      skipped: "pending",
    });

    return this.createContent({
      event,
      action: action,
      title: `Workflow job: ${workflowJob.name ?? "unknown job"} ${status}`,
      description: createJobSummary(workflowJob),
      url: workflowJob.html_url,
      fields: [
        this.createField("Status", workflowJob.status, true),
        this.createField("Conclusion", workflowJob.conclusion, true),
        this.createRepositoryField(repository),
      ],
      status: statusColor,
    });
  }

  private handleWorkflowRun(
    event: Extract<SupportedEvent, { type: "workflow_run" }>,
  ): GithubNotificationContent | null {
    const payload = event.payload;
    const { action, repository, workflow_run: workflowRun, workflow } = payload;

    if (workflowRun.status !== "completed") {
      return null;
    }

    const statusColor = this.createStateColor(workflowRun.conclusion, {
      success: "success",
      failure: "failure",
      neutral: "pending",
      cancelled: "failure",
      skipped: "pending",
      timed_out: "failure",
      action_required: "failure",
      stale: "pending",
      startup_failure: "failure",
    });

    const description = "display_title" in workflowRun ? workflowRun.display_title : undefined;

    return this.createContent({
      event,
      action,
      title: `Workflow run ${action}: ${workflowRun.name ?? workflow?.name ?? "unknown workflow"}`,
      description,
      url: workflowRun.html_url,
      fields: [
        this.createField("Status", workflowRun.status, true),
        this.createField("Conclusion", workflowRun.conclusion, true),
        this.createField("Branch", workflowRun.head_branch, true),
        this.createField("Event", workflowRun.event, true),
        this.createRepositoryField(repository),
      ],
      status: statusColor,
    });
  }

  private handleFallback(event: GithubWebhookEvent): GithubNotificationContent {
    const payload = event.payload;
    const getAction = (payload: unknown): string | undefined => {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "action" in payload &&
        typeof (payload as { action?: unknown }).action === "string"
      ) {
        return (payload as { action: string }).action;
      }
      return undefined;
    };

    const action = getAction(payload);

    return this.createContent({
      event,
      action: action ?? "unknown",
      title: `GitHub event: ${event.type}`,
      description: "",
      url: undefined,
      fields: [this.createField("Action", action ?? "unknown", true)],
    });
  }

  private createStateColor<S extends string | null>(
    state: S,
    map: Record<Exclude<S, null>, StatusColor>,
  ): StatusColor {
    if (state === null) {
      return "unknown";
    }
    return map[state] ?? "unknown";
  }

  private createField(
    name: string,
    value: string | number | boolean | null | undefined,
    inline: boolean = false,
  ): FieldItem | null {
    if (value === undefined) {
      return null;
    }
    return {
      name,
      value: String(value),
      inline,
    };
  }

  private createRepositoryField(
    repository: GithubOpenAPIComponents["schemas"]["repository"],
    inline: boolean = true,
  ): FieldItem | null {
    if (repository === null) {
      return null;
    }

    const name = repository.full_name ?? "unknown repository";
    const url = repository.html_url ?? "unknown url";
    return {
      name: "Repository",
      value: `${name}\n${url}`,
      inline: inline,
    };
  }

  private createContent<E extends GithubWebhookEvent>({
    event,
    action,
    title,
    description,
    url,
    fields,
    status,
  }: {
    event: E;
    action: string;
    title: string;
    description: string | null | undefined;
    url?: string;
    fields: (FieldItem | null)[];
    status?: StatusColor;
  }): GithubNotificationContent {
    const payload = event.payload;

    const actor = payload.sender
      ? {
          login: payload.sender.login,
          url: payload.sender.html_url,
          avatarUrl: payload.sender.avatar_url,
        }
      : undefined;

    return {
      type: event.type,
      action,

      title,
      description: description ?? undefined,
      url,
      actor,
      timestamp: event.timestamp,
      color: this.resolveEventColor(event.type, status),
      fields: fields.filter((field: FieldItem | null): field is FieldItem => !!field),
    };
  }

  private resolveEventColor(event: GithubWebhookEventName, status?: StatusColor): RGB {
    if (!this.isSupportedEvent(event)) {
      return GithubWebhookParser.colorMap.unknown;
    }

    if (status !== undefined) {
      if (status === "unknown") {
        return GithubWebhookParser.colorMap.unknown;
      } else {
        return GithubWebhookParser.colorMap[status];
      }
    }
    return GithubWebhookParser.eventColorMap[event] ?? GithubWebhookParser.colorMap.default;
  }
}
