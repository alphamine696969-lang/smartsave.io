# ═══════════════════════════════════════════════════════
# SmartSave.io — Render Docker Build (Linux)
# ═══════════════════════════════════════════════════════
FROM node:18-slim

# Install system deps: Python, pip, ffmpeg, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip
RUN pip3 install --break-system-packages yt-dlp

# Verify all tools are installed correctly
RUN echo "--- Verification ---" \
    && echo "yt-dlp:" && which yt-dlp && yt-dlp --version \
    && echo "ffmpeg:" && which ffmpeg && ffmpeg -version | head -1 \
    && echo "node:" && node --version \
    && echo "npm:" && npm --version \
    && echo "--- All OK ---"

# Set working directory
WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend server
COPY server.js .

# Copy YouTube cookies (for authentication bypass)
# This file is REQUIRED for YouTube to work from data center IPs
COPY cookies.txt ./cookies.txt

# Render sets PORT dynamically
ENV PORT=3001

# Start the server
CMD ["node", "server.js"]

