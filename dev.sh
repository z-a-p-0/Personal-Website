#!/bin/bash

# Personal Site — Local development server
# Usage: ./dev.sh [port]
# Default: http://localhost:4000

PORT="${1:-4000}"
URL="http://localhost:$PORT"

echo "🚀 Starting Personal Site dev server..."
echo "📍 Serving at $URL"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Check if port is already in use
if lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "⚠️  Port $PORT is already in use."
  echo "   Try: ./dev.sh [different-port]"
  exit 1
fi

# Try to open in browser (macOS)
if command -v open &> /dev/null; then
  open "$URL"
fi

# Start server
python3 -m http.server "$PORT" --directory "$(dirname "$0")"
