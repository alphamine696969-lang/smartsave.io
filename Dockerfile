FROM node:22-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp + yt-dlp-ejs (JS challenge solver used by newer YouTube
# clients). Without the extra, some player clients fail with
# "Requested format is not available".
RUN pip3 install -U --no-cache-dir --break-system-packages "yt-dlp[default]"

WORKDIR /app

# Install Node deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app files (cookies are provided via YOUTUBE_COOKIES env var at runtime)
COPY server.js .

ENV PORT=3001
CMD ["node", "server.js"]
