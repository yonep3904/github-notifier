import type { ValidateConfigResult } from "@/config";
import { StatusManager, StatusRenderer } from "@/services/status";
import { StatusRootPage } from "@/views/pages/status";

export interface StatusServices {
  statusRender: StatusRenderer;
}

export function createStatusServices(validation: ValidateConfigResult): StatusServices {
  const manager = new StatusManager(validation);
  const render = new StatusRenderer(manager, StatusRootPage);

  return {
    statusRender: render,
  };
}
