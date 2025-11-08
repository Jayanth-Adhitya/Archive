#!/bin/bash

echo "==================================="
echo "Starting AI Image Archive Frontend"
echo "==================================="
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo "This may take 2-3 minutes..."
    npm install
    echo ""
fi

echo "Starting frontend development server"
echo "Application will be available at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
