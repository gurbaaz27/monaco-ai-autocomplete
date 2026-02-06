#!/usr/bin/env bash

# Verification script for Monaco AI Autocomplete
# Checks that all components are built and ready

set -e

echo "🔍 Verifying Monaco AI Autocomplete build..."
echo ""

# Check Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install from https://bun.sh"
    exit 1
fi
echo "✅ Bun is installed: $(bun --version)"

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run: bun install"
    exit 1
fi
echo "✅ Root dependencies installed"

# Check core package
if [ ! -d "packages/core/dist" ]; then
    echo "❌ Core package not built. Run: bun run build:core"
    exit 1
fi
echo "✅ Core package built"

# Check core exports
if [ ! -f "packages/core/dist/index.js" ]; then
    echo "❌ Core package index.js missing"
    exit 1
fi
echo "✅ Core package exports found"

# Check extension build
if [ ! -d "packages/extension/.output/chrome-mv3" ]; then
    echo "❌ Extension not built. Run: bun run build:ext"
    exit 1
fi
echo "✅ Extension built"

# Check manifest
if [ ! -f "packages/extension/.output/chrome-mv3/manifest.json" ]; then
    echo "❌ Extension manifest.json missing"
    exit 1
fi
echo "✅ Extension manifest found"

# Check key files
KEY_FILES=(
    "packages/extension/.output/chrome-mv3/background.js"
    "packages/extension/.output/chrome-mv3/injected.js"
    "packages/extension/.output/chrome-mv3/popup.html"
    "packages/extension/.output/chrome-mv3/content-scripts/content.js"
)

for file in "${KEY_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    fi
done
echo "✅ All extension files present"

# Check file sizes
BG_SIZE=$(wc -c < "packages/extension/.output/chrome-mv3/background.js" | xargs)
if [ "$BG_SIZE" -lt 1000 ]; then
    echo "❌ background.js seems too small ($BG_SIZE bytes)"
    exit 1
fi
echo "✅ File sizes look good (background.js: $BG_SIZE bytes)"

echo ""
echo "🎉 All checks passed!"
echo ""
echo "Next steps:"
echo "1. Open Chrome and go to chrome://extensions"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked'"
echo "4. Select: packages/extension/.output/chrome-mv3"
echo "5. Get API key from: https://openrouter.ai/keys"
echo "6. Configure extension and test on https://godbolt.org"
echo ""
echo "See QUICKSTART.md for detailed instructions."
