#!/bin/bash
# Infinity-Trancendos Setup Verification Script

set -e

echo "🔍 Verifying Infinity-Trancendos Setup..."
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "  Node.js: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v(1[8-9]|[2-9][0-9]) ]]; then
    echo "  ⚠️  Warning: Node.js 18+ recommended. Current version: $NODE_VERSION"
fi

# Check npm
echo "✓ Checking npm..."
NPM_VERSION=$(npm -v)
echo "  npm: $NPM_VERSION"

# Check if dependencies are installed
echo ""
echo "✓ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "  📦 Installing dependencies..."
    npm install
else
    echo "  ✓ Dependencies already installed"
fi

# Verify key files exist
echo ""
echo "✓ Verifying project structure..."
FILES=(
    "src/web/server.js"
    "src/web/public/index.html"
    "src/web/public/404.html"
    "package.json"
    "render.yaml"
    ".github/workflows/ci.yml"
    ".github/workflows/health-check.yml"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ Missing: $file"
        exit 1
    fi
done

# Test server start
echo ""
echo "✓ Testing server startup..."

# Start server in background and capture PID
npm start &
SERVER_PID=$!
echo "  Server started with PID: $SERVER_PID"
sleep 3
    
# Test health endpoint
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "  ✓ Health check endpoint responding"
else
    echo "  ✗ Health check failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test API endpoint
if curl -f -s http://localhost:3000/api/resources > /dev/null; then
    echo "  ✓ API endpoint responding"
else
    echo "  ✗ API endpoint failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test 404
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/nonexistent)
if [ "$HTTP_CODE" = "404" ]; then
    echo "  ✓ 404 handling working"
else
    echo "  ✗ 404 handling failed (got $HTTP_CODE)"
fi

# Cleanup - kill the specific server process
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ Setup verification complete!"
echo ""
echo "🚀 You can now:"
echo "   • Run 'npm start' to start the server"
echo "   • Visit http://localhost:3000 in your browser"
echo "   • Deploy to Render.com using the instructions in DEPLOYMENT.md"
echo ""
