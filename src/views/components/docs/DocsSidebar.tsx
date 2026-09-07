import type { DocsPageModel } from "@/services/docs";

export interface DocsSidebarProps {
  model: DocsPageModel;
}

export function DocsSidebar({ model }: DocsSidebarProps) {
  return (
    <aside class="lg:sticky lg:top-6">
      <details class="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 lg:hidden">
        <summary class="cursor-pointer font-semibold text-white">{model.contentsLabel}</summary>
        <div class="mt-3">
          <Contents model={model} />
        </div>
      </details>
      <div class="hidden rounded-2xl border border-stone-800 bg-stone-900/60 p-4 lg:block">
        <h2 class="mb-3 font-semibold text-stone-400 text-xs uppercase tracking-[0.18em]">
          {model.contentsLabel}
        </h2>
        <Contents model={model} />
      </div>
    </aside>
  );
}

interface ContentsProps {
  model: DocsPageModel;
}

function Contents({ model }: ContentsProps) {
  return (
    <nav aria-label={model.contentsLabel}>
      <ol class="space-y-1">
        {model.sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              class="grid grid-cols-[1.5rem_1fr] rounded-lg px-2 py-2 text-sm text-stone-300 transition hover:bg-stone-800/70 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <span aria-hidden="true" class="font-mono text-stone-600 text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
