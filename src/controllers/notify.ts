import type { Context } from "hono";
import type {
  GithubNotificationProducer,
  GithubWebhookParser,
  ManualNotificationProducer,
} from "@/services/producers";
import type { AppEnv } from "@/types/env";

export interface NotifyControllerDependencies {
  manualProducer: ManualNotificationProducer;
  githubProducer: GithubNotificationProducer;
  githubParser: GithubWebhookParser;
}

export class NotifyController {
  constructor(private readonly dependencies: NotifyControllerDependencies) {}

  async manual(c: Context<AppEnv>) {
    const body = c.get("manualNotify");
    const origin = new URL(c.req.url).origin;
    const queued = await this.dependencies.manualProducer.produce(
      {
        type: "standard",
        title: body.title ?? null,
        message: body.message,
      },
      origin,
    );

    return c.json({ ok: true, queued });
  }

  async github(c: Context<AppEnv>) {
    const eventType = c.get("githubWebhookEvent");
    const body = c.get("json");
    const origin = new URL(c.req.url).origin;

    // Unsupported events are ignored to avoid unnecessary queueing and processing
    if (!this.dependencies.githubParser.isSupportedEvent(eventType)) {
      return c.json({ ok: true, queued: false, ignored: true });
    }

    const queued = await this.dependencies.githubProducer.produce(eventType, body, origin);

    return c.json({ ok: true, queued });
  }
}
