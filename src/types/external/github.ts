import type { components } from "@octokit/openapi-types";
import type { ISO8601 } from "@/types/utility/scalars";

export type GithubOpenAPIComponents = components;

type GithubOpenAPISchema = GithubOpenAPIComponents["schemas"];

export type GithubWebhookPayloadMap = {
  branch_protection_configuration: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-branch-protection-configuration-disabled"
    | "webhook-branch-protection-configuration-enabled"
  >];

  branch_protection_rule: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-branch-protection-rule-created"
    | "webhook-branch-protection-rule-deleted"
    | "webhook-branch-protection-rule-edited"
  >];

  check_run: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-check-run-completed"
    | "webhook-check-run-created"
    | "webhook-check-run-requested-action"
    | "webhook-check-run-rerequested"
  >];

  check_suite: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-check-suite-completed"
    | "webhook-check-suite-requested"
    | "webhook-check-suite-rerequested"
  >];

  code_scanning_alert: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-code-scanning-alert-appeared-in-branch"
    | "webhook-code-scanning-alert-closed-by-user"
    | "webhook-code-scanning-alert-created"
    | "webhook-code-scanning-alert-fixed"
    | "webhook-code-scanning-alert-reopened"
    | "webhook-code-scanning-alert-reopened-by-user"
  >]; // 'updated_assignment' is not exist in components.schemas, so ignore

  commit_comment: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-commit-comment-created"
  >];

  create: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-create">];

  custom_property: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-custom-property-created"
    | "webhook-custom-property-deleted"
    | "webhook-custom-property-promoted-to-enterprise"
    | "webhook-custom-property-updated"
  >];

  custom_property_values: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-custom-property-values-updated"
  >];

  delete: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-delete">];

  dependabot_alert: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-dependabot-alert-auto-dismissed"
    | "webhook-dependabot-alert-auto-reopened"
    | "webhook-dependabot-alert-created"
    | "webhook-dependabot-alert-dismissed"
    | "webhook-dependabot-alert-fixed"
    | "webhook-dependabot-alert-reintroduced"
    | "webhook-dependabot-alert-reopened"
  >]; // 'assignees_changed' is not exist in components.schemas, so ignore

  deploy_key: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-deploy-key-created" | "webhook-deploy-key-deleted"
  >];

  deployment: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-deployment-created">];

  deployment_protection_rule: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-deployment-protection-rule-requested"
  >];

  deployment_review: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-deployment-review-approved"
    | "webhook-deployment-review-rejected"
    | "webhook-deployment-review-requested"
  >];

  deployment_status: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-deployment-status-created"
  >];

  discussion: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-discussion-answered"
    | "webhook-discussion-category-changed"
    | "webhook-discussion-closed"
    | "webhook-discussion-created"
    | "webhook-discussion-deleted"
    | "webhook-discussion-edited"
    | "webhook-discussion-labeled"
    | "webhook-discussion-locked"
    | "webhook-discussion-pinned"
    | "webhook-discussion-reopened"
    | "webhook-discussion-transferred"
    | "webhook-discussion-unanswered"
    | "webhook-discussion-unlabeled"
    | "webhook-discussion-unlocked"
    | "webhook-discussion-unpinned"
  >];

  discussion_comment: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-discussion-comment-created"
    | "webhook-discussion-comment-deleted"
    | "webhook-discussion-comment-edited"
  >];

  fork: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-fork">];

  github_app_authorization: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-github-app-authorization-revoked"
  >];

  gollum: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-gollum">];

  installation: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-installation-created"
    | "webhook-installation-deleted"
    | "webhook-installation-new-permissions-accepted"
    | "webhook-installation-suspend"
    | "webhook-installation-unsuspend"
  >];

  installation_repositories: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-installation-repositories-added" | "webhook-installation-repositories-removed"
  >];

  installation_target: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-installation-target-renamed"
  >];

  issue_comment: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-issue-comment-created"
    | "webhook-issue-comment-deleted"
    | "webhook-issue-comment-edited"
  >]; // 'pinned' and 'unpinned' is not exist in components.schemas, so ignore

  issue_dependencies: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-issue-dependencies-blocked-by-added"
    | "webhook-issue-dependencies-blocked-by-removed"
    | "webhook-issue-dependencies-blocking-added"
    | "webhook-issue-dependencies-blocking-removed"
  >];

  issues: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-issues-assigned"
    | "webhook-issues-closed"
    | "webhook-issues-deleted"
    | "webhook-issues-demilestoned"
    | "webhook-issues-edited"
    | "webhook-issues-labeled"
    | "webhook-issues-locked"
    | "webhook-issues-milestoned"
    | "webhook-issues-opened"
    | "webhook-issues-pinned"
    | "webhook-issues-reopened"
    | "webhook-issues-transferred"
    | "webhook-issues-typed"
    | "webhook-issues-unassigned"
    | "webhook-issues-unlabeled"
    | "webhook-issues-unlocked"
    | "webhook-issues-unpinned"
    | "webhook-issues-untyped"
  >];

  label: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-label-created" | "webhook-label-deleted" | "webhook-label-edited"
  >];

  marketplace_purchase: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-marketplace-purchase-cancelled"
    | "webhook-marketplace-purchase-changed"
    | "webhook-marketplace-purchase-pending-change"
    | "webhook-marketplace-purchase-pending-change-cancelled"
    | "webhook-marketplace-purchase-purchased"
  >];

  member: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-member-added" | "webhook-member-edited" | "webhook-member-removed"
  >];

  membership: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-membership-added" | "webhook-membership-removed"
  >];

  merge_group: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-merge-group-checks-requested" | "webhook-merge-group-destroyed"
  >];

  meta: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-meta-deleted">];

  milestone: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-milestone-closed"
    | "webhook-milestone-created"
    | "webhook-milestone-deleted"
    | "webhook-milestone-edited"
    | "webhook-milestone-opened"
  >];

  org_block: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-org-block-blocked" | "webhook-org-block-unblocked"
  >];

  organization: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-organization-deleted"
    | "webhook-organization-member-added"
    | "webhook-organization-member-invited"
    | "webhook-organization-member-removed"
    | "webhook-organization-renamed"
  >];

  package: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-package-published" | "webhook-package-updated"
  >];

  page_build: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-page-build">];

  personal_access_token_request: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-personal-access-token-request-approved"
    | "webhook-personal-access-token-request-cancelled"
    | "webhook-personal-access-token-request-created"
    | "webhook-personal-access-token-request-denied"
  >];

  ping: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-ping">];

  project_card: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-project-card-converted"
    | "webhook-project-card-created"
    | "webhook-project-card-deleted"
    | "webhook-project-card-edited"
    | "webhook-project-card-moved"
  >];

  project: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-project-closed"
    | "webhook-project-created"
    | "webhook-project-deleted"
    | "webhook-project-edited"
    | "webhook-project-reopened"
  >];

  project_column: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-project-column-created"
    | "webhook-project-column-deleted"
    | "webhook-project-column-edited"
    | "webhook-project-column-moved"
  >];

  projects_v2: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-projects-v2-project-created"
    | "webhook-projects-v2-project-deleted"
    | "webhook-projects-v2-project-edited"
    | "webhook-projects-v2-project-closed"
  >]; // 'closed' -> 'deleted' ?

  projects_v2_item: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-projects-v2-item-archived"
    | "webhook-projects-v2-item-converted"
    | "webhook-projects-v2-item-created"
    | "webhook-projects-v2-item-deleted"
    | "webhook-projects-v2-item-edited"
    | "webhook-projects-v2-item-reordered"
    | "webhook-projects-v2-item-restored"
  >];

  projects_v2_status_update: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-projects-v2-status-update-created"
    | "webhook-projects-v2-status-update-deleted"
    | "webhook-projects-v2-status-update-edited"
  >];

  public: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-public">];

  pull_request: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-pull-request-assigned"
    | "webhook-pull-request-auto-merge-disabled"
    | "webhook-pull-request-auto-merge-enabled"
    | "webhook-pull-request-closed"
    | "webhook-pull-request-converted-to-draft"
    | "webhook-pull-request-demilestoned"
    | "webhook-pull-request-dequeued"
    | "webhook-pull-request-edited"
    | "webhook-pull-request-enqueued"
    | "webhook-pull-request-labeled"
    | "webhook-pull-request-locked"
    | "webhook-pull-request-milestoned"
    | "webhook-pull-request-opened"
    | "webhook-pull-request-ready-for-review"
    | "webhook-pull-request-reopened"
    | "webhook-pull-request-review-request-removed"
    | "webhook-pull-request-review-requested"
    | "webhook-pull-request-synchronize"
    | "webhook-pull-request-unassigned"
    | "webhook-pull-request-unlabeled"
    | "webhook-pull-request-unlocked"
  >];

  pull_request_review_comment: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-pull-request-review-comment-created"
    | "webhook-pull-request-review-comment-deleted"
    | "webhook-pull-request-review-comment-edited"
  >];

  pull_request_review: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-pull-request-review-dismissed"
    | "webhook-pull-request-review-edited"
    | "webhook-pull-request-review-submitted"
  >];

  pull_request_review_thread: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-pull-request-review-thread-resolved" | "webhook-pull-request-review-thread-unresolved"
  >];

  push: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-push">];

  registry_package: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-registry-package-published" | "webhook-registry-package-updated"
  >];

  release: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-release-created"
    | "webhook-release-deleted"
    | "webhook-release-edited"
    | "webhook-release-prereleased"
    | "webhook-release-published"
    | "webhook-release-released"
    | "webhook-release-unpublished"
  >];

  repository_advisory: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-repository-advisory-published" | "webhook-repository-advisory-reported"
  >];

  repository: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-repository-archived"
    | "webhook-repository-created"
    | "webhook-repository-deleted"
    | "webhook-repository-edited"
    | "webhook-repository-privatized"
    | "webhook-repository-publicized"
    | "webhook-repository-renamed"
    | "webhook-repository-transferred"
    | "webhook-repository-unarchived"
  >];

  repository_dispatch: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-repository-dispatch-sample"
  >];

  repository_import: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-repository-import"
  >];

  repository_ruleset: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-repository-ruleset-created"
    | "webhook-repository-ruleset-deleted"
    | "webhook-repository-ruleset-edited"
  >];

  repository_vulnerability_alert: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-repository-vulnerability-alert-create"
    | "webhook-repository-vulnerability-alert-dismiss"
    | "webhook-repository-vulnerability-alert-reopen"
    | "webhook-repository-vulnerability-alert-resolve"
  >]; // This event is closing down. Use the dependabot_alert event instead.

  secret_scanning_alert: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-secret-scanning-alert-created"
    | "webhook-secret-scanning-alert-publicly-leaked"
    | "webhook-secret-scanning-alert-reopened"
    | "webhook-secret-scanning-alert-resolved"
    | "webhook-secret-scanning-alert-validated"
  >]; // 'assigned' and 'unassigned' is not exist in components.schemas, so ignore

  secret_scanning_alert_location: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-secret-scanning-alert-location-created"
  >];

  secret_scanning_scan: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-secret-scanning-scan-completed"
  >];

  security_advisory: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-security-advisory-published"
    | "webhook-security-advisory-updated"
    | "webhook-security-advisory-withdrawn"
  >];

  security_and_analysis: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-security-and-analysis"
  >];

  sponsorship: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-sponsorship-cancelled"
    | "webhook-sponsorship-created"
    | "webhook-sponsorship-edited"
    | "webhook-sponsorship-pending-cancellation"
    | "webhook-sponsorship-pending-tier-change"
    | "webhook-sponsorship-tier-changed"
  >];

  star: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-star-created" | "webhook-star-deleted"
  >];

  status: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-status">];

  sub_issues: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-sub-issues-parent-issue-added"
    | "webhook-sub-issues-parent-issue-removed"
    | "webhook-sub-issues-sub-issue-added"
    | "webhook-sub-issues-sub-issue-removed"
  >];

  team_add: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-team-add">];

  team: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-team-added-to-repository"
    | "webhook-team-created"
    | "webhook-team-deleted"
    | "webhook-team-edited"
    | "webhook-team-removed-from-repository"
  >];

  watch: GithubOpenAPISchema[Extract<keyof GithubOpenAPISchema, "webhook-watch-started">];

  workflow_dispatch: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    "webhook-workflow-dispatch"
  >];

  workflow_job: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-workflow-job-completed"
    | "webhook-workflow-job-in-progress"
    | "webhook-workflow-job-queued"
    | "webhook-workflow-job-waiting"
  >];

  workflow_run: GithubOpenAPISchema[Extract<
    keyof GithubOpenAPISchema,
    | "webhook-workflow-run-completed"
    | "webhook-workflow-run-in-progress"
    | "webhook-workflow-run-requested"
  >];
};

export type GithubWebhookEventName = keyof GithubWebhookPayloadMap;

export type GithubWebhookEvent = {
  [K in GithubWebhookEventName]: {
    type: K;
    payload: GithubWebhookPayloadMap[K];
    timestamp: ISO8601;
  };
}[GithubWebhookEventName];
