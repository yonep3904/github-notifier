import type { ValidateConfigResult } from "@/config";
import { StatusPageModelBuilder, StatusRenderer } from "@/services/status";
import { StatusRootPage } from "@/views/pages/status";

export interface StatusServices {
  statusRender: StatusRenderer;
}

export function createStatusServices(validation: ValidateConfigResult): StatusServices {
  const modelBuilder = new StatusPageModelBuilder(validation);
  const render = new StatusRenderer(modelBuilder, StatusRootPage);

  return {
    statusRender: render,
  };
}
