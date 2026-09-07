import { Cloud, Flame } from "lucide";
import { METADATA } from "@/constants/metadata";
import { LucideIcon } from "@/views/components/ui";

export function HomeFooter() {
  return (
    <footer class="mt-10 flex flex-col items-center justify-between gap-4 border-stone-800/80 border-t pt-6 text-stone-500 text-xs sm:flex-row">
      <p class="inline-flex items-center gap-2">
        <LucideIcon icon={Cloud} size={15} />
        <span>Powered by Cloudflare Workers and Hono</span>
        <LucideIcon icon={Flame} size={15} />
      </p>
      <a
        href={METADATA.repLink}
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-2 rounded-lg text-stone-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-4"
      >
        <img
          src="/images/github_icon.svg"
          alt=""
          width={20}
          height={20}
          class="inline-block opacity-60"
          aria-hidden="true"
        />
        <span>View repository</span>
      </a>
    </footer>
  );
}
