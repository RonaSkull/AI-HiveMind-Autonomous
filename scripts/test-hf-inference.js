// Test script using Hugging Face Inference client
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

if (!HF_TOKEN) {
  console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
  process.exit(1);
}

// Initialize the Hugging Face Inference client
const hf = new HfInference(HF_TOKEN);

async function testTextGeneration() {
  try {
    console.log('🚀 Testing text generation...');
    
    const result = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'The answer to the universe is',
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
      }
    });
    
    console.log('✅ Generated text:');
    console.log(result.generated_text);
    return result;
  } catch (error) {
    console.error('❌ Text generation failed:', error.message);
    throw error;
  }
}

async function testQiskitModel() {
  try {
    console.log('\n🚀 Testing Qiskit model...');
    
    const result = await hf.textGeneration({
      model: 'qiskit/Qiskit-7B-QA',
      inputs: 'How do I create a simple quantum circuit with Qiskit?',
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
      }
    });
    
    console.log('✅ Qiskit model response:');
    console.log(result.generated_text);
    return result;
  } catch (error) {
    console.error('❌ Qiskit model test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

async function runTests() {
  try {
    // Test basic text generation first
    await testTextGeneration();
    
    // Then test the Qiskit model
    await testQiskitModel();
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
