import type { Dependencies } from "@/compositions";
import { ServiceUnavailableError } from "@/errors/service";

export function assertReady(
  deps: Dependencies,
): asserts deps is Extract<Dependencies, { status: "ready" }> {
  if (deps.status === "invalid") {
    throw new ServiceUnavailableError(deps.error);
  }
}
