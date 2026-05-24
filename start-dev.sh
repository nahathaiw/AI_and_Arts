#!/bin/bash

# =============================================================================
# "The Many Lives of One Face" - Development Server Launcher
# Starts both backend and frontend in parallel
# =============================================================================

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     The Many Lives of One Face - Development Server           ║"
echo "║     Student: 楊妤安 (111006211)                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if node_modules exist in both directories
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install --prefix frontend
fi

if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  npm install --prefix backend
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
  echo "⚠️  Warning: backend/.env not found!"
  echo "   Please create backend/.env with your GEMINI_API_KEY"
  echo "   Copy from backend/.env.example and add your API key"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo "✨ Starting servers..."
echo ""

# Function to handle cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down servers..."
  pkill -P $$ || true
  wait
}

trap cleanup EXIT INT TERM

# Start backend and frontend in parallel using npm run dev
npm run dev

# Keep the script running
wait
