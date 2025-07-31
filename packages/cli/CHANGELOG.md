# @next-dev-utils/cli

## 1.2.0

### Minor Changes

- f0fae0c: Add intelligent Next.js project path resolution with git worktree support and environment variable override capability. The new `getNextProjectPath()` function automatically detects git worktrees and uses the appropriate worktree path, with support for `NEXT_PROJECT_PATH` environment variable override.

### Patch Changes

- 6c903cf: Enable CLI option pass-through to Next.js commands
- Updated dependencies [f0fae0c]
  - @next-dev-utils/utils@1.1.0

## 1.1.1

### Patch Changes

- 298d439: Update all dependencies to latest versions

  - Update TypeScript from 5.3.3 to 5.7.2
  - Update execa from 8.0.1 to 9.5.2
  - Update inquirer from 9.2.14 to 12.3.0
  - Update Node.js types from 20.11.19 to 22.10.2
  - Update pnpm from 8.15.7 to 9.15.0
  - Update other dependencies to latest compatible versions
  - Fix TypeScript errors due to API changes in execa v9 and inquirer v12

- Updated dependencies [298d439]
  - @next-dev-utils/utils@1.0.1

## 1.1.0

### Minor Changes

- 0c3e0c1: Remove unused tasks implementation from CLI

  - Removed the dynamic task loading system (`tasks.ts`)
  - Removed the `run [task]` command from the CLI
  - Removed the empty `tasks/` directory
  - Updated build configuration to remove task entry points

  This simplifies the CLI by removing an unused feature that was set up but never implemented with actual tasks.

## 1.0.0

### Major Changes

- 25ef4b6: Initial release of Next.js development utilities

  This is the first release of the Next.js development utilities monorepo, providing:

  - **@next-dev-utils/cli**: Command-line interface for Next.js development workflows including packaging, testing, debugging, and reproduction creation
  - **@next-dev-utils/utils**: Shared utilities library with configuration management, command execution helpers, and environment utilities

  The CLI provides comprehensive tooling for Next.js developers to streamline their development and testing workflows.

### Patch Changes

- Updated dependencies [25ef4b6]
  - @next-dev-utils/utils@1.0.0
