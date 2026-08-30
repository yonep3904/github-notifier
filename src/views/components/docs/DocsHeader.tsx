import type { DocsPageModel } from "@/services/docs";

export interface DocsHeaderProps {
  model: DocsPageModel;
}

export function DocsHeader({ model }: DocsHeaderProps) {
  return (
    <header class="border-stone-800 border-b pb-8">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="max-w-3xl">
          <p class="font-medium text-sky-300 text-sm">GitHub Notifier</p>
          <h1 class="mt-2 font-semibold text-3xl text-white tracking-tight sm:text-4xl">
            {model.title}
          </h1>
          <p class="mt-4 text-stone-300 leading-7">{model.introduction}</p>
        </div>
        <nav aria-label="Language" class="flex rounded-xl border border-stone-800 p-1">
          <a
            href="?lang=ja"
            lang="ja"
            aria-current={model.locale === "ja" ? "page" : undefined}
            class={`rounded-lg px-3 py-1.5 font-medium text-sm ${model.locale === "ja" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white"}`}
          >
            日本語
          </a>
          <a
            href="?lang=en"
            lang="en"
            aria-current={model.locale === "en" ? "page" : undefined}
            class={`rounded-lg px-3 py-1.5 font-medium text-sm ${model.locale === "en" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-white"}`}
          >
            English
          </a>
        </nav>
      </div>
      <dl class="mt-6 max-w-3xl rounded-2xl border border-stone-800 bg-stone-900/60 px-4 py-3 sm:flex sm:items-baseline sm:gap-4">
        <dt class="shrink-0 font-medium text-sm text-stone-400">{model.baseUrlLabel}</dt>
        <dd class="mt-1 min-w-0 break-all font-mono text-sky-200 text-sm sm:mt-0">
          {model.baseUrl}
        </dd>
      </dl>
    </header>
  );
}
