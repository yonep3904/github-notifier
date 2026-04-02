import type { RGB } from "@/types/utility/scalars";

export type SystemNotificationContent = {
  type: "info" | "warning" | "error";
  color: RGB;
  title: string;
  message: string;
};

export type SystemNotificationType = SystemNotificationContent["type"];
