/**
 * Generates a random UUID using the Web Crypto API.
 * @returns A string representing a random UUID.
 */
export function randomUUID(): string {
  return crypto.randomUUID();
}
