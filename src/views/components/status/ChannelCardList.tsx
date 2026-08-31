import type { StatusChannelModel } from "@/services/status";
import { ChannelCard } from "./ChannelCard";

export interface ChannelCardListProps {
  channels: StatusChannelModel[];
}

export function ChannelCardList({ channels }: ChannelCardListProps) {
  const disabledChannelCount = channels.filter(({ enabled }) => !enabled).length;
  const hasEnabledChannels = channels.some(({ enabled }) => enabled);

  return (
    <div class="channel-card-list space-y-4">
      {disabledChannelCount > 0 ? (
        <label class="inline-flex cursor-pointer select-none items-center gap-3 rounded-xl text-sm text-stone-300">
          <input type="checkbox" aria-controls="channel-cards" class="peer sr-only" />
          <span
            aria-hidden="true"
            class="relative h-6 w-11 rounded-full bg-stone-700 transition-colors after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-sky-500 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-300 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-stone-950"
          />
          <span>
            Show disabled channels
            <span class="ml-1 text-stone-500">({disabledChannelCount})</span>
          </span>
        </label>
      ) : null}

      {!hasEnabledChannels ? (
        <p class="channel-card-list-empty rounded-3xl border border-stone-800 bg-stone-900/65 p-5 text-stone-300">
          No enabled channels are configured.
        </p>
      ) : null}

      <div id="channel-cards" class="grid gap-4">
        {channels.map((channel, index) => (
          <div
            key={`${channel.id}-${index}`}
            class={channel.enabled ? undefined : "channel-card-disabled"}
          >
            <ChannelCard channel={channel} />
          </div>
        ))}
      </div>
    </div>
  );
}
