import type { DocsArticle, DocsBlock, DocsSectionModel } from "@/services/docs";
import { CodeBlock } from "@/views/components/ui";

export interface DocsSectionProps {
  section: DocsSectionModel;
}

export function DocsSection({ section }: { section: DocsSectionModel }) {
  const headingId = `${section.id}-heading`;
  return (
    <section id={section.id} aria-labelledby={headingId} class="scroll-mt-8">
      <header class="border-stone-800 border-b pb-4">
        <h2 id={headingId} class="font-semibold text-2xl text-white tracking-tight">
          {section.title}
        </h2>
        {section.description ? (
          <p class="mt-2 max-w-3xl text-sm text-stone-400 leading-7">{section.description}</p>
        ) : null}
      </header>
      <div class="mt-6 space-y-6">
        {section.blocks.map((block, index) => (
          <DocsBlockView key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}

interface DocsBlockViewProps {
  block: DocsBlock;
}

function DocsBlockView({ block }: DocsBlockViewProps) {
  switch (block.type) {
    case "steps":
      return (
        <ol class="space-y-4">
          {block.items.map((item, index) => (
            <li
              key={item.title}
              class="grid gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-5 sm:grid-cols-[2rem_minmax(0,1fr)]"
            >
              <span
                aria-hidden="true"
                class="flex h-8 w-8 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 font-semibold text-sky-200 text-sm"
              >
                {index + 1}
              </span>
              <ArticleContent article={item} />
            </li>
          ))}
        </ol>
      );
    case "cards":
      return (
        <div class={`grid gap-4 ${block.columns === 2 ? "md:grid-cols-2" : ""}`}>
          {block.items.map((item) => (
            <article
              key={item.title}
              class="rounded-2xl border border-stone-800 bg-stone-900/60 p-5"
            >
              <ArticleContent article={item} />
            </article>
          ))}
        </div>
      );
    case "table":
      return (
        <div class="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900/60">
          <table class="w-full min-w-152 border-collapse text-left text-sm">
            <caption class="sr-only">{block.label}</caption>
            <thead class="bg-stone-900/90 text-stone-200">
              <tr>
                {block.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    class="border-stone-800 border-b px-4 py-3 font-semibold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody class="text-stone-300">
              {block.rows.map((row) => (
                <tr key={row[0]} class="border-stone-800 border-b last:border-b-0">
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th
                        key={cell}
                        scope="row"
                        class="px-4 py-3 font-medium font-mono text-sky-200"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td key={`${row[0]}-${index}`} class="px-4 py-3 leading-6">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "note":
      return (
        <aside
          aria-label={block.title}
          class={`rounded-2xl border p-5 ${block.tone === "warning" ? "border-amber-500/30 bg-amber-500/8" : "border-sky-500/30 bg-sky-500/8"}`}
        >
          <h3 class="font-semibold text-white">{block.title}</h3>
          <p class="mt-2 text-sm text-stone-300 leading-7">{block.body}</p>
        </aside>
      );
  }
}

interface ArticleContentProps {
  article: DocsArticle;
}

function ArticleContent({ article }: ArticleContentProps) {
  return (
    <div class="min-w-0">
      <h3 class="font-semibold text-lg text-white">{article.title}</h3>
      <div class="mt-2 space-y-2 text-sm text-stone-300 leading-7">
        {article.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {article.codeSamples?.map((sample) => (
        <CodeBlock
          key={sample.title}
          code={sample.code}
          language={sample.language}
          title={sample.title}
          class="mt-4"
        />
      ))}
    </div>
  );
}
