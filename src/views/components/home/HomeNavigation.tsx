import { ChevronRight, type IconNode } from "lucide";
import { LucideIcon } from "@/views/components/ui";

export type Destination = {
  href: string;
  title: string;
  description: string;
  icon: IconNode;
  accent: string;
  glow: string;
};

export interface HomeNavigationProps {
  destinations: readonly Destination[];
}

export function HomeNavigation({ destinations }: HomeNavigationProps) {
  return (
    <nav aria-label="Application" class="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2">
      {destinations.map((destination) => (
        <DestinationCard key={destination.href} {...destination} />
      ))}
    </nav>
  );
}

interface DestinationCardProps extends Destination {}

function DestinationCard({ href, title, description, icon, accent, glow }: DestinationCardProps) {
  return (
    <a
      href={href}
      class="group rounded-3xl bg-linear-to-br from-sky-400/60 via-cyan-400/20 to-emerald-400/60 p-px shadow-[0_18px_70px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_80px_rgba(14,165,233,0.13)] focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-4"
    >
      <span class="flex h-full min-w-0 items-center gap-4 rounded-[calc(1.5rem-1px)] bg-stone-950/95 p-5 sm:p-6">
        <span
          class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-700/70 bg-stone-900 transition-colors ${accent} ${glow}`}
        >
          <LucideIcon icon={icon} size={23} strokeWidth={1.8} />
        </span>
        <span class="min-w-0 flex-1 text-left">
          <span class="block font-semibold text-white text-xl">{title}</span>
          <span class="mt-1 block text-sm text-stone-400 leading-6">{description}</span>
        </span>
        <LucideIcon
          icon={ChevronRight}
          size={21}
          class="shrink-0 text-stone-500 transition group-hover:translate-x-1 group-hover:text-sky-200"
        />
      </span>
    </a>
  );
}
