import type { DocsPageModel } from "@/services/docs";
import { DocsHeader, DocsSection, DocsSidebar } from "@/views/components/docs";
import { Layout } from "@/views/components/layout";

interface DocsRootPageProps {
  model: DocsPageModel;
}

export function DocsRootPage({ model }: DocsRootPageProps) {
  return (
    <Layout lang={model.locale} title="Docs | GitHub Notifier" description={model.introduction}>
      <DocsHeader model={model} />
      <div class="mt-8 grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <DocsSidebar model={model} />
        <div class="min-w-0 space-y-12">
          {model.sections.map((section) => (
            <DocsSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
