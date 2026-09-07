import { validator } from "hono/validator";

export const gitHubWebhookHeadersValidator = validator("header", (headers, c) => {
  const event = headers["x-github-event"];
  if (!event) {
    return c.json({ ok: false, error: "missing_github_event" }, 400);
  }

  return { event };
});

export const gitHubWebhookPayloadValidator = validator("json", (value) => value);
