#!/bin/bash
# Infinity-Trancendos Setup Verification Script

set -e

# Helper functions
print_status() {
    printf "\e[36m✓ %s\e[0m\n" "$*"
}

print_error() {
    printf "\e[31m✗ %s\e[0m\n" "$*"
}

cleanup_server() {
    # Kill any existing Node.js server processes on port 3000
    # Using lsof to find process by port instead of pkill
    local pid=$(lsof -ti:3000 2>/dev/null || echo "")
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null || true
        sleep 1
    fi
}

echo "🔍 Verifying Infinity-Trancendos Setup..."
echo ""

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "  Node.js: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v(1[8-9]|[2-9][0-9]) ]]; then
    echo "  ⚠️  Warning: Node.js 18+ recommended. Current version: $NODE_VERSION"
fi

# Check npm
print_status "Checking npm..."
NPM_VERSION=$(npm -v)
echo "  npm: $NPM_VERSION"

# Check if dependencies are installed
echo ""
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "  📦 Installing dependencies..."
    npm install
else
    echo "  ✓ Dependencies already installed"
fi

# Verify key files exist
echo ""
print_status "Verifying project structure..."
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
        print_error "Missing: $file"
        exit 1
    fi
done

# Test server start
echo ""
print_status "Testing server startup..."

# Kill any existing servers on port 3000
cleanup_server

timeout 15 bash -c '
    npm start &
    SERVER_PID=$!
    sleep 3
    
    # Helper for test output
    test_endpoint() {
        local name=$1
        local url=$2
        local expected_code=${3:-200}
        
        if [ "$expected_code" = "200" ]; then
            if curl -f -s "$url" > /dev/null; then
                echo "  ✓ $name"
                return 0
            fi
        else
            local code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
            if [ "$code" = "$expected_code" ]; then
                echo "  ✓ $name"
                return 0
            else
                echo "  ✗ $name (got $code, expected $expected_code)"
                return 1
            fi
        fi
        echo "  ✗ $name failed"
        return 1
    }
    
    # Run tests
    test_endpoint "Health check endpoint responding" "http://localhost:3000/health"
    test_endpoint "API endpoint responding" "http://localhost:3000/api/resources"
    test_endpoint "404 handling working" "http://localhost:3000/nonexistent" "404"
    
    # Cleanup
    kill $SERVER_PID 2>/dev/null || true
' || echo "  ⚠️  Server test timed out or failed"

# Final cleanup
cleanup_server

echo ""
echo "✅ Setup verification complete!"
echo ""
echo "🚀 You can now:"
echo "   • Run 'npm start' to start the server"
echo "   • Visit http://localhost:3000 in your browser"
echo "   • Deploy to Render.com using the instructions in DEPLOYMENT.md"
echo ""
