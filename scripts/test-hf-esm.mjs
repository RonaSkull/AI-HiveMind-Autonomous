// Test script using Hugging Face Inference with ES modules
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

// Initialize the Hugging Face Inference client
const hf = new HfInference(HF_TOKEN);

async function testModel(modelId, prompt) {
  try {
    console.log(`🚀 Testing model: ${modelId}`);
    console.log(`Prompt: "${prompt}"`);
    
    const response = await hf.textGeneration({
      model: modelId,
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
      }
    });
    
    console.log('✅ Response:');
    console.log(response.generated_text);
    console.log('\n' + '='.repeat(80) + '\n');
    return response;
  } catch (error) {
    console.error(`❌ Error with model ${modelId}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

async function main() {
  try {
    // Test with a standard model first
    await testModel(
      'gpt2',
      'Explain quantum computing in simple terms:'
    );
    
    // Then test with the Qiskit model
    await testModel(
      'qiskit/Qiskit-7B-QA',
      'How do I create a simple quantum circuit with Qiskit?\nPlease provide a complete Python code example.'
    );
    
    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
