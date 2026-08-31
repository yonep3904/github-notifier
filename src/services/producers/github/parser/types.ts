import type { SupportedGithubEventName } from "@/constants/github-events";
import type { GithubWebhookEvent } from "@/types/external/github";

export type SupportedEvent = Extract<GithubWebhookEvent, { type: SupportedGithubEventName }>;

export type EventOf<T extends SupportedGithubEventName> = Extract<SupportedEvent, { type: T }>;
