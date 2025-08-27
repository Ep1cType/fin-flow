# Use regular Node.js for maximum compatibility
FROM node:20

# Install system dependencies needed for better-sqlite3 compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native modules for Docker's architecture
RUN npm install && npm rebuild better-sqlite3

# Copy source code
COPY . .

# Generate database migrations
RUN npx drizzle-kit generate

# Build frontend
RUN npm run build:frontend

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/database.sqlite
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
