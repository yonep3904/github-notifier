import type { Context } from "hono";
import type {
  GithubNotificationProducer,
  GithubWebhookParser,
  ManualNotificationProducer,
} from "@/services/producers";
import type { AppEnv } from "@/types/env";

interface NotifyControllerDependencies {
  manualProducer: ManualNotificationProducer;
  githubProducer: GithubNotificationProducer;
  githubParser: GithubWebhookParser;
}

export class NotifyController {
  constructor(private readonly dependencies: NotifyControllerDependencies) {}

  async manual(c: Context<AppEnv>) {
    const body = c.get("manualNotify");
    await this.dependencies.manualProducer.produce({
      type: "standard",
      title: body.title ?? null,
      message: body.message,
    });

    return c.json({ ok: true, queued: true });
  }
}
