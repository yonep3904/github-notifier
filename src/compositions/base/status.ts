import type { ResolveConfigResult } from "@/config";
import { StatusPageModelBuilder, StatusRenderer } from "@/services/status";
import { StatusRootPage } from "@/views/pages/status";

export interface StatusServices {
  statusRender: StatusRenderer;
}

export function createStatusServices(resolution: ResolveConfigResult): StatusServices {
  const modelBuilder = new StatusPageModelBuilder(resolution);
  const render = new StatusRenderer(modelBuilder, StatusRootPage);

  return {
    statusRender: render,
  };
}
