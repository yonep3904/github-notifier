import type { ErrorHandler } from "hono";
import { ServiceUnavailableError } from "@/errors/service";
import { getBaseUrl } from "@/lib/url";
import type { AppEnv } from "@/types/env";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  // ServiceUnavailableError -> 503
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

  // Other errors -> 500
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
