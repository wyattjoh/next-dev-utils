# next-dev-utils

A comprehensive CLI toolkit for Next.js development workflows, providing integrated tooling for building, testing, packaging, and debugging Next.js applications with cloud storage distribution capabilities.

## Installation

Install globally via npm to get the `nu` command:

```bash
npm install -g @next-dev-utils/cli
```

This provides the `nu` binary globally, making it available from anywhere.

## Quick Start

```bash
# Configure your environment (interactive prompts)
nu config set next_project_path /path/to/nextjs/repo
nu config set endpoint your-s3-endpoint.com

# Build and develop
nu make dev

# Create a reproduction project
nu create-reproduction issue-123

# Pack and test deployment
nu test-deploy test/e2e/my-feature.test.js
```

## Commands

### Development Workflow

#### `nu make [command...]`

Orchestrates development workflows using pnpm and turbo with dependency management.

**Available commands:**
- `clean` - Clean build artifacts
- `install` - Install dependencies
- `build` - Build all packages
- `dev` - Start development mode
- `native` - Build native dependencies
- `default` - Run default build sequence
- `all` - Run all commands in sequence

**Options:**
- `--clean` - Clean before running commands
- `--filter <pattern>` - Filter packages to build

**Examples:**
```bash
nu make dev                    # Start development
nu make clean build           # Clean and build
nu make --filter=cli build    # Build only CLI package
```

#### `nu next <command> [directory]`

Proxy for Next.js commands using your development build.

**Examples:**
```bash
nu next dev                   # Start Next.js dev server
nu next build ./my-app       # Build specific app
nu next start ./my-app       # Start production server
```

#### `nu debug <mode> <directory>`

Advanced debugging with automatic cleanup and concurrent script execution.

**Modes:**
- `dev` - Debug development server
- `prod` - Debug production build
- `build` - Debug build process
- `start` - Debug production start
- `standalone` - Debug standalone mode
- `export` - Debug static export

**Options:**
- `--rm` - Remove .next directory after completion
- `--run <script>` - Run concurrent script during debugging

**Examples:**
```bash
nu debug dev ./my-app                           # Debug dev server
nu debug prod ./my-app --run "curl localhost:3000"  # Debug with health check
nu debug build ./my-app --rm                   # Debug build and cleanup
```

### Package Management

#### `nu pack-next`

Pack and distribute Next.js packages with cloud storage integration.

**Options:**
- `--json` - Output result as JSON
- `--serve` - Serve package locally instead of uploading
- `--install` - Install packed package locally

**Examples:**
```bash
nu pack-next                  # Pack and upload (copies URL to clipboard)
nu pack-next --serve         # Pack and serve locally
nu pack-next --json         # Get JSON output with URLs
```

#### `nu pack`

Generic package packing with integrity validation.

**Options:**
- `--json` - Output result as JSON
- `--serve` - Serve package locally
- `--progress` - Show detailed progress
- `--verbose` - Verbose output

**Examples:**
```bash
nu pack                      # Pack current package
nu pack --serve --verbose   # Pack, serve locally with verbose output
```

### Testing

#### `nu test-deploy <test-file>`

End-to-end deployment testing with custom Next.js builds.

**Options:**
- `--no-app-dir` - Disable app directory
- `--skip-pack` - Skip Next.js packing step

**Requirements:**
- Test file must be in `test/e2e` directory
- File must match pattern `*.test.{js,ts}`

**Examples:**
```bash
nu test-deploy test/e2e/app-router.test.js     # Test specific feature
nu test-deploy test/e2e/build.test.js --skip-pack  # Skip packing step
```

### Project Management

#### `nu create-reproduction <name>`

Create minimal Next.js reproduction projects for issue reporting.

**Options:**
- `--no-app-dir` - Create without app directory structure

**Examples:**
```bash
nu create-reproduction issue-123              # Create reproduction project
nu create-reproduction bug-fix --no-app-dir  # Create without app directory
```

### Configuration

#### `nu config <operation> [key] [value]`

Manage CLI configuration with secure credential handling.

**Operations:**
- `get` - Retrieve configuration value
- `set` - Set configuration value

**Available keys:**
- `next_project_path` - Path to Next.js repository
- `endpoint` - S3-compatible storage endpoint
- `bucket` - Storage bucket name
- `access_key` - Storage access key
- `secret_key` - Storage secret key (hidden input)
- `vercel_test_team` - Vercel team for testing
- `vercel_test_token` - Vercel authentication token (hidden input)

**Examples:**
```bash
nu config set next_project_path /path/to/nextjs      # Set Next.js path
nu config set endpoint s3.amazonaws.com             # Set storage endpoint
nu config get bucket                                # Get current bucket
nu config set secret_key                           # Prompts for hidden input
```

### Task Runner

#### `nu run [task]`

Extensible task runner with interactive selection.

**Examples:**
```bash
nu run                       # Interactive task selection
nu run my-custom-task       # Run specific task
```

## Configuration

The CLI maintains persistent configuration for seamless operation across different environments. All sensitive data like secret keys and tokens use hidden input prompts for security.

### Required Configuration

For full functionality, configure these essential settings:

```bash
# Next.js repository path
nu config set next_project_path /path/to/nextjs

# Cloud storage (S3-compatible)
nu config set endpoint your-storage-endpoint.com
nu config set bucket your-bucket-name
nu config set access_key your-access-key
nu config set secret_key  # Will prompt securely

# Vercel testing (optional)
nu config set vercel_test_team your-team
nu config set vercel_test_token  # Will prompt securely
```

## Features

- **🔧 Development Workflow**: Integrated pnpm/turbo build orchestration
- **📦 Package Distribution**: S3-compatible cloud storage with URL sharing
- **🧪 E2E Testing**: Automated deployment testing with Vercel integration
- **🐛 Advanced Debugging**: Multiple debug modes with cleanup and concurrent execution
- **🔒 Secure Configuration**: Hidden input for sensitive credentials
- **📋 Clipboard Integration**: Automatic URL copying for easy sharing
- **🎯 Interactive Experience**: Spinners, progress indicators, and intuitive prompts
- **🧹 Automatic Cleanup**: Proper signal handling and resource management

## Architecture

This is a monorepo using pnpm workspaces and Turbo for build orchestration:

- **`@next-dev-utils/cli`** - Main CLI application with command implementations
- **`@next-dev-utils/utils`** - Shared utilities for configuration, command execution, and environment management

## Requirements

- **Node.js**: 20+
- **Package Manager**: pnpm (for development workflows)
- **Optional**: Vercel account (for deployment testing)
