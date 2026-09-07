import type { ConfigIssue } from "@/config";

export interface IssueListProps {
  issues: ConfigIssue[];
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <ul class="flex min-w-0 flex-col gap-3">
      {issues.map((issue) => {
        const warning = issue.severity === "warning";
        return (
          <li
            key={`${issue.severity}-${issue.path}-${issue.title}`}
            class={`min-w-0 rounded-2xl border bg-stone-950/60 p-4 ${warning ? "border-amber-500/20" : "border-rose-500/20"}`}
          >
            <div class="flex flex-wrap items-center gap-2">
              <h3
                class={`wrap-anywhere font-medium ${warning ? "text-amber-200" : "text-rose-200"}`}
              >
                {issue.title}
              </h3>
              <span
                class={`wrap-anywhere max-w-full rounded-full border px-2 py-0.5 font-mono text-xs ${warning ? "border-amber-500/30 text-amber-300" : "border-rose-500/30 text-rose-300"}`}
              >
                {issue.path}
              </span>
              <span class="text-stone-400 text-xs uppercase">{issue.severity}</span>
            </div>
            <p class="wrap-anywhere mt-2 text-sm text-stone-300">{issue.detail}</p>
            <p
              class={`wrap-anywhere mt-2 text-sm ${warning ? "text-amber-100/90" : "text-rose-100/90"}`}
            >
              {issue.fix}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
