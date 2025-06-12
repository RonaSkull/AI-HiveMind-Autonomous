// Test script using direct HTTP requests to Hugging Face API
const fetch = require('node-fetch');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const API_URL = 'https://api-inference.huggingface.co/models';

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

async function queryHuggingFace(model, inputs, parameters = {}) {
  try {
    const response = await fetch(
      `${API_URL}/${model}`,
      {
        headers: { 
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs, parameters }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        `Request failed with status ${response.status}: ${JSON.stringify(errorData)}`
      );
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('Error in queryHuggingFace:', error.message);
    throw error;
  }
}

async function testModel(modelId, prompt) {
  try {
    console.log(`🚀 Testing model: ${modelId}`);
    console.log(`Prompt: "${prompt}"`);
    
    const response = await queryHuggingFace(
      modelId,
      prompt,
      {
        max_new_tokens: 150,
        temperature: 0.7,
        return_full_text: false
      }
    );
    
    console.log('✅ Response:');
    if (Array.isArray(response) && response[0]) {
      console.log(response[0].generated_text || response[0].summary_text || JSON.stringify(response[0]));
    } else {
      console.log(JSON.stringify(response, null, 2));
    }
    console.log('\n' + '='.repeat(80) + '\n');
    return response;
  } catch (error) {
    console.error(`❌ Error with model ${modelId}:`, error.message);
    if (error.status) {
      console.error('Status code:', error.status);
      console.error('Error details:', error.data);
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
