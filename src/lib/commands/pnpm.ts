import type { Command } from "./command.ts";
import { createCommand } from "./create-command.ts";

/**
 * Options for pnpm command execution.
 */
export type PNPMOptions = {
  /** Filter packages by name or path patterns. */
  filter?: string[];
};

/**
 * Type alias for pnpm command function.
 */
export type PNPMCommand = Command<PNPMOptions>;

/**
 * Executes pnpm package manager commands.
 *
 * Provides a wrapper around pnpm with verbose output enabled by default.
 * Supports workspace filtering and all standard pnpm commands.
 *
 * @param args - Command line arguments to pass to pnpm.
 * @param options - Configuration options for pnpm execution.
 * @param options.filter - Filter patterns for workspace packages.
 * @param options.cwd - Working directory for command execution.
 * @param options.env - Environment variables to set.
 *
 * @returns The output from the pnpm command.
 *
 * @example
 * ```ts
 * // Install dependencies
 * await pnpm(['install']);
 *
 * // Build specific workspace packages
 * await pnpm(['build'], {
 *   filter: ['@myorg/package-*']
 * });
 *
 * // Pack a package for distribution
 * await pnpm(['pack', '--pack-destination', '/tmp'], {
 *   cwd: './packages/my-package'
 * });
 * ```
 */
export const pnpm: PNPMCommand = createCommand<PNPMOptions>(
  "pnpm",
  [],
  {
    verbose: true,
  },
);
