const axios = require('axios');
const User = require('../models/User');
const UsageLog = require('../models/UsageLog');

// Check if user has exceeded their daily/monthly token budget
const checkBudget = (user) => {
  const now = new Date();
  
  // Reset daily tokens if it's a new day
  if (user.lastRequestDate.getUTCDate() !== now.getUTCDate() || 
      user.lastRequestDate.getUTCMonth() !== now.getUTCMonth() || 
      user.lastRequestDate.getUTCFullYear() !== now.getUTCFullYear()) {
    user.tokensUsedToday = 0;
  }
  
  // Reset monthly tokens if it's a new month
  if (user.lastRequestDate.getUTCMonth() !== now.getUTCMonth() || 
      user.lastRequestDate.getUTCFullYear() !== now.getUTCFullYear()) {
    user.tokensUsedMonth = 0;
  }
  
  user.lastRequestDate = now;

  if (user.tokensUsedToday >= user.dailyTokenLimit) {
    return { allowed: false, reason: 'Daily token limit exceeded' };
  }
  
  if (user.tokensUsedMonth >= user.monthlyTokenLimit) {
    return { allowed: false, reason: 'Monthly token limit exceeded' };
  }

  return { allowed: true };
};

// Async function to log usage to MongoDB without blocking response
const logUsageAsync = (user, tokens, providerDetails) => {
  setImmediate(async () => {
    try {
      // 1. Update User token counts atomically
      await User.findByIdAndUpdate(user._id, {
        $inc: {
          tokensUsedToday: tokens.totalTokens,
          tokensUsedMonth: tokens.totalTokens
        },
        $set: {
          lastRequestDate: new Date()
        }
      });

      // 2. Create Usage Log
      await UsageLog.create({
        userId: user._id,
        promptTokens: tokens.promptTokens,
        completionTokens: tokens.completionTokens,
        totalTokens: tokens.totalTokens,
        model: providerDetails.model,
        provider: providerDetails.provider,
        endpoint: providerDetails.endpoint
      });
      
    } catch (error) {
      console.error('Error logging usage asynchronously:', error);
    }
  });
};

const proxyRequest = async (req, res) => {
  const user = req.user;
  
  // Check budget before making request
  const budgetCheck = checkBudget(user);
  if (!budgetCheck.allowed) {
    return res.status(429).json({ error: budgetCheck.reason });
  }

  const provider = process.env.LLM_PROVIDER || 'openai';
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL;

  try {
    let headers = {
      'Content-Type': 'application/json'
    };
    
    let payload = req.body;
    
    // Setup headers and payload based on provider
    if (provider === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
      // Ensure model is set
      if (!payload.model) payload.model = model;
    } else if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      if (!payload.model) payload.model = model;
    }

    const response = await axios.post(baseUrl, payload, { headers });
    
    const data = response.data;
    
    let tokens = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    // Extract token usage based on provider
    if (provider === 'openai' && data.usage) {
      tokens = {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      };
    } else if (provider === 'anthropic' && data.usage) {
      tokens = {
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
      };
    }
    
    // Log asynchronously
    logUsageAsync(user, tokens, {
      model: payload.model || model,
      provider: provider,
      endpoint: baseUrl
    });

    // Return the LLM response to the client
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('LLM Proxy Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: 'Failed to communicate with LLM provider' };
    return res.status(status).json(message);
  }
};

module.exports = {
  proxyRequest
};
