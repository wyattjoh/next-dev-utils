import { execa } from "execa";
import { getConfig } from "./config/config.js";

async function getGitWorktrees() {
  // List the worktrees for the current git repository in the format:
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js                                               c6cefce4cb [canary]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-refactor/playwright-instance-based-lifecycle  8732d86d72 [refactor/playwright-instance-based-lifecycle]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-test/deprecate-check                          4744f8bb42 [test/deprecate-check]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-wyattjoh/rdc-for-rsc-redo                     c85ffe612c [wyattjoh/rdc-for-rsc-redo]
  // /Users/wyatt.johnson/Code/github.com/vercel/next.js-wyattjoh/refactor-ppr-to-cache-components     380ca6aaa1 [wyattjoh/refactor-ppr-to-cache-components]
  const worktrees = await execa("git", ["worktree", "list"]);
  return worktrees.stdout.split("\n").map((line) => {
    const [path, commit, branch] = line.split(/\s+/);
    return {
      path,
      commit,
      branch: branch.replace(/^\[/, "").replace(/\]$/, ""),
    };
  });
}

export async function getNextProjectPath() {
  // Check the current working directory if it's in a git worktree for the
  // configured Next.js project.
  const base =
    // If the NEXT_PROJECT_PATH environment variable is set, use it as the base.
    process.env.NEXT_PROJECT_PATH ?? (await getConfig("next_project_path"));

  // If the base path is a git worktree, use the worktree's path.
  const worktrees = await getGitWorktrees();
  for (const worktree of worktrees) {
    if (worktree.path.startsWith(process.cwd())) {
      console.log(
        `Using worktree ${worktree.path} for ${worktree.branch} at ${worktree.commit}`
      );
      return worktree.path;
    }
  }

  // If the base path is not a git worktree, use the base path.
  console.log(`Using base path ${base} as we weren't in a git worktree`);
  return base;
}
