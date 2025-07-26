#!/bin/bash

# Liquid Sort Game - Docker Deployment Script

echo "🎮 Liquid Sort Game - Docker Deployment"
echo "======================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build and start the container
echo "🔨 Building and starting the container..."
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "🌐 Your game is now available at:"
    echo "   http://localhost:8080"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📝 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "🔄 To restart: docker-compose restart"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
