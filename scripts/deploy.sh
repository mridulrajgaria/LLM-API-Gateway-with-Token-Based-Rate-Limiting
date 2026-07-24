#!/bin/bash
set -e

echo "Starting deployment of LLM API Gateway..."

# 1. Pull latest code
echo "Pulling latest code from Git..."
# git pull origin main

# 2. Deploy with Docker Compose
echo "Building and starting Docker containers..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# 4. Check Nginx Config
echo "Testing Nginx configuration..."
sudo nginx -t

# 5. Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "Deployment completed successfully!"
