#!/bin/bash

# Newsleak Setup Verification Script
# This script verifies that your Newsleak installation is correctly set up

echo "======================================"
echo "  Newsleak Setup Verification Tool"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "Checking environment setup..."
echo ""

# 1. Check Node.js
echo "1. Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
    
    # Check if version is adequate (v18+)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js version is adequate (>= 18)"
    else
        print_warning "Node.js version is older than recommended (< 18). Consider upgrading."
    fi
else
    print_error "Node.js is not installed. Please install from https://nodejs.org"
fi
echo ""

# 2. Check npm
echo "2. Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install Node.js which includes npm."
fi
echo ""

# 3. Check if node_modules exists
echo "3. Checking project dependencies..."
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
    
    # Check some key packages
    if [ -d "node_modules/react" ]; then
        print_success "React is installed"
    else
        print_warning "React not found in node_modules"
    fi
    
    if [ -d "node_modules/@supabase/supabase-js" ]; then
        print_success "Supabase client is installed"
    else
        print_warning "Supabase client not found"
    fi
else
    # Note: --legacy-peer-deps is required because this project uses React 19
    # and some UI libraries haven't updated their peer dependencies yet
    print_error "node_modules not found. Run: npm install --legacy-peer-deps"
fi
echo ""

# 4. Check .env file
echo "4. Checking environment configuration..."
if [ -f ".env" ]; then
    print_success ".env file exists"
    
    # Check required variables
    if grep -q "VITE_SUPABASE_URL" .env; then
        if grep -q "VITE_SUPABASE_URL=https://" .env; then
            print_success "VITE_SUPABASE_URL is configured"
        else
            print_warning "VITE_SUPABASE_URL exists but may not be configured correctly"
        fi
    else
        print_error "VITE_SUPABASE_URL not found in .env"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        # Check if it looks like a JWT token (non-empty and reasonable length)
        ANON_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d'=' -f2)
        if [ ${#ANON_KEY} -gt 50 ]; then
            print_success "VITE_SUPABASE_ANON_KEY is configured"
        else
            print_warning "VITE_SUPABASE_ANON_KEY exists but appears empty or too short"
        fi
    else
        print_error "VITE_SUPABASE_ANON_KEY not found in .env"
    fi
    
    if grep -q "VITE_FIREBASE_API_KEY" .env; then
        print_success "Firebase configuration found"
    else
        print_warning "Firebase API key not found in .env (optional for basic functionality)"
    fi
else
    print_error ".env file not found. Copy .env.example to .env and configure it"
fi
echo ""

# 5. Check project files
echo "5. Checking project structure..."
REQUIRED_DIRS=("src" "public" "supabase")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_success "Directory '$dir' exists"
    else
        print_error "Required directory '$dir' not found"
    fi
done

REQUIRED_FILES=("package.json" "vite.config.ts" "index.html" "supabase_complete_schema.sql")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "File '$file' exists"
    else
        print_error "Required file '$file' not found"
    fi
done
echo ""

# 6. Check build
echo "6. Checking if project can build..."
if [ -d "dist" ]; then
    print_success "Build output directory (dist) exists"
    print_warning "Run 'npm run build' to ensure latest code is built"
else
    print_warning "No build output found. Run 'npm run build' to create production build"
fi
echo ""

# 7. Check Supabase files
echo "7. Checking Supabase configuration..."
if [ -d "supabase/functions" ]; then
    print_success "Supabase functions directory exists"
    
    if [ -d "supabase/functions/fetchFeeds" ]; then
        print_success "fetchFeeds edge function exists"
    else
        print_warning "fetchFeeds edge function not found"
    fi
    
    if [ -d "supabase/functions/sendNotification" ]; then
        print_success "sendNotification edge function exists"
    else
        print_warning "sendNotification edge function not found"
    fi
else
    print_warning "Supabase functions directory not found"
fi

if [ -d "supabase/migrations" ]; then
    print_success "Supabase migrations directory exists"
else
    print_warning "Supabase migrations directory not found"
fi
echo ""

# 8. Check Supabase CLI (optional)
echo "8. Checking Supabase CLI (optional)..."
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    print_success "Supabase CLI is installed: $SUPABASE_VERSION"
else
    print_warning "Supabase CLI not installed (optional). Install with: npm install -g supabase"
fi
echo ""

# 9. Check Git
echo "9. Checking Git (optional)..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git is installed: $GIT_VERSION"
else
    print_warning "Git not installed (optional but recommended)"
fi
echo ""

# Summary
echo "======================================"
echo "  Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! Your setup is complete and ready to go!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to start development server"
    echo "  2. Open http://localhost:8080 in your browser"
    echo "  3. Check COMPLETE_SETUP_GUIDE.md for database setup"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup is mostly complete, but there are some warnings.${NC}"
    echo "Review the warnings above and fix if needed."
    echo ""
    echo "You can still try running:"
    echo "  npm run dev"
    exit 0
else
    echo -e "${RED}❌ Setup has issues that need to be fixed.${NC}"
    echo "Please address the failed checks above."
    echo ""
    echo "Common fixes:"
    echo "  - Install Node.js: https://nodejs.org"
    echo "  - Run: npm install --legacy-peer-deps"
    echo "  - Copy .env.example to .env and configure it"
    echo "  - See COMPLETE_SETUP_GUIDE.md for detailed instructions"
    exit 1
fi
