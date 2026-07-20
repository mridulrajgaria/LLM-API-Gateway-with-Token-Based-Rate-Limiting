const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  dailyTokenLimit: {
    type: Number,
    required: true,
    default: 100000
  },
  monthlyTokenLimit: {
    type: Number,
    required: true,
    default: 1000000
  },
  tokensUsedToday: {
    type: Number,
    default: 0
  },
  tokensUsedMonth: {
    type: Number,
    default: 0
  },
  lastRequestDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
