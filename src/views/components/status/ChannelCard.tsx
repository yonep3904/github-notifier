import type { StatusChannelModel } from "@/services/status";
import { Badge, Card } from "@/views/components/ui";
import { statusToTone } from "@/views/utils";
import { IssueList } from "./IssueList";

export interface ChannelCardProps {
  channel: StatusChannelModel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const hasErrors = channel.issues.some(({ severity }) => severity === "error");

  return (
    <Card
      title={channel.id}
      description={`${channel.type} channel`}
      badges={[
        {
          label: channel.status[0]?.toUpperCase() + channel.status.slice(1),
          tone: statusToTone(channel.status),
        },
        {
          label: channel.enabled ? "Enabled" : "Disabled",
          tone: channel.enabled ? "info" : "warning",
        },
      ]}
      sections={[
        {
          title: "Webhook URL",
          content: (
            <p class="break-all rounded-lg bg-stone-950/90 p-3 font-mono text-sm">
              {channel.webhook ?? "not set"}
            </p>
          ),
        },
        {
          title: "Allowed sources",
          content: (
            <ul class="mt-2 flex flex-wrap gap-2">
              {channel.sources.map((source) => (
                <li key={source.label}>
                  <Badge
                    tone={source.selected ? "info" : "neutral"}
                    aria-label={`${source.label}: ${source.selected ? "allowed" : "not allowed"}`}
                  >
                    {source.label}
                  </Badge>
                </li>
              ))}
            </ul>
          ),
        },
        {
          title: "Issues",
          display: channel.issues.length > 0,
          content: <IssueList issues={channel.issues} />,
        },
      ]}
      danger={hasErrors}
    />
  );
}
