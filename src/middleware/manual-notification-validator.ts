import { validator } from "hono/validator";
import { manualNotifyRequestSchema } from "@/schemas/notify";

export const manualNotificationValidator = validator("json", (value, c) => {
  const result = manualNotifyRequestSchema.safeParse(value);
  if (!result.success) {
    return c.json({ ok: false, error: "invalid_request" }, 400);
  }

  return result.data;
});
