require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authMiddleware = require('./middlewares/auth');
const rateLimitMiddleware = require('./middlewares/rateLimit');
const { proxyRequest } = require('./controllers/llmController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-gateway')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mock LLM Endpoint
app.post('/mock/chat/completions', (req, res) => {
  const userMessage = (req.body.messages && req.body.messages[0] && req.body.messages[0].content) ? req.body.messages[0].content.toLowerCase() : '';
  
  let responseText = "That is a great question! As a secure AI proxy, I am routing this request while protecting the core API keys and logging token usage.";
  
  if (userMessage.includes('quantum')) {
    responseText = 'Quantum computing uses quantum bits (qubits) to perform complex calculations exponentially faster than classical computers.';
  } else if (userMessage.includes('api') || userMessage.includes('gateway')) {
    responseText = 'An API Gateway is a management tool that sits between a client and a collection of backend services, handling authentication and rate limiting.';
  } else if (userMessage.includes('hello') || userMessage.includes('hi')) {
    responseText = 'Hello there! I am processing your request through a highly secure token-bucket rate limiter.';
  }

  res.status(200).json({
    id: 'chatcmpl-12345',
    object: 'chat.completion',
    created: 1677652288,
    model: req.body.model || 'gpt-4o-mini',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: responseText
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 15,
      completion_tokens: 35,
      total_tokens: 50
    }
  });
});

// Routes
app.post('/v1/chat/completions', authMiddleware, rateLimitMiddleware, proxyRequest);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`LLM API Gateway running on port ${PORT}`);
});
