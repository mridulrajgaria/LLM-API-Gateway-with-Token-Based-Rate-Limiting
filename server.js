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

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-gateway')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mock LLM Endpoint
app.post('/mock/chat/completions', (req, res) => {
  res.status(200).json({
    id: 'chatcmpl-12345',
    object: 'chat.completion',
    created: 1677652288,
    model: req.body.model || 'gpt-4o-mini',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a mock response from the local LLM endpoint.'
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
