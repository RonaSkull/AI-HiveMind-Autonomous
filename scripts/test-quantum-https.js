// Simple test for IBM Quantum API using native https
const https = require('https');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('=== IBM Quantum HTTPS Test ===');

const API_KEY = process.env.IBM_QUANTUM_API_KEY;
if (!API_KEY) {
  console.error('❌ IBM_QUANTUM_API_KEY is not set in .env');
  process.exit(1);
}

console.log('✅ API key found');
console.log('Making request to IBM Quantum API...\n');

const options = {
  hostname: 'auth.quantum-computing.ibm.com',
  path: '/api/users/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  // Bypass SSL certificate verification (for testing only)
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
      if (res.statusCode === 200) {
        console.log('\n✅ Successfully connected to IBM Quantum API!');
      } else {
        console.log('\n❌ Failed to authenticate with IBM Quantum API');
      }
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
