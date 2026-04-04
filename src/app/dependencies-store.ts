import type { Env } from "@/types/env";
import { createDependencies, type Dependencies } from "./dependencies";

// biome-ignore lint/complexity/noStaticOnlyClass: This class is designed to be a simple singleton store for dependencies, so it only contains static members and methods.
export class DependenciesStore {
  private static cachedEnv: Env | null = null;
  private static cachedDeps: Dependencies | null = null;

  public static get(env: Env): Dependencies {
    if (DependenciesStore.cachedEnv !== env) {
      DependenciesStore.cachedEnv = env;
      DependenciesStore.cachedDeps = createDependencies(env);
    }
    // biome-ignore lint/style/noNonNullAssertion: We ensure that cachedDeps is always set when cachedEnv is set, so this non-null assertion is safe.
    return DependenciesStore.cachedDeps!;
  }
}
