#!/bin/bash

# Initialize Notion-to-TechBlog Sync project

set -e

echo "🚀 Initializing Notion-to-TechBlog Sync..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js v20 or higher is required (current: v$NODE_VERSION)"
  exit 1
fi

echo "✓ Node.js version check passed (v$NODE_VERSION)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if not exists
if [ ! -f .env ]; then
  echo ""
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "✓ .env created - please edit with your credentials"
else
  echo "✓ .env already exists"
fi

# Create directories if not exist
mkdir -p articles
mkdir -p public
mkdir -p images

echo ""
echo "✅ Initialization complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Notion and Qiita credentials"
echo "2. Run 'npm run sync:test' to test with one article"
echo "3. See SETUP.md for detailed configuration"
