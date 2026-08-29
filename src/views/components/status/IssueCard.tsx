import type { ConfigIssue } from "@/config";
import { Card } from "@/views/components/ui";
import { IssueList } from "./IssueList";

export interface IssueCardProps {
  issues: ConfigIssue[];
}

export function IssueCard({ issues }: IssueCardProps) {
  const haveIssues = issues.length > 0;
  const hasErrors = issues.some(({ severity }) => severity === "error");

  return (
    <Card
      ariaLabel="Configuration issues"
      description={
        haveIssues
          ? "The following issues were detected. Errors must be fixed; warnings are recommendations and do not prevent notifications."
          : "Your configuration looks good. There are no detected issues."
      }
      sections={[
        {
          title: null,
          display: haveIssues,
          content: <IssueList issues={issues} />,
        },
      ]}
      danger={hasErrors}
    />
  );
}
