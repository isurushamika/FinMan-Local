#!/bin/bash
# Local Production Build Test Script
# This script builds both frontend and backend and runs them locally

set -e  # Exit on error

echo "========================================"
echo "FinMan - Local Production Build Test"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "apps/finman" ]; then
    echo "❌ Error: apps/finman directory not found"
    echo "Please run this from the project root"
    exit 1
fi

echo "[Step 1/4] Building Frontend..."
echo "========================================"
cd apps/finman/frontend
rm -rf dist/
npm run build
echo "✅ Frontend build complete!"
echo ""

echo "[Step 2/4] Building Backend..."
echo "========================================"
cd ../backend
rm -rf dist/
npm run build
echo "✅ Backend build complete!"
echo ""

echo "[Step 3/4] Starting Backend (Production Mode)..."
echo "========================================"
echo "Backend will run on: http://localhost:3000"
echo "API endpoints: http://localhost:3000/api"
echo "Health check: http://localhost:3000/health"
echo ""
NODE_ENV=production node dist/server.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

echo ""
echo "[Step 4/4] Starting Frontend Preview..."
echo "========================================"
cd ../frontend
echo "Frontend will run on: http://localhost:4173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Trap Ctrl+C to cleanup
trap "echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

npm run preview

# Cleanup
kill $BACKEND_PID 2>/dev/null
cd ../../..
