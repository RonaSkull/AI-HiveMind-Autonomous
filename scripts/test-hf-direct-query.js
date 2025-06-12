// Simple test script to verify Hugging Face API access
const axios = require('axios');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const MODEL_ID = 'Qiskit/granite-8b-qiskit';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

async function testHuggingFace() {
  try {
    console.log('🚀 Testing Hugging Face API with model:', MODEL_ID);
    
    const prompt = 'Create a simple Qiskit quantum circuit that demonstrates a Bell state';
    
    console.log('\n📝 Sending request with prompt:', `"${prompt}"`);
    
    const response = await axios.post(
      API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds
      }
    );
    
    console.log('\n✅ Response received. Status:', response.status);
    
    const generatedText = Array.isArray(response.data) && response.data[0]?.generated_text 
      ? response.data[0].generated_text 
      : JSON.stringify(response.data, null, 2);
    
    console.log('\nGenerated text:');
    console.log('='.repeat(80));
    console.log(generatedText);
    console.log('='.repeat(80));
    
    return generatedText;
    
  } catch (error) {
    console.error('\n❌ Error:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.message);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    
    throw error;
  }
}

// Run the test
testHuggingFace()
  .then(() => console.log('\n🎉 Test completed successfully!'))
  .catch(() => process.exit(1));
