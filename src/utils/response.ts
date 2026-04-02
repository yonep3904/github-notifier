export function getRetryAfterMs(
  retryAfterHeader: Response,
  unit: "ms" | "sec" = "sec",
): number | null {
  const retryAfter = retryAfterHeader.headers.get("retry-after");
  if (retryAfter) {
    const retryAfterSeconds = Number(retryAfter);
    if (!Number.isNaN(retryAfterSeconds)) {
      return unit === "sec" ? retryAfterSeconds * 1000 : retryAfterSeconds;
    }
  }
  return null;
}
