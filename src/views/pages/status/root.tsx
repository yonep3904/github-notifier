import type { StatusSnapshot } from "@/services/status";
import type { Config } from "@/types/config";

interface StatusRootPageProps {
  baseUrl: string;
  status: "ready" | "invalid";
  config: Config;
  snapshot: StatusSnapshot;
}

export function StatusRootPage({ baseUrl, status, snapshot }: StatusRootPageProps) {}
