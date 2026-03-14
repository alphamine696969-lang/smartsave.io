#!/bin/bash
# ═══════════════════════════════════════════════════════
# SmartSave.io — Render Build Script (Linux)
# ═══════════════════════════════════════════════════════

echo "📦 Installing system dependencies..."
apt-get update
apt-get install -y ffmpeg python3 python3-pip

echo "📦 Installing yt-dlp..."
pip install yt-dlp --break-system-packages

echo "📦 Installing Node.js dependencies..."
npm ci --omit=dev

echo ""
echo "✅ Verification:"
echo "  yt-dlp:  $(which yt-dlp) → $(yt-dlp --version)"
echo "  ffmpeg:  $(which ffmpeg)"
echo "  node:    $(node --version)"
echo ""
echo "🚀 Build complete!"
