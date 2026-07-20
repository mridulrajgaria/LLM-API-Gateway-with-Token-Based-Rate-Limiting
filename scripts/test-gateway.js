const axios = require('axios');

const API_URL = 'http://localhost:3000/v1/chat/completions';
const API_KEY = 'test-key-12345';

const payload = {
  model: 'gpt-4o-mini',
  messages: [
    { role: 'user', content: 'Hello! Say "test successful" if you receive this.' }
  ]
};

const sendRequest = async (index = 0) => {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, data: error.response.data };
    }
    return { status: 500, error: error.message };
  }
};

const runTest = async () => {
  console.log('--- 1. Testing Single Successful Request ---');
  const res = await sendRequest();
  console.log(`Status: ${res.status}`);
  console.log('Response:', JSON.stringify(res.data, null, 2));

  console.log('\n--- 2. Testing Rate Limiter (10 Concurrent Requests) ---');
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(sendRequest(i));
  }
  
  const results = await Promise.all(promises);
  results.forEach((r, idx) => {
    console.log(`Request ${idx + 1} - Status: ${r.status}${r.status === 429 ? ' (Rate Limited)' : ''}`);
    if (r.status === 429) {
      console.log(`   Message: ${r.data.error}`);
    }
  });
};

runTest();
