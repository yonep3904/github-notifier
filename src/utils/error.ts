/**
 * Utility functions for handling error objects.
 */

/**
 * Type guard to check if a value is an Error object.
 * @param error The value to check
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely retrieves the name from an error object.
 * Intended for use in logging and diagnostics.
 * @param error The error object
 * @returns The error name, or an identifier string if the value is not an Error
 */
export function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name ?? "unknown error name";
  }
  return "not an error";
}

/**
 * Safely retrieves the message from an error object.
 * @param error The error object
 * @returns The error message, or an identifier string if the value is not an Error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message ?? "unknown error message";
  }
  return "not an error";
}

/**
 * Safely retrieves the stack trace from an error object.
 * @param error The error object
 * @returns The error stack trace, or an identifier string if the value is not an Error
 */
export function getErrorStack(error: unknown): string {
  if (isError(error)) {
    return error.stack ?? "unknown error stack";
  }
  return "not an error";
}
