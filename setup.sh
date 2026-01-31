#!/bin/bash

echo "=== Setting up Rust Backend Project ==="
echo ""

echo "1. Creating data directories..."
mkdir -p data/db data/images
echo "✓ Data directories created"
echo ""

echo "2. Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created from .env.example"
    echo "⚠ IMPORTANT: Edit .env and change JWT_SECRET before running in production!"
else
    echo "✓ .env file already exists"
fi
echo ""

echo "3. Setting permissions for scripts..."
chmod +x test_api.sh setup.sh
echo "✓ Scripts are now executable"
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo ""
echo "For Docker (recommended):"
echo "  docker-compose up -d"
echo ""
echo "For local development:"
echo "  cd backend"
echo "  cargo run"
echo ""
echo "The API will be available at http://localhost:8080"
echo ""
echo "To test the API:"
echo "  ./test_api.sh"
echo ""
