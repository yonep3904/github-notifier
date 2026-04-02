import type { PickOptional } from "@/types/utility/ts";

export type DefaultConfig<T extends object> = PickOptional<T>;

export function createConfig<T extends object>(config: T, defaults: DefaultConfig<T>): Required<T> {
  return { ...defaults, ...config } as Required<T>;
}
