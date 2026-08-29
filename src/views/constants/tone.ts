export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

export const toneStyles: Record<Tone, { badge: string; text: string }> = {
  neutral: {
    badge: "border-stone-700 bg-stone-900/80 text-stone-200",
    text: "text-stone-200",
  },
  success: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    text: "text-emerald-300",
  },
  warning: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    text: "text-amber-300",
  },
  danger: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    text: "text-rose-300",
  },
  info: {
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    text: "text-sky-300",
  },
};
