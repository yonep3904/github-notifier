import { Check, X } from "lucide";
import { LucideIcon } from "@/views/components/ui";

export interface CheckFlagProps {
  value: boolean;
  label: string;
}

export function CheckFlag({ value, label }: CheckFlagProps) {
  return (
    <div class="flex items-center gap-2">
      <LucideIcon
        icon={value ? Check : X}
        size={16}
        class={value ? "text-green-400" : "text-rose-400"}
      />
      <span class={`${value ? "text-green-400" : "text-rose-400"} text-sm`}>{label}</span>
    </div>
  );
}
