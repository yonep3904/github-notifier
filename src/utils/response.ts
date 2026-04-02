/**
 * Get the retry time in milliseconds from the Retry-After header of a Response object.
 * If the header is not present or cannot be parsed, returns null.
 * @param retryAfterHeader The Response object containing the Retry-After header
 * @param unit The unit of time for the returned retry duration ("ms" for milliseconds, "sec" for seconds). Default is "sec".
 * @returns The retry duration in milliseconds, or null if the header is not present or cannot be parsed
 */
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
