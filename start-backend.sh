#!/bin/bash

echo "==================================="
echo "Starting AI Image Archive Backend"
echo "==================================="
echo ""

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
if ! pip show fastapi > /dev/null 2>&1; then
    echo "Installing dependencies..."
    echo "This may take 5-10 minutes on first run..."
    pip install -r requirements.txt
    echo ""
fi

echo "Starting backend server on http://localhost:8000"
echo "API Docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
