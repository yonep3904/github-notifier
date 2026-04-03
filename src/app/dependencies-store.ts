import type { Env } from "@/types/env";
import { createDependencies, type Dependencies } from "./dependencies";

// biome-ignore lint/complexity/noStaticOnlyClass: This class is designed to be a simple singleton store for dependencies, so it only contains static members and methods.
export class DependenciesStore {
  private static cached: Dependencies | null = null;

  public static get(env: Env): Dependencies {
    if (!DependenciesStore.cached) {
      DependenciesStore.cached = createDependencies(env);
    }
    return DependenciesStore.cached;
  }
}
