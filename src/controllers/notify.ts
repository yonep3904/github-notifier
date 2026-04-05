import type { Context } from "hono";
import type { Dependencies } from "@/compositions";
import { assertReady } from "@/lib/assert-ready";
import type { AppEnv } from "@/types/env";

export class NotifyController {
  constructor(private readonly dependencies: Dependencies) {}

  async manual(c: Context<AppEnv>) {
    assertReady(this.dependencies);

    const body = c.get("manualNotify");
    await this.dependencies.manualProducer.produce({
      type: "standard",
      title: body.title ?? null,
      message: body.message,
    });

    return c.json({ ok: true, queued: true });
  }

  async github(c: Context<AppEnv>) {
    assertReady(this.dependencies);

    const eventType = c.get("githubWebhookEvent");
    const body = c.get("json");

    // Unsupported events are ignored to avoid unnecessary queueing and processing
    if (!this.dependencies.githubParser.isSupportedEvent(eventType)) {
      return c.json({ ok: true, queued: false, ignored: true });
    }

    const queued = await this.dependencies.githubProducer.produce(eventType, body);

    return c.json({ ok: true, queued });
  }
}
