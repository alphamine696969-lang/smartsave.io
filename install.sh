#!/bin/bash
# ═══════════════════════════════════════════════════════
# SmartSave.io — Render Build Script (Native Node.js)
# Downloads yt-dlp + ffmpeg as standalone Linux binaries
# ═══════════════════════════════════════════════════════

set -e

echo "📦 Installing Node.js dependencies..."
npm ci --omit=dev

echo ""
echo "📥 Downloading yt-dlp (standalone Linux binary)..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp
chmod +x ./yt-dlp
echo "  ✅ yt-dlp downloaded: $(./yt-dlp --version)"

echo ""
echo "📥 Downloading ffmpeg (static Linux build)..."
curl -L https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz -o /tmp/ffmpeg.tar.xz
mkdir -p ./ffmpeg-bin
tar -xf /tmp/ffmpeg.tar.xz -C /tmp/
cp /tmp/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg ./ffmpeg-bin/ffmpeg
cp /tmp/ffmpeg-master-latest-linux64-gpl/bin/ffprobe ./ffmpeg-bin/ffprobe
chmod +x ./ffmpeg-bin/ffmpeg ./ffmpeg-bin/ffprobe
rm -rf /tmp/ffmpeg.tar.xz /tmp/ffmpeg-master-latest-linux64-gpl
echo "  ✅ ffmpeg downloaded"

echo ""
echo "🎉 Build complete! All tools ready."
echo "  yt-dlp:  ./yt-dlp"
echo "  ffmpeg:  ./ffmpeg-bin/ffmpeg"
