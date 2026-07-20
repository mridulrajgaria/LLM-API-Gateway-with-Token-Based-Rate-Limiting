const mongoose = require('mongoose');
const User = require('../models/User');
const UsageLog = require('../models/UsageLog');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/llm-gateway');
  const logs = await UsageLog.find().populate('userId', 'name apiKey');
  console.log(JSON.stringify(logs, null, 2));
  process.exit(0);
}
check();
