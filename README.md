# LLM API Gateway

A production-ready Node.js API Gateway designed to proxy, rate limit, and log token usage for Large Language Models (LLMs) like OpenAI, Anthropic, and others.

## Features

- **Auth Middleware**: Validates incoming API keys (`x-api-key` or `Authorization: Bearer <key>`) against MongoDB.
- **Atomic Rate Limiting**: Uses a Redis Token-Bucket Lua script (`EVAL`) to guarantee atomic read-decide-update operations for rate limiting, preventing race conditions under high load.
- **LLM Proxy & Token Counting**: Forwards authenticated requests to your configured LLM API (e.g., OpenAI, Anthropic), awaits the response, and accurately extracts token usage (prompt + completion).
- **Budget Caps**: Enforces strict daily and monthly token limits per API key.
- **Asynchronous Usage Logging**: Non-blocking usage logging to MongoDB to ensure lightning-fast proxy responses.

## Tech Stack

- **Backend Framework**: Node.js + Express
- **Database**: MongoDB (Mongoose) for users, auth, and usage logs
- **Rate Limiter / Fast State**: Redis (ioredis)
- **Containerization**: Docker, Docker Compose

## Prerequisites

- Node.js (v18+)
- MongoDB running locally or on Atlas
- Redis running locally or on Redis Cloud

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mridulrajgaria/LLM-API-Gateway-with-Token-Based-Rate-Limiting.git
   cd LLM-API-Gateway-with-Token-Based-Rate-Limiting
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy the example environment file and add your credentials:
   ```bash
   cp .env.example .env
   ```
   *Note: Update the `LLM_API_KEY` with a real provider key if you want to test live LLM proxying.*

4. **Seed the Database:**
   Run the seed script to inject mock API keys (`test-key-12345` and `test-key-67890`) and budget limits into your local MongoDB.
   ```bash
   npm run seed
   ```

5. **Start the Server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

## Testing

A local testing script is included to verify the LLM proxy and test the Redis rate limiter under load.
```bash
node scripts/test-gateway.js
```
*Note: Make sure Redis is running locally on port 6379.*

## Deployment

This project includes all necessary files for a production deployment:
- Optimized `Dockerfile` and `docker-compose.prod.yml`
- PM2 configuration (`ecosystem.config.js`)
- Nginx reverse proxy configuration (`nginx.conf`)
- Automated deployment bash script (`scripts/deploy.sh`)

For full deployment instructions (AWS EC2, Render, Railway), refer to the deployment setup guides.
