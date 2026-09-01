import { SUPPORTED_GITHUB_EVENTS, type SupportedGithubEventName } from "@/constants/github-events";

/** Every supported GitHub webhook event. */
export const full: SupportedGithubEventName[] = [...SUPPORTED_GITHUB_EVENTS];

/** High-signal events suitable for most repositories. */
export const essential: SupportedGithubEventName[] = [
  "code_scanning_alert",
  "dependabot_alert",
  "discussion",
  "discussion_comment",
  "issues",
  "issue_comment",
  "pull_request",
  "pull_request_review",
  "push",
  "release",
  "secret_scanning_alert",
  "workflow_run",
  "deployment_status",
];

/** Essential events plus detailed development and delivery activity. */
export const standard: SupportedGithubEventName[] = [
  ...essential,
  "check_run",
  "check_suite",
  "commit_comment",
  "create",
  "delete",
  "deployment",
  "deployment_protection_rule",
  "deployment_review",
  "issue_dependencies",
  "merge_group",
  "package",
  "page_build",
  "pull_request_review_comment",
  "pull_request_review_thread",
  "registry_package",
  "repository_dispatch",
  "status",
  "sub_issues",
  "workflow_dispatch",
  "workflow_job",
];

/** Events focused on issues, discussions, pull requests, and review conversations. */
export const codeReview: SupportedGithubEventName[] = [
  "discussion",
  "discussion_comment",
  "issue_comment",
  "issue_dependencies",
  "issues",
  "label",
  "merge_group",
  "milestone",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "pull_request_review_thread",
  "sub_issues",
];

/** Events focused on checks, automation, and deployments. */
export const cicd: SupportedGithubEventName[] = [
  "check_run",
  "check_suite",
  "deploy_key",
  "deployment",
  "deployment_protection_rule",
  "deployment_review",
  "deployment_status",
  "page_build",
  "repository_dispatch",
  "status",
  "workflow_dispatch",
  "workflow_job",
  "workflow_run",
];

/** Events focused on repository administration, content, and reference changes. */
export const repositoryActivity: SupportedGithubEventName[] = [
  "branch_protection_configuration",
  "branch_protection_rule",
  "commit_comment",
  "create",
  "custom_property",
  "custom_property_values",
  "delete",
  "fork",
  "gollum",
  "member",
  "public",
  "push",
  "release",
  "repository",
  "repository_import",
  "repository_ruleset",
  "star",
  "team_add",
  "watch",
];

/** Events focused on packages and registries. */
export const packages: SupportedGithubEventName[] = ["package", "registry_package"];

/** Events focused on vulnerability alerts, advisories, secrets, and security settings. */
export const security: SupportedGithubEventName[] = [
  "code_scanning_alert",
  "dependabot_alert",
  "personal_access_token_request",
  "repository_advisory",
  "repository_vulnerability_alert",
  "secret_scanning_alert",
  "secret_scanning_alert_location",
  "secret_scanning_scan",
  "security_advisory",
  "security_and_analysis",
];

/** Events focused on organizations, GitHub Apps, teams, and access management. */
export const organizationAccess: SupportedGithubEventName[] = [
  "github_app_authorization",
  "installation",
  "installation_repositories",
  "installation_target",
  "marketplace_purchase",
  "membership",
  "org_block",
  "organization",
  "sponsorship",
  "team",
];

/** Events from classic projects and Projects v2. */
export const projects: SupportedGithubEventName[] = [
  "project",
  "project_card",
  "project_column",
  "projects_v2",
  "projects_v2_item",
  "projects_v2_status_update",
];

/** Events concerning webhook lifecycle and connectivity. */
export const webhookManagement: SupportedGithubEventName[] = ["meta", "ping"];
