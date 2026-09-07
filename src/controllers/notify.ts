import type { ManualNotifyRequest } from "@/schemas/notify";
import type { GithubNotificationProducer, ManualNotificationProducer } from "@/services/producers";

export class NotifyController {
  constructor(
    private readonly manualProducer: ManualNotificationProducer,
    private readonly githubProducer: GithubNotificationProducer,
  ) {}

  async manual(request: Request, body: ManualNotifyRequest): Promise<Response> {
    const origin = new URL(request.url).origin;
    const queued = await this.manualProducer.produce(
      {
        type: "standard",
        title: body.title ?? null,
        message: body.message,
      },
      origin,
    );

    return Response.json({ ok: true, queued });
  }

  async github(request: Request, eventType: string, body: unknown): Promise<Response> {
    const origin = new URL(request.url).origin;
    const queued = await this.githubProducer.produce(eventType, body, origin);

    return Response.json({ ok: true, queued });
  }
}
