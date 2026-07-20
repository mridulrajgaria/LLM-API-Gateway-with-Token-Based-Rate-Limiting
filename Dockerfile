# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Copy node_modules and built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
