# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `pnpm install`
- **Build all packages**: `pnpm build`
- **Run in development mode**: `pnpm dev`
- **Type checking**: `pnpm type-check`
- **Linting**: `pnpm lint` (uses Biome with auto-fix)

## Architecture Overview

This is a monorepo using pnpm workspaces and Turbo for build orchestration. It contains Next.js development utilities split into two main packages:

### Package Structure
- `packages/cli/` - Main CLI application (`@next-dev-utils/cli`)
  - Entry point: `src/cli.ts` using yargs for command parsing
  - Commands in `src/commands/`: config, create-reproduction, debug, make, next, pack-next, pack, test-deploy
  - Builds to `dist/` and provides binary at `bin/next-dev-utils.js`

- `packages/utils/` - Shared utilities (`@next-dev-utils/utils`)
  - Core library functions for CLI commands
  - Configuration management and validation
  - Command execution helpers (Node.js, pnpm, Next.js)
  - Environment and packaging utilities

### Key Technologies
- **Build System**: Turbo (orchestration) + tsup (TypeScript compilation)
- **Code Quality**: Biome (linting/formatting with tab indentation, double quotes)
- **Package Manager**: pnpm (v8.15.7+)
- **Runtime**: Node.js 20+

### CLI Usage
The built CLI can be aliased for convenience:
```bash
alias nu='fnm exec --using=v20 node ~/path-to-the-project/next-dev-utils/packages/cli/dist/cli.js'
```

The CLI provides commands for Next.js development workflows including packaging, testing, debugging, and reproduction creation.