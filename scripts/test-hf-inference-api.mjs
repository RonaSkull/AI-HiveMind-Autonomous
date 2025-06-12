// Test script for Hugging Face Inference API (ES Module)
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
// Using a standard Qiskit model that's available on Hugging Face
const MODEL_ID = 'Qiskit/granite-3.3-8b-qiskit';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

async function queryHuggingFace(prompt) {
  try {
    console.log('🚀 Sending request to Hugging Face Inference API...');
    console.log(`Model: ${MODEL_ID}`);
    console.log(`Prompt: "${prompt}"`);
    
    const response = await axios.post(
      API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
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
    
    console.log('\n✅ Response received!');
    return response.data;
    
  } catch (error) {
    console.error('\n❌ Error:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔑 Please check your Hugging Face API key');
        console.log('Get your API key: https://huggingface.co/settings/tokens');
      } else if (error.response.status === 503) {
        console.log('\n⏳ Model is loading, please wait and try again');
        console.log(`Model page: https://huggingface.co/${MODEL_ID}`);
      }
    } else {
      console.error(error.message);
    }
    
    throw error;
  }
}

// Test with a quantum computing question
const testPrompt = `Create a 2-qubit quantum circuit using Qiskit that demonstrates quantum entanglement. 
Please provide the complete Python code.`;

// Run the test
queryHuggingFace(testPrompt)
  .then(response => {
    console.log('\nGenerated response:');
    console.log('='.repeat(80));
    console.log(Array.isArray(response) ? response[0]?.generated_text || response : response);
    console.log('='.repeat(80));
  })
  .catch(() => process.exit(1));
