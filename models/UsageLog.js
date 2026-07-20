const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  promptTokens: {
    type: Number,
    required: true
  },
  completionTokens: {
    type: Number,
    required: true
  },
  totalTokens: {
    type: Number,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('UsageLog', usageLogSchema);
