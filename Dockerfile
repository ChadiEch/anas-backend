# Use Node.js 18 slim image (Debian-based) instead of Alpine for better native module support
FROM node:18-slim

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 build-essential pkg-config && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => {if(res.statusCode !== 200) process.exit(1)})"

# Start the application
CMD ["npm", "start"]