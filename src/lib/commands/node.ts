import type { Command } from "./command.ts";
import { createCommand } from "./create-command.ts";

/**
 * Options for Node.js command execution.
 */
export type NodeOptions = {
  /** Additional Node.js command line options. */
  nodeOptions?: string[];
};

/**
 * Executes Node.js with specified arguments and options.
 *
 * Provides a wrapper around Node.js execution with automatic telemetry
 * disabling and verbose output by default.
 *
 * @param args - Command line arguments to pass to Node.js.
 * @param options - Configuration options for Node.js execution.
 * @param options.nodeOptions - Additional Node.js runtime options (e.g., --inspect, --max-old-space-size).
 *
 * @returns The output from the Node.js process.
 *
 * @example
 * ```ts
 * // Run a Node.js script
 * await node(['script.js']);
 *
 * // Run with debugging enabled
 * await node(['app.js'], {
 *   nodeOptions: ['--inspect', '--trace-warnings']
 * });
 *
 * // Run with increased memory
 * await node(['build.js'], {
 *   nodeOptions: ['--max-old-space-size=8192']
 * });
 * ```
 */
export const node: Command<NodeOptions> = createCommand<NodeOptions>(
  "node",
  ({ nodeOptions = [] } = {}) => {
    return nodeOptions;
  },
  {
    verbose: true,
    env: {
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
);
