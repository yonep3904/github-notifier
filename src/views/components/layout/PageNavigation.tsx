import { Activity, BookOpen } from "lucide";
import { LucideIcon } from "@/views/components/ui";

export type PageNavigationCurrent = "docs" | "status";

export interface PageNavigationProps {
  current: PageNavigationCurrent;
}

const links = [
  { href: "/docs", label: "Docs", page: "docs", icon: BookOpen },
  { href: "/status", label: "Status", page: "status", icon: Activity },
] as const;

export function PageNavigation({ current }: PageNavigationProps) {
  return (
    <nav
      aria-label="Primary navigation"
      class="mb-8 flex flex-wrap items-center justify-between gap-4 border-stone-800 border-b pb-4"
    >
      <a
        href="/"
        class="rounded-lg font-semibold text-2xl text-white tracking-tight transition hover:text-sky-200 focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-4"
      >
        GitHub Notifier
      </a>
      <div class="flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-900/60 p-1">
        {links.map(({ href, label, page, icon }) => (
          <a
            key={href}
            href={href}
            aria-current={current === page ? "page" : undefined}
            class={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium text-sm transition focus-visible:outline-2 focus-visible:outline-sky-300 ${
              current === page
                ? "bg-stone-800 text-white"
                : "text-stone-400 hover:bg-stone-800/60 hover:text-white"
            }`}
          >
            <LucideIcon icon={icon} size={15} />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
