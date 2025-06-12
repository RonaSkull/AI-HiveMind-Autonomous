// Simple HTTP test for IBM Quantum API using new IAM authentication flow
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

const getTokenOptions = {
  hostname: 'iam.cloud.ibm.com',
  path: '/identity/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
};

const postData = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${API_KEY}`;

console.log('\nStep 1: Requesting temporary access token from IBM Cloud IAM...');

const tokenReq = https.request(getTokenOptions, (tokenRes) => {
  let tokenData = '';
  tokenRes.on('data', (chunk) => { tokenData += chunk; });
  tokenRes.on('end', () => {
    if (tokenRes.statusCode !== 200) {
      console.error(`❌ Failed to get access token. Status: ${tokenRes.statusCode}`);
      console.error('Response:', tokenData);
      return;
    }

    console.log('✅ Successfully received access token.');
    const { access_token } = JSON.parse(tokenData);

    console.log('\nStep 2: Testing authentication with the new Quantum API...');

    const quantumApiOptions = {
      hostname: 'api.quantum.ibm.com', // New endpoint
      path: '/v2/users/me', // New path
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}` // Use the temporary token
      }
    };

    const quantumReq = https.request(quantumApiOptions, (quantumRes) => {
      let quantumData = '';
      quantumRes.on('data', (chunk) => { quantumData += chunk; });
      quantumRes.on('end', () => {
        if (quantumRes.statusCode === 200) {
          console.log('✅ Successfully authenticated with IBM Quantum API!');
          const userInfo = JSON.parse(quantumData);
          console.log(`   - User ID: ${userInfo.id}`)
          console.log(`   - Email: ${userInfo.email}`)
        } else {
          console.error(`❌ Quantum API Error (${quantumRes.statusCode}):`, quantumData);
        }
      });
    });

    quantumReq.on('error', (e) => console.error('❌ Quantum API Request Error:', e.message));
    quantumReq.end();
  });
});

tokenReq.on('error', (e) => console.error('❌ IAM Request Error:', e.message));
tokenReq.write(postData);
tokenReq.end();
