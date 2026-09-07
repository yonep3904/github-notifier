import { Activity, BookOpen } from "lucide";
import { type Destination, HomeFooter, HomeHero, HomeNavigation } from "@/views/components/home";
import { Layout } from "@/views/components/layout";

const destinations = [
  {
    href: "/docs",
    title: "Docs",
    description: "Set up destinations, configure webhooks, and learn how to send notifications.",
    icon: BookOpen,
    accent: "text-sky-300",
    glow: "group-hover:bg-sky-400/15",
  },
  {
    href: "/status",
    title: "Status",
    description: "Review the current configuration, detected issues, and enabled integrations.",
    icon: Activity,
    accent: "text-emerald-300",
    glow: "group-hover:bg-emerald-400/15",
  },
] as const satisfies readonly Destination[];

export function HomeRootPage() {
  return (
    <Layout
      title="GitHub Notifier"
      description="Self-hosted GitHub notifications for Discord and Slack."
    >
      <div class="relative flex min-h-[calc(100vh-3rem)] items-center justify-center py-10 sm:py-16">
        <div
          aria-hidden="true"
          class="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl sm:h-120 sm:w-120"
        />
        <div
          aria-hidden="true"
          class="pointer-events-none absolute right-0 bottom-16 h-56 w-56 rounded-full bg-emerald-400/8 blur-3xl"
        />

        <div class="relative z-10 w-full max-w-4xl">
          <HomeHero />
          <HomeNavigation destinations={destinations} />
          <HomeFooter />
        </div>
      </div>
    </Layout>
  );
}
