import type { StatusHeroModel } from "@/services/status";

export interface StatusHeroProps {
  hero: StatusHeroModel;
}

export function StatusHero({ hero }: StatusHeroProps) {
  return (
    <header class="rounded-3xl border border-stone-800 bg-stone-900/70 p-6 sm:p-8">
      <div>
        <h1 class="font-semibold text-3xl text-white tracking-tight sm:text-4xl">
          {hero.headline}
        </h1>
        <p class="mt-3 max-w-3xl text-sm text-stone-300 leading-7 sm:text-base">{hero.summary}</p>
      </div>
    </header>
  );
}
