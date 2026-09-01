import type { GithubWebhookEvent, GithubWebhookEventName } from "@/types/external/github";

/** Extracts the payload-bearing event variant for a webhook event name. */
export type EventOf<T extends GithubWebhookEventName> = Extract<GithubWebhookEvent, { type: T }>;
