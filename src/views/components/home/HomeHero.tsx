export function HomeHero() {
  return (
    <header class="text-center">
      <p class="mt-6 font-medium text-sky-300 text-sm uppercase tracking-[0.2em]">
        Self-hosted notification gateway
      </p>
      <h1 class="mt-3 bg-linear-to-r from-white via-sky-100 to-emerald-200 bg-clip-text font-semibold text-4xl text-transparent tracking-tight sm:text-6xl">
        GitHub Notifier
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-base text-stone-300 leading-7 sm:text-lg sm:leading-8">
        Route GitHub events and manual notifications to Discord and Slack—on infrastructure you
        control.
      </p>
    </header>
  );
}
