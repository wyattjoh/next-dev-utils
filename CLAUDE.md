# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `pnpm install`
- **Build all packages**: `pnpm build`
- **Run in development mode**: `pnpm dev`
- **Type checking**: `pnpm type-check`
- **Linting**: `pnpm lint` (uses Biome with auto-fix)
- **Changesets**: `pnpm changeset` (for version management)
- **Version packages**: `pnpm version-packages`
- **Release**: `pnpm release` (builds and publishes)

## Architecture Overview

This is a monorepo using pnpm workspaces and Turbo for build orchestration. It contains Next.js development utilities split into two main packages:

### Package Structure
- `packages/cli/` - Main CLI application (`@next-dev-utils/cli`)
  - Entry point: `src/cli.ts` using yargs for command parsing
  - Commands in `src/commands/`:
    - `config` - Update or get config values
    - `create-reproduction` - Create bare-bones reproduction projects
    - `debug` - Debug projects with Next.js (dev/prod/build/start/standalone/export modes)
    - `make` - Start development with Next.js (clean/install/build/dev/native/default/all)
    - `next` - Run commands using development Next.js binary
    - `pack-next` - Pack and upload Next.js package to cloud storage
    - `pack` - Pack and upload current package to cloud storage
    - `test-deploy` - Perform pack and test deploy of specified test
  - Builds to `dist/` and provides binary at `bin/next-dev-utils.js`

- `packages/utils/` - Shared utilities (`@next-dev-utils/utils`)
  - Core library functions (`src/lib.ts`)
  - Configuration management (`src/lib/config/`)
  - Command execution helpers:
    - `src/lib/commands/` - Base command utilities
    - `src/lib/commands/node.ts` - Node.js command execution
    - `src/lib/commands/pnpm.ts` - pnpm command execution
    - `src/lib/commands/next.ts` - Next.js command execution
  - Packaging utilities (`src/lib/pack.ts`, `src/lib/pack-next.ts`)
  - Environment utilities (`src/lib/env.ts`)
  - Cloud storage client (`src/lib/client.ts`)

### Key Technologies
- **Build System**: Turbo (orchestration) + tsup (TypeScript compilation)
- **Code Quality**: Biome (linting/formatting with tab indentation, double quotes)
- **Package Manager**: pnpm (v8.15.7+)
- **Runtime**: Node.js 20+
- **Version Management**: Changesets

### CLI Usage
The built CLI can be aliased for convenience:
```bash
alias nu='fnm exec --using=v20 node ~/path-to-the-project/next-dev-utils/packages/cli/dist/cli.js'
```

The CLI provides commands for Next.js development workflows including packaging, testing, debugging, and reproduction creation.