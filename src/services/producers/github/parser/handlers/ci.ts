import type { GithubNotificationContent } from "@/types/internal/notification";
import { createContent, createField, createRepositoryField, createStateColor } from "../content";
import type { EventOf } from "../types";

export function parseCheckSuite(event: EventOf<"check_suite">): GithubNotificationContent | null {
  const payload = event.payload;
  const { action, check_suite: checkSuite, repository } = payload;

  if (checkSuite.status !== "completed") {
    return null;
  }

  const statusColor = createStateColor(checkSuite.conclusion, {
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

  return createContent({
    event,
    action,
    title: `Check suite ${action}: ${checkSuite.head_branch ?? "unknown branch"}`,
    description: null,
    url: checkSuite.check_runs_url ?? repository.html_url,
    fields: [
      createField("Status", checkSuite.status, true),
      createField("Conclusion", checkSuite.conclusion, true),
      createField("Branch", checkSuite.head_branch, true),
      createField("SHA", checkSuite.head_sha?.slice(0, 7), true),
      createRepositoryField(repository),
    ],
    status: statusColor,
  });
}

export function parseCheckRun(event: EventOf<"check_run">): GithubNotificationContent {
  const payload = event.payload;
  const { action, check_run: checkRun, repository } = payload;

  const statusColor = createStateColor(checkRun.conclusion, {
    waiting: "pending",
    pending: "pending",
    startup_failure: "failure",
    stale: "pending",
    success: "success",
    failure: "failure",
    neutral: "pending",
    cancelled: "failure",
    skipped: "pending",
    timed_out: "failure",
    action_required: "failure",
  });

  return createContent({
    event,
    action: action ?? "updated",
    title: `Check run ${action ?? "updated"}: ${checkRun.name}`,
    description: checkRun.output.summary,
    url: checkRun.html_url ?? checkRun.details_url,
    fields: [
      createField("Status", checkRun.status, true),
      createField("Conclusion", checkRun.conclusion, true),
      createField("SHA", checkRun.head_sha.slice(0, 7), true),
      createField("Annotations", checkRun.output.annotations_count, true),
      createRepositoryField(repository),
    ],
    status: statusColor,
  });
}

export function parseStatus(event: EventOf<"status">): GithubNotificationContent {
  const payload = event.payload;
  const action = "status";
  const { state, sha, description, target_url: targetUrl, context, repository } = payload;

  const statusColor = createStateColor(state, {
    success: "success",
    pending: "pending",
    failure: "failure",
    error: "failure",
  });

  return createContent({
    event,
    action: action,
    title: `Commit status ${state}`,
    description: description,
    url: targetUrl ?? repository.html_url,
    fields: [
      createField("Context", context, true),
      createField("SHA", sha.slice(0, 7), true),
      createRepositoryField(repository),
    ],
    status: statusColor,
  });
}

export function parseWorkflowJob(
  event: EventOf<"workflow_job">,
  maxWorkflowJobLines: number,
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
      .slice(0, maxWorkflowJobLines)
      .map(
        (step: { name: string; conclusion: string | null }) =>
          `- ${step.name ?? "step"}: ${step.conclusion ?? "unknown"}`,
      );
    const moreCount = job.steps.length - stepLines.length;
    return stepLines.length
      ? `${stepLines.join("\n")}${moreCount > 0 ? `\n...and ${moreCount} more steps` : ""}`
      : null;
  };

  const statusColor = createStateColor(workflowJob.conclusion, {
    success: "success",
    failure: "failure",
    neutral: "pending",
    cancelled: "failure",
    timed_out: "failure",
    action_required: "failure",
    skipped: "pending",
  });

  return createContent({
    event,
    action: action,
    title: `Workflow job: ${workflowJob.name ?? "unknown job"} ${status}`,
    description: createJobSummary(workflowJob),
    url: workflowJob.html_url,
    fields: [
      createField("Status", workflowJob.status, true),
      createField("Conclusion", workflowJob.conclusion, true),
      createRepositoryField(repository),
    ],
    status: statusColor,
  });
}

export function parseWorkflowRun(event: EventOf<"workflow_run">): GithubNotificationContent | null {
  const payload = event.payload;
  const { action, repository, workflow_run: workflowRun, workflow } = payload;

  if (workflowRun.status !== "completed") {
    return null;
  }

  const statusColor = createStateColor(workflowRun.conclusion, {
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

  return createContent({
    event,
    action,
    title: `Workflow run ${action}: ${workflowRun.name ?? workflow?.name ?? "unknown workflow"}`,
    description,
    url: workflowRun.html_url,
    fields: [
      createField("Status", workflowRun.status, true),
      createField("Conclusion", workflowRun.conclusion, true),
      createField("Branch", workflowRun.head_branch, true),
      createField("Event", workflowRun.event, true),
      createRepositoryField(repository),
    ],
    status: statusColor,
  });
}
