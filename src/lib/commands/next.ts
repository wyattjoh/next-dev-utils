import path from "node:path";

import type { Command } from "./command.ts";
import { node } from "./node.ts";
import { getNextProjectPath } from "../get-next-project-path.ts";

/**
 * Options for the Next.js command execution.
 */
type NextOptions = {
  /** Additional Node.js options to pass to the process. */
  nodeOptions?: string[];
};

/**
 * Executes Next.js CLI commands from the local Next.js project.
 *
 * Automatically locates the Next.js project (respecting git worktrees) and
 * runs the Next.js CLI with additional debugging options enabled.
 *
 * @param args - Command line arguments to pass to Next.js CLI.
 * @param options - Configuration options for the command execution.
 * @param options.nodeOptions - Additional Node.js options (added to --trace-deprecation and --enable-source-maps).
 * @param options.env - Environment variables to set for the process.
 *
 * @returns The output from the Next.js command.
 *
 * @example
 * ```ts
 * // Run Next.js dev server
 * await next(['dev', '--port', '3000']);
 *
 * // Build the Next.js project with custom Node options
 * await next(['build'], {
 *   nodeOptions: ['--max-old-space-size=4096'],
 *   env: { NODE_ENV: 'production' }
 * });
 * ```
 */
export const next: Command<NextOptions> = async (
  args = [],
  { nodeOptions = [], env, ...options } = {},
) => {
  const nextProjectPath = await getNextProjectPath();
  const nextExecPath = path.join(
    nextProjectPath,
    "packages/next/dist/bin/next",
  );

  return node([nextExecPath, ...args], {
    ...options,
    env,
    nodeOptions: [
      "--trace-deprecation",
      "--enable-source-maps",
      ...nodeOptions,
    ],
  });
};
