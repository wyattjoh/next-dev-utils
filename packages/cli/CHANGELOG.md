# @next-dev-utils/cli

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
