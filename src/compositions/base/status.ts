import { StatusManager, StatusRenderer } from "@/services/status";
import type { Config } from "@/types/config";
import { StatusRootPage } from "@/views/pages/status";

export interface StatusServices {
  statusRender: StatusRenderer;
}

export function createStatusServices(status: "ready" | "invalid", config: Config): StatusServices {
  const manager = new StatusManager(status, config);
  const render = new StatusRenderer(manager, StatusRootPage);

  return {
    statusRender: render,
  };
}
