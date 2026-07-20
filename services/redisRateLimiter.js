const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');

// Lua script for atomic Token Bucket rate limiting
// KEYS[1] = bucket key (e.g., rate_limit:apiKey)
// KEYS[2] = timestamp key (e.g., rate_limit:apiKey:ts)
// ARGV[1] = bucket capacity
// ARGV[2] = refill rate (tokens per second)
// ARGV[3] = current timestamp (seconds)
// ARGV[4] = requested tokens (usually 1 for API requests)
const luaScript = `
  local bucket_key = KEYS[1]
  local ts_key = KEYS[2]
  local capacity = tonumber(ARGV[1])
  local refill_rate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requested = tonumber(ARGV[4])

  local current_tokens = tonumber(redis.call('get', bucket_key))
  local last_refill = tonumber(redis.call('get', ts_key))

  if current_tokens == nil then
    current_tokens = capacity
    last_refill = now
  end

  local elapsed_time = math.max(0, now - last_refill)
  local generated_tokens = elapsed_time * refill_rate
  current_tokens = math.min(capacity, current_tokens + generated_tokens)

  if current_tokens >= requested then
    current_tokens = current_tokens - requested
    redis.call('set', bucket_key, current_tokens)
    redis.call('set', ts_key, now)
    -- set expiration to avoid stale keys (capacity / refill_rate is the time to full)
    local ttl = math.ceil(capacity / refill_rate)
    redis.call('expire', bucket_key, ttl)
    redis.call('expire', ts_key, ttl)
    return {1, current_tokens}
  else
    return {0, current_tokens}
  end
`;

redis.defineCommand('rateLimit', {
  numberOfKeys: 2,
  lua: luaScript
});

const checkRateLimit = async (apiKey, capacity = 10, refillRate = 1) => {
  const bucketKey = `rl:${apiKey}`;
  const tsKey = `rl:${apiKey}:ts`;
  const now = Math.floor(Date.now() / 1000);
  
  // Requesting 1 token for the request itself
  const [allowed, remainingTokens] = await redis.rateLimit(
    bucketKey, tsKey, capacity, refillRate, now, 1
  );

  return { allowed: allowed === 1, remainingTokens };
};

module.exports = {
  redis,
  checkRateLimit
};
