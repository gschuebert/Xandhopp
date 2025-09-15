#!/bin/bash

# Script to safely rename the project directory from Portalis to Xandhopp
# This script handles all the necessary steps and considerations

set -e

echo "📁 Starting project directory rename from Portalis to Xandhopp..."

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

print_status "Step 1: Checking current directory structure..."
CURRENT_DIR=$(basename "$(pwd)")
PARENT_DIR=$(dirname "$(pwd)")
NEW_DIR_NAME="Xandhopp"

echo "Current directory: $CURRENT_DIR"
echo "Parent directory: $PARENT_DIR"
echo "New directory name: $NEW_DIR_NAME"

if [ "$CURRENT_DIR" = "Xandhopp" ]; then
    print_success "Directory is already named Xandhopp!"
    exit 0
fi

print_status "Step 2: Stopping Docker containers..."
if command -v docker-compose &> /dev/null; then
    docker-compose down || true
    print_success "Docker containers stopped"
else
    print_warning "Docker Compose not found, skipping container stop"
fi

print_status "Step 3: Checking Git status..."
if [ -d ".git" ]; then
    # Check for uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        print_warning "You have uncommitted changes. Committing them now..."
        git add -A
        git commit -m "Final commit before directory rename" || true
    fi
    
    # Check if we're on a branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_success "Git status OK. Current branch: $CURRENT_BRANCH"
else
    print_warning "No Git repository found"
fi

print_status "Step 4: Checking for running processes..."
# Check if any processes are using the current directory
if lsof +D . 2>/dev/null | grep -q .; then
    print_warning "Some processes are still using the current directory:"
    lsof +D . 2>/dev/null | head -10
    print_warning "Please close these processes before continuing"
    read -p "Press Enter to continue anyway, or Ctrl+C to abort..."
fi

print_status "Step 5: Creating backup..."
BACKUP_DIR="${PARENT_DIR}/Portalis_backup_$(date +%Y%m%d_%H%M%S)"
print_warning "Creating backup at: $BACKUP_DIR"
cp -r . "$BACKUP_DIR"
print_success "Backup created successfully"

print_status "Step 6: Moving to parent directory..."
cd "$PARENT_DIR"

print_status "Step 7: Renaming directory..."
if [ -d "$NEW_DIR_NAME" ]; then
    print_error "Directory $NEW_DIR_NAME already exists!"
    print_error "Please remove it first or choose a different name"
    exit 1
fi

mv "$CURRENT_DIR" "$NEW_DIR_NAME"
print_success "Directory renamed from $CURRENT_DIR to $NEW_DIR_NAME"

print_status "Step 8: Entering new directory..."
cd "$NEW_DIR_NAME"

print_status "Step 9: Updating any remaining absolute paths..."

# Update any hardcoded paths in configuration files
find . -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.yaml" -o -name "*.yml" | \
xargs grep -l "/var/www/Portalis" 2>/dev/null | \
while read file; do
    print_status "Updating paths in: $file"
    sed -i "s|/var/www/Portalis|/var/www/Xandhopp|g" "$file"
done

print_status "Step 10: Testing the new setup..."
# Test if we can still access the project
if [ -f "docker-compose.yml" ] && [ -f "package.json" ]; then
    print_success "Project structure is intact"
else
    print_error "Project structure seems corrupted!"
    exit 1
fi

print_success "Directory rename completed successfully!"

echo ""
echo "📋 Summary:"
echo "✅ Old directory: $CURRENT_DIR"
echo "✅ New directory: $NEW_DIR_NAME"
echo "✅ Backup created: $BACKUP_DIR"
echo "✅ Git repository preserved"
echo "✅ Configuration files updated"
echo ""

print_warning "Next steps:"
echo "1. Update your IDE/editor to open the new directory"
echo "2. Update any bookmarks or shortcuts"
echo "3. Test the application: docker-compose up -d"
echo "4. Remove the backup directory when everything works: rm -rf $BACKUP_DIR"
echo ""

print_success "🎉 Project directory successfully renamed to Xandhopp!"
