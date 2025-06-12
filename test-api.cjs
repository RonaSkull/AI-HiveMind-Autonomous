// Simple test to verify Hugging Face API key
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env file manually
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/['"`]/g, '');
      envVars[key] = value;
    }
  });
  console.log('Loaded .env file');
} else {
  console.log('No .env file found');
}

const API_KEY = envVars.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;

if (!API_KEY) {
  console.error('Error: HUGGINGFACE_API_KEY not found');
  process.exit(1);
}

console.log('Testing Hugging Face API with key:', '***' + API_KEY.slice(-4));

const data = JSON.stringify({
  inputs: {
    question: 'How do I create a simple quantum circuit with Qiskit?',
    context: 'I want to create a 2-qubit quantum circuit that creates a Bell state.'
  }
});

const options = {
  hostname: 'api-inference.huggingface.co',
  path: '/pipeline/feature-extraction/qiskit/Qiskit-7B-QA',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request to Hugging Face API...');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
