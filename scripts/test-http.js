// Simple HTTP test for IBM Quantum API
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.IBM_QUANTUM_API_KEY;
const INSTANCE = process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main';

if (!API_KEY) {
  console.error('❌ IBM_QUANTUM_API_KEY is not set in .env');
  process.exit(1);
}

console.log('=== IBM Quantum HTTP Test ===');
console.log('API Key:', API_KEY.substring(0, 8) + '...');
console.log('Instance:', INSTANCE);

const options = {
  hostname: 'auth.quantum-computing.ibm.com',
  path: '/api/users/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
};

console.log('\nSending request to IBM Quantum API...');

const req = https.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:');
  console.error(error);
});

req.end();
