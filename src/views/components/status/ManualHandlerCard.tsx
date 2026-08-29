import { Check, X } from "lucide";
import type { ManualHandlerStatusModel } from "@/services/status";
import { Card, LucideIcon } from "@/views/components/ui";
import { statusToTone } from "@/views/utils";
import { IssueList } from "./IssueList";

export interface ManualHandlerCardProps {
  handler: ManualHandlerStatusModel;
}

export function ManualHandlerCard({ handler }: ManualHandlerCardProps) {
  const hasErrors = handler.issues.some(({ severity }) => severity === "error");

  return (
    <Card
      title="Manual notify"
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
            <div class="flex items-center gap-2">
              {handler.passwordSet ? (
                <>
                  <LucideIcon icon={Check} size={16} class="text-green-400" />
                  <span class="text-green-400 text-sm">Password set</span>
                </>
              ) : (
                <>
                  <LucideIcon icon={X} size={16} class="text-rose-400" />
                  <span class="text-rose-400 text-sm">Password not set</span>
                </>
              )}
            </div>
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
