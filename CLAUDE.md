# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next Dev Utils is a Deno-based CLI toolkit for Next.js development that provides utilities for packaging, deploying, and debugging Next.js applications. It supports S3-compatible cloud storage for package management.

## Development Commands

### Build & Development

```bash
# Build standalone executable
deno task build

# Run in development (directly execute TypeScript)
deno run --allow-all src/cli.ts [command] [options]

# Format code
deno fmt

# Check formatting
deno fmt --check

# Lint code
deno lint
```

### Testing

Currently, there are no test files in the repository. When adding tests:

- Place test files with pattern `*.test.ts` or in `__tests__` directories
- Run tests with: `deno test`
- Run specific test: `deno test src/path/to/test.ts`

## Architecture

### Entry Point

- `src/cli.ts` - Main CLI entry using Cliffy framework for command parsing

### Core Commands (src/commands/)

- `config.ts` - Manage CLI configuration settings
- `pack.ts` - Package and upload projects to S3
- `pack-next.ts` - Specialized Next.js packaging with npm registry integration
- `cleanup.ts` - Clean up old packages from cloud storage
- `test-deploy.ts` - Deploy test files for verification
- `debug.ts` - Debug utilities with multiple modes (dev, prod, build, start, standalone, export)
- `create-reproduction.ts` - Create minimal bug reproductions
- `next.ts` - Execute Next.js specific commands

### Core Libraries (src/lib/)

- `config/config.ts` - Configuration management with type-safe schema using Valibot
- `client.ts` - HTTP client with caching support
- `pack.ts` - Core packaging logic with S3 upload and local serving capabilities
- `pack-next.ts` - Next.js-specific packaging with npm registry dependency resolution
- `commands/` - Command execution utilities for pnpm, node, and Next.js

### Configuration System

The config system uses a typed schema with these keys:

- `next_project_path` - Path to Next.js project
- `endpoint` - S3-compatible endpoint
- `bucket` - Storage bucket name
- `access_key` - S3 access key
- `secret_key` - S3 secret key (masked on input)
- `vercel_test_team` - Vercel team for testing
- `vercel_test_token` - Vercel API token (masked on input)

Configuration is stored using @jollytoad/store-deno-fs with automatic prompting for missing values.

## Key Dependencies

- **@cliffy/command** - Command-line interface framework
- **@bradenmacdonald/s3-lite-client** - S3 client for cloud storage
- **@valibot/valibot** - Runtime validation for configuration
- **ora** - Terminal spinner for progress indication
- **execa** - Process execution utilities
- **clipboardy** - Clipboard operations

## S3 Integration

The pack commands upload tarballs to S3 with:

- MD5 hash verification to avoid duplicate uploads
- Presigned URLs with 24-hour expiration
- Local HTTP server option for testing (--serve flag)

## Important Patterns

### Error Handling

- Commands use try-catch with ora spinners for user feedback
- Process exits with code 1 on failures
- Retry prompts for failed S3 uploads

### Progress Indication

- Optional progress flags show ora spinners during long operations
- JSON output mode disables spinners for programmatic use

### Package Resolution

- `pack-next` fetches package.json from npm registry to get optionalDependencies
- Falls back to canary version if specific version fetch fails
- Temporarily modifies local package.json then restores it

### Caching

- HTTP client caches responses for 1 hour in system cache directory
- Cache behavior controlled via environment variables:
  - `NEXT_DEV_UTILS_SKIP_CACHE` - Skip cache
  - `NEXT_DEV_UTILS_FORCE_CACHE` - Use stale cache entries

## TypeScript Configuration

Strict TypeScript with:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `exactOptionalPropertyTypes: true`
