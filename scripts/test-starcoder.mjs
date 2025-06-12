// Test script for Hugging Face Inference API with StarCoder2 (ES Module)
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
const MODEL_ID = 'bigcode/starcoder2-7b';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

async function generateQiskitCode(prompt) {
  try {
    console.log('🚀 Generating Qiskit code with StarCoder2...');
    
    // Format the prompt to get good Qiskit code
    const fullPrompt = `# Create a Qiskit quantum circuit that demonstrates quantum entanglement
# ${prompt}
# Complete the following Python code:

from qiskit import QuantumCircuit, Aer, execute
import numpy as np

# Create a 2-qubit quantum circuit`;

    console.log('\nSending request to Hugging Face...');
    
    const response = await axios.post(
      API_URL,
      {
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.2,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds
      }
    );
    
    console.log('\n✅ Code generated successfully!');
    
    // Extract the generated code
    let generatedCode = response.data[0]?.generated_text || '';
    
    // Clean up the response
    generatedCode = generatedCode
      .replace(/```python/g, '') // Remove Python code block markers if present
      .replace(/```/g, '')
      .trim();
    
    console.log('\nGenerated Qiskit code:');
    console.log('='.repeat(80));
    console.log(generatedCode);
    console.log('='.repeat(80));
    
    return generatedCode;
    
  } catch (error) {
    console.error('\n❌ Error generating code:');
    
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
const testPrompt = 'Create a 2-qubit quantum circuit that demonstrates quantum entanglement';

// Run the test
generateQiskitCode(testPrompt)
  .then(() => console.log('\n🎉 Test completed successfully!'))
  .catch(() => process.exit(1));
