// Simple script to verify Hugging Face API key and model access
const https = require('https');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const MODEL_ID = 'Qiskit/granite-8b-qiskit';

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 Found Hugging Face API key');
console.log('🔍 Checking access to model:', MODEL_ID);

// Check if the model exists and is accessible
const options = {
  hostname: 'huggingface.co',
  path: `/api/models/${MODEL_ID}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${HF_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ Model is accessible');
        console.log('\nModel Info:');
        console.log('='.repeat(40));
        console.log('ID:', result.id);
        console.log('Author:', result.author || 'N/A');
        console.log('Downloads:', result.downloads || 'N/A');
        console.log('Tags:', result.tags?.join(', ') || 'N/A');
        console.log('Private:', result.private ? 'Yes' : 'No');
        console.log('='.repeat(40));
        
        if (result.private) {
          console.log('\nℹ️ This is a private model. Make sure your API key has access to it.');
        }
        
        console.log('\n🎉 You can use this model with your API key!');
        
      } else {
        console.error('❌ Failed to access model:', data);
        if (res.statusCode === 401 || res.statusCode === 403) {
          console.log('\n🔒 You might need to accept the model terms at:');
          console.log(`   https://huggingface.co/${MODEL_ID}`);
        } else if (res.statusCode === 404) {
          console.log('\n🔍 The model might not exist or the ID is incorrect.');
        }
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
