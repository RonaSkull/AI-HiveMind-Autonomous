// Simple test to verify the API key is working (CommonJS version)
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

console.log('Sending request to Hugging Face API...');

const req = https.request(options, (res) => {
  console.log(`\nStatus Code: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API key is valid!');
      try {
        const userInfo = JSON.parse(data);
        console.log('User Info:', {
          name: userInfo.name,
          email: userInfo.email,
          orgs: userInfo.orgs?.map(org => org.name) || []
        });
      } catch (e) {
        console.log('Raw Response:', data);
      }
    } else {
      console.error('❌ API key validation failed:');
      console.error('Status Code:', res.statusCode);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
