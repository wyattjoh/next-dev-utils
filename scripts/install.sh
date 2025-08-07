#!/bin/bash

# next-dev-utils installer script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    print_error "Deno is not installed or not in PATH"
    print_status "Please install Deno first: https://deno.land/manual/getting_started/installation"
    exit 1
fi

print_status "Found Deno $(deno --version | head -n1)"

# Install with --force to overwrite existing installations
print_status "Installing @wyattjoh/next-dev-utils as 'next-dev-utils'..."
deno install --global --force --allow-read --allow-write --allow-net --allow-run --allow-env -n next-dev-utils jsr:@wyattjoh/next-dev-utils

print_status "Installing @wyattjoh/next-dev-utils as 'nu'..."
deno install --global --force --allow-read --allow-write --allow-net --allow-run --allow-env -n nu jsr:@wyattjoh/next-dev-utils

print_status "Installation complete!"
print_status "You can now use either:"
echo "  next-dev-utils [args]"
echo "  nu [args]"

# Check if Deno bin is in PATH
DENO_INSTALL_ROOT="${DENO_INSTALL_ROOT:-$HOME/.deno}"
if [[ ":$PATH:" != *":$DENO_INSTALL_ROOT/bin:"* ]]; then
    print_warning "Deno bin directory is not in your PATH"
    print_warning "Add this to your shell profile (.bashrc, .zshrc, etc.):"
    echo "  export PATH=\"\$PATH:$DENO_INSTALL_ROOT/bin\""
fi

print_status "Testing installations..."
if command -v next-dev-utils &> /dev/null; then
    print_status "✓ next-dev-utils is available"
else
    print_warning "✗ next-dev-utils not found in PATH"
fi

if command -v nu &> /dev/null; then
    print_status "✓ nu is available"
else
    print_warning "✗ nu not found in PATH"
fi
