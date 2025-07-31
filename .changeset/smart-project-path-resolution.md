---
"@next-dev-utils/cli": minor
"@next-dev-utils/utils": minor
---

Add intelligent Next.js project path resolution with git worktree support and environment variable override capability. The new `getNextProjectPath()` function automatically detects git worktrees and uses the appropriate worktree path, with support for `NEXT_PROJECT_PATH` environment variable override.