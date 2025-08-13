#!/bin/bash

# OpenObserve Query Assistant Deployment Script

echo "🚀 Starting OpenObserve Query Assistant deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test -- --coverage --watchAll=false

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Build the application
echo "🏗️  Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

echo "✅ Build completed successfully!"

# Optional: Serve the build locally for testing
read -p "🌐 Would you like to serve the build locally for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌍 Starting local server..."
    npx serve -s build -p 3001
fi

echo "🎉 Deployment script completed!"
echo "📁 Built files are available in the 'build' directory"
echo "🌐 You can deploy these files to any static hosting service"
