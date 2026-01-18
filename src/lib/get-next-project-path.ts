import process from "node:process";

import { execa } from "execa";
import { getConfig } from "./config/config.ts";
import logger from "./logger.ts";

async function getGitWorktrees(cwd: string) {
  // List the worktrees for the current git repository in the format:
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js                                               c6cefce4cb [canary]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-refactor/playwright-instance-based-lifecycle  8732d86d72 [refactor/playwright-instance-based-lifecycle]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-test/deprecate-check                          4744f8bb42 [test/deprecate-check]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-wyattjoh/rdc-for-rsc-redo                     c85ffe612c [wyattjoh/rdc-for-rsc-redo]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-wyattjoh/refactor-ppr-to-cache-components     380ca6aaa1 [wyattjoh/refactor-ppr-to-cache-components]
  const worktrees = await execa("git", ["worktree", "list"], { cwd });
  return worktrees.stdout.split("\n").map((line) => {
    const [path, commit, branch] = line.split(/\s+/);
    return {
      path,
      commit,
      branch: branch.replace(/^\[/, "").replace(/\]$/, ""),
    };
  });
}

/**
 * Gets the path to the Next.js project directory.
 *
 * Automatically detects if the current working directory is within a git worktree
 * and uses that path. Otherwise, falls back to the configured project path.
 *
 * The path can be configured via:
 * - `NEXT_PROJECT_PATH` environment variable (highest priority)
 * - `next_project_path` configuration value
 *
 * @returns The absolute path to the Next.js project directory.
 *
 * @example
 * ```ts
 * const projectPath = await getNextProjectPath();
 * // If in worktree: /Users/name/Code/next.js-feature/branch
 * // Otherwise: /Users/name/Code/next.js
 *
 * // Override with environment variable
 * process.env.NEXT_PROJECT_PATH = '/custom/path/to/next.js';
 * const customPath = await getNextProjectPath();
 * // Returns: /custom/path/to/next.js
 * ```
 */
export async function getNextProjectPath(): Promise<string> {
  // Check the current working directory if it's in a git worktree for the
  // configured Next.js project.
  const base =
    // If the NEXT_PROJECT_PATH environment variable is set, use it as the base.
    process.env.NEXT_PROJECT_PATH ?? (await getConfig("next_project_path"));

  // If the base path is a git worktree, use the worktree's path.
  // Check if cwd is within any of the worktrees.
  const cwd = process.cwd();
  const worktrees = await getGitWorktrees(base);
  for (const worktree of worktrees) {
    // Check if cwd starts with the worktree path (i.e., we're inside this worktree)
    if (cwd.startsWith(worktree.path)) {
      logger.info(
        `Using worktree ${worktree.path} for ${worktree.branch} at ${worktree.commit}`,
      );
      return worktree.path;
    }
  }

  // If the base path is not a git worktree, use the base path.
  const isPiped = !Deno.stdout.isTerminal();
  if (!isPiped) {
    logger.info(`Using base path ${base} as we weren't in a git worktree`);
  }
  return base;
}
