import { useId } from "hono/jsx";
import { Copy, Terminal } from "lucide";
import { LucideIcon } from "@/views/components/ui";

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  class?: string;
}

export function CodeBlock({
  code,
  language = "txt",
  title,
  class: className = "",
}: CodeBlockProps) {
  const blockId = `code-block-${useId()}`;

  return (
    <figure
      class={`overflow-hidden rounded-2xl border border-stone-800 bg-stone-950/90 shadow-[0_16px_60px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div class="flex items-center justify-between gap-3 border-stone-800 border-b bg-stone-900/80 px-4 py-3">
        <div class="flex min-w-0 items-center gap-2 text-sm text-stone-300">
          <LucideIcon icon={Terminal} size={16} class="text-sky-300" />
          <span class="truncate font-medium">{title}</span>
          <span class="mt-0.5 rounded-full border border-stone-700 px-2 py-0.5 text-sm text-stone-400 uppercase">
            {language}
          </span>
        </div>
        <button
          type="button"
          aria-label="Copy code"
          aria-live="polite"
          data-copy-target={blockId}
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-700 bg-stone-950 px-3 py-1.5 font-medium text-stone-200 text-xs transition hover:border-sky-400 hover:text-sky-100"
        >
          <LucideIcon icon={Copy} size={14} />
          <span data-copy-label>Copy</span>
        </button>
      </div>
      <pre class="overflow-x-auto px-4 py-4 text-sm text-stone-200 leading-6">
        <code id={blockId}>{code}</code>
      </pre>
    </figure>
  );
}
