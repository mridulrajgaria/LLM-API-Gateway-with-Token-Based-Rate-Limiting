#!/bin/bash
set -e

echo "Starting deployment of LLM API Gateway..."

# 1. Pull latest code
echo "Pulling latest code from Git..."
# git pull origin main

# 2. Install dependencies
echo "Installing Node.js dependencies..."
npm ci --only=production

# 3. Reload PM2
if pm2 show llm-api-gateway > /dev/null; then
    echo "Reloading PM2 process..."
    pm2 reload llm-api-gateway --update-env
else
    echo "Starting PM2 process for the first time..."
    pm2 start ecosystem.config.js --env production
fi

# 4. Check Nginx Config
echo "Testing Nginx configuration..."
sudo nginx -t

# 5. Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "Deployment completed successfully!"
