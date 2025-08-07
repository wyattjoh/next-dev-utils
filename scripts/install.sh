#!/bin/bash

# next-dev-utils installer script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BOLD}${BLUE}$1${NC}"
}

print_info() {
    echo -e "${BLUE}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Header
print_header "next-dev-utils installer"
echo "================================"
echo

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    print_error "Deno is not installed or not in PATH"
    print_info "Please install Deno first: https://deno.land/manual/getting_started/installation"
    exit 1
fi

print_success "Found Deno $(deno --version | head -n1)"
echo

# Install with --force to overwrite existing installations
print_info "📦 Installing @wyattjoh/next-dev-utils as 'next-dev-utils'..."
deno install --global --force --reload --allow-read --allow-write --allow-net --allow-run --allow-env -n next-dev-utils jsr:@wyattjoh/next-dev-utils

print_info "📦 Installing @wyattjoh/next-dev-utils as 'nu'..."
deno install --global --force --reload --allow-read --allow-write --allow-net --allow-run --allow-env -n nu jsr:@wyattjoh/next-dev-utils

echo
print_success "Installation complete!"
echo
print_info "Available commands:"
echo "  next-dev-utils [args]"
echo "  nu [args]"
echo

# Check if Deno bin is in PATH
DENO_INSTALL_ROOT="${DENO_INSTALL_ROOT:-$HOME/.deno}"
if [[ ":$PATH:" != *":$DENO_INSTALL_ROOT/bin:"* ]]; then
    print_warning "Deno bin directory is not in your PATH"
    print_info "Add this to your shell profile (.bashrc, .zshrc, etc.):"
    echo "  export PATH=\"\$PATH:$DENO_INSTALL_ROOT/bin\""
    echo
fi

# Test installations
print_info "Verifying installations..."
if command -v next-dev-utils &> /dev/null; then
    print_success "next-dev-utils is available"
else
    print_warning "next-dev-utils not found in PATH"
fi

if command -v nu &> /dev/null; then
    print_success "nu is available"
else
    print_warning "nu not found in PATH"
fi

echo
print_success "Installation finished successfully!"
