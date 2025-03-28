# Use official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY bun.lock package.json ./
RUN bun install

# Copy rest of the app
COPY . .

# Start the app
CMD ["bun", "run", "start"]
