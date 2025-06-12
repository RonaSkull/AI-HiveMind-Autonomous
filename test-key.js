// Simple test to verify the API key is working
const https = require('https');
require('dotenv').config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 Testing API key...');

const options = {
  hostname: 'huggingface.co',
  path: '/api/whoami-v2',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
};

const req = https.request(options, (res) => {
  console.log(`\nStatus Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API key is valid!');
      console.log('User Info:', JSON.stringify(JSON.parse(data), null, 2));
    } else {
      console.error('❌ API key validation failed:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
