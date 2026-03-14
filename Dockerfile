FROM node:18-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

# Install Node deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app files
COPY server.js .
COPY cookies.txt .

ENV PORT=3001
CMD ["node", "server.js"]
