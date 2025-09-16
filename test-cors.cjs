// Simple CORS test script
const https = require('https');

// Test options request
const options = {
  hostname: 'anas-backend.up.railway.app',
  port: 443,
  path: '/api/auth/cors-test',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://anas-frontend-production.up.railway.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Body:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();