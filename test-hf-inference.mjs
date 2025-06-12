// Test script to verify Hugging Face Inference API
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/['"`]/g, '');
      process.env[key] = value;
    }
  });
  console.log('✓ Loaded .env file');
}

const API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.error('✗ Error: HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('ℹ Testing Hugging Face API with key:', '***' + API_KEY.slice(-4));

// Test Hugging Face API key by fetching user information
const testAPIKey = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'huggingface.co',
      path: '/api/whoami-v2',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('\nℹ Testing Hugging Face API key...');
    
    const req = https.request(options, (res) => {
      console.log(`\nℹ Status Code: ${res.statusCode}`);
      console.log('ℹ Headers:', JSON.stringify(res.headers, null, 2));
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✓ Success! API Key is valid');
          try {
            const userInfo = JSON.parse(responseData);
            console.log('ℹ User Info:', {
              name: userInfo.name,
              email: userInfo.email,
              orgs: userInfo.orgs.map(org => org.name)
            });
          } catch (e) {
            console.log('ℹ Raw Response:', responseData);
          }
          resolve(responseData);
        } else {
          console.error('✗ Error response from API:');
          console.error(responseData);
          reject(new Error(`API returned status code ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('✗ Request error:', error);
      reject(error);
    });

    req.end();
  });
};

// Run the test
(async () => {
  try {
    await testAPIKey();
    console.log('\n✓ Hugging Face API key is valid!');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  }
})();
