import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ServiceUnavailableError } from "@/errors/service";
import { getBaseUrl } from "@/lib/url";
import type { AppEnv } from "@/types/env";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ServiceUnavailableError) {
    const baseUrl = getBaseUrl(c);

    return c.json(
      {
        ok: false,
        error: "service_unavailable",
        message:
          "Notifications are currently unavailable because the configuration is invalid. " +
          `Please check the service status at ${baseUrl}/status.`,
      },
      503,
    );
  }

  if (err instanceof HTTPException) {
    const response = err.getResponse();
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      return response;
    }

    return c.json(
      {
        ok: false,
        error: "bad_request",
        message: err.message,
      },
      err.status,
    );
  }

  console.error(err);

  return c.json(
    {
      ok: false,
      error: "internal_server_error",
      message: "An unexpected error occurred.",
    },
    500,
  );
};
