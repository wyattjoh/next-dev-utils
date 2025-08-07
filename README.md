# Next Dev Utils

A powerful CLI toolkit for Next.js development, providing utilities for packaging, deploying, and debugging Next.js applications.

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/wyattjoh/next-dev-utils/refs/heads/main/scripts/install.sh | bash
```

### Direct Deno Install

```bash
deno install --global --force --allow-all --name nu jsr:@wyattjoh/next-dev-utils
```

## Configuration

Before using the CLI, you need to configure your cloud storage credentials. The tool uses S3-compatible storage for packaging and deployment.

### Configuration Management

Use the `config` command to manage your settings:

```bash
# Set a configuration value
nu config set <key> <value>

# Get a configuration value
nu config get <key>

# Delete a configuration value
nu config delete <key>

# List all configuration values
nu config list
```

## Commands

### `nu test-deploy`

Deploy a test file for verification.

```bash
nu test-deploy <test-file>
```

**Arguments:**

- `test-file` (required): Path to the test file to deploy

### `nu pack-next`

Package and upload your Next.js application to cloud storage.

```bash
nu pack-next [options]
```

**Options:**

- `--json`: Output result as JSON
- `--serve`: Serve the package after uploading
- `--install`: Install dependencies before packing

### `nu pack`

Package and upload the current project to cloud storage.

```bash
nu pack [options]
```

**Options:**

- `--json`: Output result as JSON
- `--serve`: Serve the package after uploading
- `--progress`: Show upload progress
- `--verbose`: Enable verbose output

### `nu debug`

Debug utilities for Next.js applications.

```bash
nu debug [options]
```

**Options:**

- `--stack`: Show stack trace information
- `-d, --directory <path>`: Specify directory to debug (default: current directory)
- `--skip-pnpm-install`: Skip pnpm installation
- `--skip-git-clean`: Skip git clean operation
- `--skip-git-bisect`: Skip git bisect
- `--skip-test`: Skip test execution

### `nu create-reproduction`

Create a minimal reproduction for bug reports.

```bash
nu create-reproduction [options]
```

**Options:**

- `--template <name>`: Specify template to use
- `--output <path>`: Output directory for reproduction

### `nu cleanup`

Clean up stored packages from cloud storage.

```bash
nu cleanup [options]
```

**Options:**

- `--days <number>`: Delete packages older than specified days
- `--dry-run`: Preview what would be deleted without actually deleting

### `nu next`

Execute Next.js specific commands.

```bash
nu next <command> [...args]
```

**Arguments:**

- `command`: Next.js command to execute (dev, build, start, etc.)
- `args`: Additional arguments to pass to Next.js

### `nu config`

Manage CLI configuration.

```bash
nu config <action> [key] [value]
```

**Actions:**

- `set <key> <value>`: Set a configuration value
- `get <key>`: Get a configuration value
- `delete <key>`: Delete a configuration value
- `list`: List all configuration values

## Features

- **Cloud Storage Integration**: Seamlessly upload and manage packages in S3-compatible storage
- **Next.js Optimization**: Specialized tools for Next.js development workflow
- **Debugging Tools**: Advanced debugging utilities including git bisect integration
- **Reproduction Creation**: Quickly create minimal reproductions for bug reports
- **Configuration Management**: Flexible configuration system with environment variable support
- **Progress Tracking**: Real-time progress indicators for long-running operations

## Requirements

- Deno 2.4.3 or higher
- S3-compatible storage account (AWS S3, MinIO, etc.)
- git (for debug and reproduction features)
- Next.js project (for Next.js specific commands)

## Examples

### Package and Deploy a Next.js App

```bash
# Configure your S3 credentials
nu config set S3_ENDPOINT s3.amazonaws.com
nu config set S3_BUCKET my-deployments

# Package and upload Next.js app
nu pack-next --install --json

# Deploy a specific test
nu test-deploy ./tests/integration.test.js
```

### Debug a Next.js Issue

```bash
# Run comprehensive debugging
nu debug --directory ./my-next-app

# Create a minimal reproduction
nu create-reproduction --template app-router --output ./reproduction
```

### Manage Cloud Storage

```bash
# Clean up old packages (dry run)
nu cleanup --days 30 --dry-run

# Actually delete old packages
nu cleanup --days 30
```

## Development

To contribute or modify the CLI:

```bash
# Clone the repository
git clone https://github.com/username/next-dev-utils.git
cd next-dev-utils

# Run in development
deno run --allow-all src/cli.ts

# Build standalone executable
deno task build

# Run tests
deno test

# Format code
deno fmt

# Lint code
deno lint
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
