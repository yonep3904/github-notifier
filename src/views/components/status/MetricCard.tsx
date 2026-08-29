import type { StatusMetric } from "@/services/status";
import { toneStyles } from "@/views/utils";

export interface MetricCardProps {
  metric: StatusMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <dl class="rounded-3xl border border-stone-800 bg-stone-900/65 p-5">
      <dt class="text-sm text-stone-400">{metric.label}</dt>
      <dd class={`mt-4 font-semibold text-3xl tracking-tight ${toneStyles[metric.tone].text}`}>
        {metric.value}
      </dd>
      <dd class="mt-2 text-sm text-stone-300 leading-6">{metric.detail}</dd>
    </dl>
  );
}
