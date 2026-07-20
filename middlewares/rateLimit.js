const { checkRateLimit } = require('../services/redisRateLimiter');

// Rate limiting middleware using Redis token bucket
const rateLimitMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.user.apiKey;
    
    // We allow 5 requests per second as an example
    // capacity: 5, refillRate: 5 per second
    const { allowed, remainingTokens } = await checkRateLimit(apiKey, 5, 5);

    res.set('X-RateLimit-Remaining', remainingTokens);

    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    next();
  } catch (error) {
    console.error('Rate Limit Middleware Error:', error);
    // Fail open or closed depending on requirements; failing closed for safety
    res.status(500).json({ error: 'Internal server error during rate limiting' });
  }
};

module.exports = rateLimitMiddleware;
