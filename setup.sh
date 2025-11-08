#!/bin/bash

echo "==================================="
echo "AI Image Archive - Setup Script"
echo "==================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your Gemini API key!"
    echo "   Get your API key from: https://aistudio.google.com/app/apikey"
    echo ""
    read -p "Press Enter after you've added your API key..."
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Starting Docker containers..."
echo ""

# Start docker compose
docker-compose up -d

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Services:"
echo "  Frontend:  http://localhost"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "Next steps:"
echo "  1. Visit http://localhost"
echo "  2. Create an account"
echo "  3. Start uploading images!"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
