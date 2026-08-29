import { type Child, useId } from "hono/jsx";
import type { Tone } from "@/views/constants";
import { Badge } from "./Badge";

export interface CardProps {
  title?: string;
  description?: string;
  badges?: { label: string; tone: Tone }[];
  sections?: {
    title: string | null;
    content: Child;
    display?: boolean;
  }[];
  danger?: boolean;
  ariaLabel?: string;
}

export function Card({
  title,
  description,
  badges,
  sections,
  danger = false,
  ariaLabel,
}: CardProps) {
  const cardId = `card-${useId()}`;
  const titleId = `${cardId}-title`;
  const descriptionId = `${cardId}-description`;
  const visibleSections = sections?.filter((section) => section.display !== false) ?? [];

  return (
    <article
      aria-label={title ? undefined : ariaLabel}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      class={`flex flex-col gap-2 rounded-3xl border p-5 ${danger ? "border-rose-500/30 bg-rose-500/8" : "border-stone-800 bg-stone-900/65"}`}
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          {title ? (
            <h3 id={titleId} class="font-semibold text-lg text-white">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p id={descriptionId} class="mt-1 text-sm text-stone-400">
              {description}
            </p>
          ) : null}
        </div>
        {badges ? (
          <ul class="flex flex-wrap gap-2" aria-label="Status">
            {badges.map((badge) => (
              <li key={badge.label}>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {visibleSections.length > 0 ? (
        <div class="mt-2 flex flex-col gap-3">
          {visibleSections.map((section, index) => {
            const sectionId = `${cardId}-section-${index}`;
            return section.title ? (
              <section key={section.title} aria-labelledby={sectionId}>
                <h4 id={sectionId} class="font-semibold text-md text-white">
                  {section.title}
                </h4>
                <div class="mt-3 ml-1">{section.content}</div>
              </section>
            ) : (
              <div key={`section-${index}`} class="mt-3 ml-1">
                {section.content}
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
