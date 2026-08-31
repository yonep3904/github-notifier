import type { StatusPageModel } from "@/services/status";
import { Layout } from "@/views/components/layout";
import {
  ChannelCardList,
  GithubHandlerCard,
  IssueCard,
  ManualHandlerCard,
  MetricCard,
  StatusHero,
} from "@/views/components/status";

export interface StatusRootPageProps {
  model: StatusPageModel;
}

export function StatusRootPage({ model }: StatusRootPageProps) {
  return (
    <Layout
      title="Status | GitHub Notifier"
      description="Current configuration status for the GitHub Notifier worker."
    >
      <div class="space-y-8">
        <StatusHero hero={model.hero} />

        <section aria-label="Status overview">
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {model.metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </section>

        <section class="space-y-4" aria-labelledby="issues-heading">
          <h2 id="issues-heading" class="font-semibold text-2xl text-white tracking-tight">
            Issues
          </h2>
          <IssueCard issues={model.issues} />
        </section>

        <section class="space-y-4" aria-labelledby="handlers-heading">
          <h2 id="handlers-heading" class="font-semibold text-2xl text-white tracking-tight">
            Handlers
          </h2>
          <div class="grid gap-4 xl:grid-cols-2">
            <GithubHandlerCard handler={model.githubHandler} />
            <ManualHandlerCard handler={model.manualHandler} />
          </div>
        </section>

        <section class="space-y-4" aria-labelledby="channels-heading">
          <h2 id="channels-heading" class="font-semibold text-2xl text-white tracking-tight">
            Channels
          </h2>
          {model.channels.length > 0 ? (
            <ChannelCardList channels={model.channels} />
          ) : (
            <p class="rounded-3xl border border-stone-800 bg-stone-900/65 p-5 text-stone-300">
              No channels are configured.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}
