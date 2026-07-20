import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '10s',
};

export default function () {
  const url = 'http://localhost:3000/v1/chat/completions';
  const payload = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Load testing the proxy!' }
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'test-key-12345',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 200 (Success)': (r) => r.status === 200,
    'is status 429 (Rate Limited)': (r) => r.status === 429,
  });
}
