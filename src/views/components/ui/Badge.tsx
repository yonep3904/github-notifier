import type { JSX } from "hono/jsx";
import { type Tone, toneStyles } from "@/views/constants";

export type BadgeProps = JSX.IntrinsicElements["span"] & {
  tone?: Tone;
};

export function Badge({ children, tone = "neutral", class: className = "", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      class={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium text-xs tracking-wide ${toneStyles[tone].badge} ${className}`}
    >
      {children}
    </span>
  );
}
