import { HuggingFaceService } from '../src/services/HuggingFaceService.js';
import { createLogger } from '../src/utils/logger.js';

const logger = createLogger('HFServiceTest');

async function testHuggingFaceService() {
  try {
    console.log('🚀 Testing Hugging Face Service...');
    
    // Initialize the service
    const hfService = await HuggingFaceService.initialize();
    
    // Test basic text generation
    console.log('\n📝 Testing text generation...');
    const prompt = 'Explain quantum computing in simple terms:';
    const generatedText = await hfService.generateText(prompt, {
      max_new_tokens: 100,
      temperature: 0.7,
    });
    
    console.log('\n🤖 Generated text:');
    console.log(generatedText);
    
    // Test quantum code generation
    console.log('\n🔬 Testing quantum code generation...');
    const quantumCode = await hfService.generateQuantumCode(
      'Create a simple quantum circuit with 2 qubits',
      'Use Qiskit to create a simple circuit that demonstrates superposition.'
    );
    
    console.log('\n💻 Generated quantum code:');
    console.log('```python');
    console.log(quantumCode);
    console.log('```');
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the test
testHuggingFaceService();
