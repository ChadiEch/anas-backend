# Use Node.js 18 alpine image
FROM node:18-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-pip

# Install setuptools for distutils
RUN pip3 install setuptools

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => {if(res.statusCode !== 200) process.exit(1)})"

# Start the application
CMD ["npm", "start"]