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

# Clear cache to ensure we get the latest version
print_info "🧹 Clearing package cache to ensure latest version..."
deno cache --reload jsr:@wyattjoh/next-dev-utils

# Install with --force to overwrite existing installations
print_info "📦 Installing @wyattjoh/next-dev-utils as 'next-dev-utils'..."
deno install --quiet --global --force --reload --allow-read --allow-write --allow-net --allow-run --allow-env --allow-sys -n next-dev-utils jsr:@wyattjoh/next-dev-utils

print_info "📦 Installing @wyattjoh/next-dev-utils as 'nu'..."

# NOTE: Reloading here isn't needed because it's already done above.
deno install --quiet --global --force --allow-read --allow-write --allow-net --allow-run --allow-env --allow-sys -n nu jsr:@wyattjoh/next-dev-utils

# Check if Deno bin is in PATH
DENO_INSTALL_ROOT="${DENO_INSTALL_ROOT:-$HOME/.deno}"
if [[ ":$PATH:" != *":$DENO_INSTALL_ROOT/bin:"* ]]; then
    print_warning "Deno bin directory is not in your PATH"
    print_info "Add this to your shell profile (.bashrc, .zshrc, etc.):"
    echo "  export PATH=\"\$PATH:$DENO_INSTALL_ROOT/bin\""
    echo

    NEXT_DEV_UTILS_VERSION="unknown"
    NU_VERSION="unknown"
else
    # Test installations
    print_info "🔍 Verifying installations..."
    if command -v next-dev-utils &> /dev/null; then
        NEXT_DEV_UTILS_VERSION=$(next-dev-utils --version 2>/dev/null || echo "unknown")
    else
        print_warning "next-dev-utils not found in PATH"
        NEXT_DEV_UTILS_VERSION="unknown"
    fi

    if command -v nu &> /dev/null; then
        NU_VERSION=$(nu --version 2>/dev/null || echo "unknown")
    else
        print_warning "nu not found in PATH"
        NU_VERSION="unknown"
    fi
fi


echo
print_success "Installation complete!"
echo
print_info "Available commands:"
echo "  next-dev-utils (version: $NEXT_DEV_UTILS_VERSION)"
echo "  nu (version: $NU_VERSION)"
echo