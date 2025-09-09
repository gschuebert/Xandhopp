#!/bin/bash
set -euo pipefail

echo "🔨 Building workspace packages..."

# Build shared packages first
echo "📦 Building @xandhopp/shared..."
cd packages/shared
pnpm build
cd ../..

echo "📦 Building @xandhopp/ui..."
cd packages/ui
pnpm build
cd ../..

echo "📦 Building @xandhopp/connectors..."
cd packages/connectors
pnpm build
cd ../..

echo "✅ Workspace packages built successfully!"
