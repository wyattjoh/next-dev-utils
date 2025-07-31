# @next-dev-utils/utils

## 1.1.0

### Minor Changes

- f0fae0c: Add intelligent Next.js project path resolution with git worktree support and environment variable override capability. The new `getNextProjectPath()` function automatically detects git worktrees and uses the appropriate worktree path, with support for `NEXT_PROJECT_PATH` environment variable override.

## 1.0.1

### Patch Changes

- 298d439: Update all dependencies to latest versions

  - Update TypeScript from 5.3.3 to 5.7.2
  - Update execa from 8.0.1 to 9.5.2
  - Update inquirer from 9.2.14 to 12.3.0
  - Update Node.js types from 20.11.19 to 22.10.2
  - Update pnpm from 8.15.7 to 9.15.0
  - Update other dependencies to latest compatible versions
  - Fix TypeScript errors due to API changes in execa v9 and inquirer v12

## 1.0.0

### Major Changes

- 25ef4b6: Initial release of Next.js development utilities

  This is the first release of the Next.js development utilities monorepo, providing:

  - **@next-dev-utils/cli**: Command-line interface for Next.js development workflows including packaging, testing, debugging, and reproduction creation
  - **@next-dev-utils/utils**: Shared utilities library with configuration management, command execution helpers, and environment utilities

  The CLI provides comprehensive tooling for Next.js developers to streamline their development and testing workflows.
