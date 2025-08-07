/**
 * Gets the default environment variables for Next.js development utilities.
 *
 * Currently disables Next.js telemetry by default.
 *
 * @returns An object containing environment variable key-value pairs.
 *
 * @example
 * ```ts
 * const env = getEnvironment();
 * // Returns: { NEXT_TELEMETRY_DISABLED: "1" }
 *
 * // Apply to process environment
 * Object.assign(process.env, getEnvironment());
 * ```
 */
export function getEnvironment(): Record<string, string> {
  return {
    NEXT_TELEMETRY_DISABLED: "1",
  };
}
