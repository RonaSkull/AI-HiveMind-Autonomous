// Simple HTTP test for IBM Quantum API
const https = require('https');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('=== IBM Quantum HTTP Test ===');

const API_KEY = process.env.IBM_QUANTUM_API_KEY;
const INSTANCE = process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main';

if (!API_KEY) {
  console.error('❌ IBM_QUANTUM_API_KEY is not set in .env');
  process.exit(1);
}

console.log('✅ API key is set');
console.log(`Using instance: ${INSTANCE}`);

const options = {
  hostname: 'auth.quantum-computing.ibm.com',
  path: '/api/users/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
};

console.log('\nTesting IBM Quantum API authentication...');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Successfully authenticated with IBM Quantum API');
        console.log('\nUser information:');
        console.log(`- User ID: ${result.user_id}`);
        console.log(`- Name: ${result.name || 'Not provided'}`);
        console.log(`- Email: ${result.email || 'Not provided'}`);
      } else {
        console.error(`❌ API Error (${res.statusCode}):`, data);
      }
    } catch (e) {
      console.error('❌ Error parsing API response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:');
  console.error(error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.log('\n⚠️  Network connection error. Please check your internet connection.');
  } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    console.log('\n⚠️  SSL certificate error. Try running with NODE_TLS_REJECT_UNAUTHORIZED=0 (not recommended for production)');
  }
});

req.end();
