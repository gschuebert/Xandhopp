#!/bin/bash

# Script to replace all occurrences of "Portalis" with "Xandhopp" throughout the codebase
# This includes case variations: Portalis, xandhopp, PORTALIS

set -e

echo "🔄 Starting Portalis to Xandhopp replacement..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Create backup
print_status "Creating backup of current state..."
if [ -d ".git" ]; then
    git add -A
    git commit -m "Backup before Portalis to Xandhopp replacement" || true
    print_success "Git backup created"
else
    print_warning "No git repository found, skipping backup"
fi

# Function to replace in file
replace_in_file() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"
    
    if [ -f "$file" ]; then
        # Use sed with different syntax for different OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/$pattern/$replacement/g" "$file"
        else
            # Linux
            sed -i "s/$pattern/$replacement/g" "$file"
        fi
        print_success "Updated: $file"
    fi
}

# Function to replace in directory
replace_in_directory() {
    local dir="$1"
    local pattern="$2"
    local replacement="$3"
    
    if [ -d "$dir" ]; then
        find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.php" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.md" -o -name "*.sql" -o -name "*.sh" -o -name "*.ps1" -o -name "*.bat" -o -name "Dockerfile*" -o -name "Makefile" \) -exec sed -i "s/$pattern/$replacement/g" {} \;
        print_success "Updated files in: $dir"
    fi
}

print_status "Step 1: Replacing in Docker files..."

# Docker files
replace_in_file "docker-compose.yml" "xandhopp" "xandhopp"
replace_in_file "docker-compose.simple.yml" "xandhopp" "xandhopp"
replace_in_file "apps/symfony-api/Dockerfile" "xandhopp" "xandhopp"

print_status "Step 2: Replacing in configuration files..."

# Configuration files
replace_in_file "Makefile" "xandhopp" "xandhopp"
replace_in_file "apps/web/next.config.js" "xandhopp" "xandhopp"
replace_in_file "apps/admin/next.config.js" "xandhopp" "xandhopp"
replace_in_file "apps/symfony-api/config/packages/api_platform.yaml" "xandhopp" "xandhopp"

print_status "Step 3: Replacing in database files..."

# Database files
replace_in_file "packages/db-clickhouse/schema.sql" "xandhopp" "xandhopp"

print_status "Step 4: Replacing in source code files..."

# Replace in all TypeScript/JavaScript files
replace_in_directory "apps/web/src" "xandhopp" "xandhopp"
replace_in_directory "apps/admin/src" "xandhopp" "xandhopp"
replace_in_directory "apps/ingestion-worker/src" "xandhopp" "xandhopp"
replace_in_directory "packages" "xandhopp" "xandhopp"

# Replace in PHP files
replace_in_directory "apps/symfony-api/src" "xandhopp" "xandhopp"

print_status "Step 5: Replacing in content and message files..."

# Content files
replace_in_file "apps/web/content/en.ts" "Portalis" "Xandhopp"
replace_in_file "apps/web/content/de.ts" "Portalis" "Xandhopp"
replace_in_file "apps/web/messages/en.json" "Portalis" "Xandhopp"
replace_in_file "apps/web/messages/de.json" "Portalis" "Xandhopp"

print_status "Step 6: Replacing in documentation files..."

# Documentation files
replace_in_file "README.md" "Portalis" "Xandhopp"
replace_in_file "HOMEPAGE_DESIGN.md" "Portalis" "Xandhopp"
replace_in_file "COUNTRY_CONFIG_FIX.md" "Portalis" "Xandhopp"
replace_in_file "IMPORT_PATH_FIX.md" "Portalis" "Xandhopp"
replace_in_file "INGESTION_WORKER_FIXES.md" "Portalis" "Xandhopp"
replace_in_file "MIGRATION-STEPS.md" "Portalis" "Xandhopp"
replace_in_file "DATA_PIPELINE_README.md" "Portalis" "Xandhopp"
replace_in_file "QUICK_SSL_FIX.md" "Portalis" "Xandhopp"
replace_in_file "SSL_CERTIFICATE_FIXES.md" "Portalis" "Xandhopp"

print_status "Step 7: Replacing in script files..."

# Script files
replace_in_directory "scripts" "xandhopp" "xandhopp"

print_status "Step 8: Special case replacements..."

# Special cases where we need to be more specific
replace_in_file "apps/web/src/components/xandhopp-logo.tsx" "xandhopp-logo" "xandhopp-logo"

# Rename the logo file
if [ -f "apps/web/src/components/xandhopp-logo.tsx" ]; then
    mv "apps/web/src/components/xandhopp-logo.tsx" "apps/web/src/components/xandhopp-logo.tsx"
    print_success "Renamed xandhopp-logo.tsx to xandhopp-logo.tsx"
fi

print_status "Step 9: Updating package.json files..."

# Update package.json files
find . -name "package.json" -exec sed -i "s/xandhopp/xandhopp/g" {} \;

print_status "Step 10: Final cleanup..."

# Remove any remaining references in comments or strings
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.php" \) -exec sed -i "s/xandhopp/xandhopp/g" {} \;

print_success "Replacement completed!"

echo ""
echo "📋 Summary of changes:"
echo "✅ Docker files updated"
echo "✅ Configuration files updated"
echo "✅ Database schema updated"
echo "✅ Source code files updated"
echo "✅ Content and message files updated"
echo "✅ Documentation files updated"
echo "✅ Script files updated"
echo "✅ Package.json files updated"
echo "✅ Logo component renamed"
echo ""

print_warning "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Test the application to ensure everything works"
echo "3. Update any remaining references manually if needed"
echo "4. Consider renaming the root directory from 'Portalis' to 'Xandhopp'"
echo ""

print_success "🎉 Portalis to Xandhopp replacement completed!"
