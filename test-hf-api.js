const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/['"`]/g, '');
      process.env[key] = value;
    }
  });
  console.log('Loaded .env file');
} else {
  console.log('No .env file found');
}

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const API_URL = 'https://api-inference.huggingface.co/models/gpt2';

async function testAPI() {
  if (!API_KEY) {
    console.error('Error: HUGGINGFACE_API_KEY not found in environment variables');
    return;
  }

  console.log('Testing Hugging Face API with key:', '***' + API_KEY.slice(-4));
  
  try {
    const response = await axios.post(
      API_URL,
      { inputs: 'Hello, world!' },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('API Response:', response.data);
  } catch (error) {
    console.error('API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testAPI();
