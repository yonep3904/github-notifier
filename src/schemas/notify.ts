import { z } from "zod";

export const manualNotifyRequestSchema = z.object({
  title: z.string().nullable().optional(),
  message: z.string().trim().min(1),
});

export type ManualNotifyRequest = z.infer<typeof manualNotifyRequestSchema>;
