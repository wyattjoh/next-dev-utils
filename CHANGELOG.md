# next-dev-utils

## 2.4.0

### Minor Changes

- Automatic SWC binary packaging for `pack-next` command

  - SWC binaries are now automatically included when present (removed `--include-swc` flag)
  - Added `--swc-platforms` flag to filter which platforms to include (e.g., `--swc-platforms darwin-arm64,linux-x64-gnu`)
  - Added `--dry-run` flag to preview what would be packaged without uploading
  - Added binary validation to verify files are readable before packaging
  - Improved progress feedback showing platform names as they complete
  - Better error handling: exits on complete SWC failure, warns on partial failure

- Improved version mismatch handling

  - More prominent warnings when local version doesn't match npm registry
  - Clear explanation that local package.json edits will be ignored in this case

- Added `warn` method to logger for warning-level messages

### Patch Changes

- 31806d2: Hashed filenames are now always used (hash embedded in filename for cache-busting)
- 31806d2: Multi-file support for `test-deploy` command
- Add timeout to fallback npm registry fetch (prevents hanging on slow networks)

## 2.0.1

### Patch Changes

- 23b73d4: Refactor configuration management system

  - Replace TypedConfig class with standalone getConfigKey/setConfigKey functions
  - Switch from @jollytoad/store-deno-fs to Node.js fs module for config storage
  - Change configuration storage from key-value store to JSON file (~/.next-dev-utils.json)
  - Remove unused dependencies and simplify configuration management
  - Maintain backward compatibility for existing getConfig/setConfig functions

- 06ef9b0: Add CLAUDE.md documentation for Claude Code integration

  - Add project-specific guidance for Claude Code
  - Document project structure, commands, and patterns
  - Improve AI-assisted development workflow

- 777795e: Fix CI workflow for Deno environment

- c9506f2: Update linter and formatter configuration for Deno

- 0551395: Add node_modules to .gitignore for compatibility

- ba64286: Refactor configuration and module structure

  - Updated module exports to align with Deno standards
  - Simplified configuration management by removing redundant class-based patterns
  - Improved import/export structure for better tree-shaking
  - Enhanced lefthook configuration for better pre-commit checks
  - Optimized module dependencies and reduced overall bundle size

## 2.0.0

### Major Changes

- f461092: Migrate project from Node.js/pnpm to Deno

  **BREAKING CHANGES**: This is a complete rewrite of the project using Deno instead of Node.js.

  - Migrated from Node.js/pnpm monorepo structure to a single Deno module
  - Removed dependency on Node.js, pnpm, and turbo
  - Updated CI/CD workflows to use Deno for building and deployment
  - Consolidated `@next-dev-utils/cli` and `@next-dev-utils/utils` packages into a single module
  - Updated installation method to use Deno install script or JSR registry
  - All commands and functionality remain the same but now run in Deno runtime

### Minor Changes

- 0fdf461: Add lefthook for git hooks management

  - Integrated lefthook for pre-commit and pre-push hooks
  - Automatically formats code with `deno fmt` before commits
  - Ensures code quality checks run before pushing

### Patch Changes

- 227c851: Fix package name for JSR installation

  - Corrected package name from `@wyattjoh/next-dev-utils` to `@next-dev-utils/cli` in documentation and configuration

## 1.3.0

### Minor Changes

- 3f14c91: Add storage cleanup command to remove old packages from cloud storage bucket. The new `cleanup` command automatically removes files older than 1 day, helping maintain storage hygiene by cleaning up temporary test packages and old deployments. Includes `--dry-run` option for safe preview and `--verbose` option for detailed output.

### Patch Changes

- Updated dependencies [3f14c91]
  - @next-dev-utils/utils@1.2.0

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
