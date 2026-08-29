import type { GithubHandlerStatusModel } from "@/services/status";
import { Badge, Card, CheckFlag } from "@/views/components/ui";
import { statusToTone } from "@/views/utils";
import { IssueList } from "./IssueList";

export interface GithubHandlerCardProps {
  handler: GithubHandlerStatusModel;
}

export function GithubHandlerCard({ handler }: GithubHandlerCardProps) {
  const hasErrors = handler.issues.some(({ severity }) => severity === "error");

  return (
    <Card
      title="GitHub Webhook"
      description={handler.endpoint}
      badges={[
        {
          label: handler.status[0]?.toUpperCase() + handler.status.slice(1),
          tone: statusToTone(handler.status),
        },
        {
          label: handler.enabled ? "Enabled" : "Disabled",
          tone: handler.enabled ? "info" : "warning",
        },
      ]}
      sections={[
        {
          title: "Security",
          content: (
            <div class="flex flex-col gap-2">
              <CheckFlag
                label={handler.secretSet ? "Secret set" : "Secret not set"}
                value={handler.secretSet}
              />
              <p class="text-sm text-stone-400">
                {handler.secretSet
                  ? "GitHub webhook secret is configured. Incoming webhook requests will be validated for authenticity."
                  : "The GitHub webhook secret is not configured, so incoming webhook requests cannot be authenticated."}
              </p>
            </div>
          ),
        },
        {
          title: "Handle Events",
          content: (
            <ul class="mt-2 flex flex-wrap items-center gap-2">
              {handler.events.map((event) => (
                <li key={event.label}>
                  <Badge
                    tone={event.selected ? "info" : "neutral"}
                    aria-label={`${event.label}: ${event.selected ? "handled" : "not handled"}`}
                  >
                    {event.label}
                  </Badge>
                </li>
              ))}
            </ul>
          ),
        },
        {
          title: "Issues",
          display: handler.issues.length > 0,
          content: <IssueList issues={handler.issues} />,
        },
      ]}
      danger={hasErrors}
    />
  );
}
