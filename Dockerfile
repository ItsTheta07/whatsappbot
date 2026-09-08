FROM node:20-bullseye-slim

WORKDIR /app

# Install system dependencies for audio/video processing
RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=9090
EXPOSE 9090

CMD ["node", "index.js"]
