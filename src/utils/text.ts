/**
 * Truncate a string to a specified maximum length, adding an ellipsis ("...") if the string exceeds that length.
 * The maximum length includes the ellipsis, so the actual text content will be truncated to (maxLength - 3) characters if truncation is necessary.
 * If the input string is shorter than or equal to the specified maximum length, it will be returned unchanged.
 * @param text The string to be truncated
 * @param maxLength The maximum allowed length of the string, including the ellipsis if truncation occurs
 * @returns The original string if it is within the maximum length, or a truncated version with an ellipsis if it exceeds the maximum length
 * @example
 * truncateText("Hello, world!", 12); // returns "Hello, wo..."
 * truncateText("Short text", 20); // returns "Short text"
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}
