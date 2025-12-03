#!/bin/bash

# ============================================================================
# NEWSLEAK QUICK START SETUP SCRIPT
# ============================================================================
# This script helps you set up your Newsleak environment quickly
# Run this script after cloning the repository
# ============================================================================

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Clear screen and show banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   NEWSLEAK QUICK START SETUP           ║"
echo "║   Version 2.0                          ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}═══${NC} $1 ${BLUE}═══${NC}\n"
}

# Welcome message
echo "This script will help you set up Newsleak step by step."
echo "You can exit at any time by pressing Ctrl+C"
echo ""
read -p "Press Enter to continue..."

# Step 1: Check Node.js
print_step "Step 1: Checking Node.js"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
    
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        print_warning "Your Node.js version is older than recommended (v18+)"
        echo "Consider upgrading from https://nodejs.org"
    fi
else
    print_error "Node.js is not installed!"
    echo ""
    echo "Please install Node.js v18 or higher from:"
    echo "  https://nodejs.org"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

# Step 2: Install dependencies
print_step "Step 2: Installing Dependencies"

if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages (this may take 1-2 minutes)..."
    npm install --legacy-peer-deps
    print_success "Dependencies installed successfully!"
else
    print_info "Dependencies already installed. Skipping..."
    read -p "Do you want to reinstall dependencies? (y/N): " REINSTALL
    if [[ $REINSTALL =~ ^[Yy]$ ]]; then
        print_info "Reinstalling dependencies..."
        rm -rf node_modules package-lock.json
        npm install --legacy-peer-deps
        print_success "Dependencies reinstalled!"
    fi
fi

# Step 3: Set up environment variables
print_step "Step 3: Environment Configuration"

if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to recreate it? This will backup the current one. (y/N): " RECREATE
    if [[ $RECREATE =~ ^[Yy]$ ]]; then
        mv .env .env.backup
        print_info "Current .env backed up to .env.backup"
        cp .env.example .env
        print_success "New .env file created from template"
    else
        print_info "Using existing .env file"
    fi
else
    cp .env.example .env
    print_success ".env file created from template"
fi

echo ""
print_warning "IMPORTANT: You need to configure your .env file with your credentials!"
echo ""
echo "You need to add:"
echo "  1. Supabase URL and keys (from https://app.supabase.com)"
echo "  2. Firebase configuration (from https://console.firebase.google.com)"
echo ""
read -p "Do you want to open .env file now? (y/N): " OPEN_ENV

if [[ $OPEN_ENV =~ ^[Yy]$ ]]; then
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    elif command -v code &> /dev/null; then
        code .env
    else
        print_info "Please open .env in your preferred text editor"
    fi
else
    print_info "Remember to edit .env before running the app!"
fi

# Step 4: Database setup reminder
print_step "Step 4: Database Setup"

echo "Before you can run the app, you need to set up your database."
echo ""
echo "Follow these steps:"
echo "  1. Go to https://app.supabase.com"
echo "  2. Create a new project (or select existing)"
echo "  3. Open SQL Editor"
echo "  4. Copy contents of 'supabase_complete_schema.sql'"
echo "  5. Paste and Run in SQL Editor"
echo "  6. Wait for completion (~20 seconds)"
echo ""
echo "Detailed guide: COMPLETE_SETUP_GUIDE.md"
echo ""
read -p "Have you set up your database? (y/N): " DB_SETUP

if [[ ! $DB_SETUP =~ ^[Yy]$ ]]; then
    print_warning "Please set up your database before continuing!"
    echo "See COMPLETE_SETUP_GUIDE.md for detailed instructions"
fi

# Step 5: Build test
print_step "Step 5: Testing Build"

read -p "Do you want to test if the app builds correctly? (Y/n): " TEST_BUILD

if [[ ! $TEST_BUILD =~ ^[Nn]$ ]]; then
    print_info "Building the application..."
    if npm run build; then
        print_success "Build successful!"
    else
        print_error "Build failed!"
        echo "Please check the error messages above and fix them."
        echo "Common issues:"
        echo "  - Missing environment variables in .env"
        echo "  - TypeScript errors in code"
        echo "  - Missing dependencies"
    fi
fi

# Step 6: Next steps
print_step "Setup Complete!"

echo ""
echo -e "${GREEN}🎉 Setup is complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo -e "${BLUE}1.${NC} Configure your .env file with actual credentials"
echo "   Edit: .env"
echo ""
echo -e "${BLUE}2.${NC} Set up your Supabase database"
echo "   Guide: COMPLETE_SETUP_GUIDE.md (Part 2)"
echo ""
echo -e "${BLUE}3.${NC} Verify your setup"
echo "   Run: bash scripts/verify-setup.sh"
echo ""
echo -e "${BLUE}4.${NC} Start development server"
echo "   Run: npm run dev"
echo "   Open: http://localhost:8080"
echo ""
echo -e "${BLUE}5.${NC} Deploy to production"
echo "   Guide: PRODUCTION_CHECKLIST.md"
echo ""

# Optional: Start dev server
read -p "Do you want to start the development server now? (y/N): " START_DEV

if [[ $START_DEV =~ ^[Yy]$ ]]; then
    print_info "Starting development server..."
    print_info "Server will be available at: http://localhost:8080"
    print_info "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
fi

echo ""
print_success "Happy coding! 🚀"
echo ""
