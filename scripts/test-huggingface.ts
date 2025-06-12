import { huggingFaceService, HuggingFaceService } from '../src/services/HuggingFaceService.js';

async function testHuggingFace() {
  // Initialize the service
  await HuggingFaceService.initialize();

  try {
    console.log('Testing Hugging Face integration...');
    
    // Test a simple text generation
    const response = await huggingFaceService.generateText(
      'Generate a simple Qiskit hello world quantum circuit',
      {
        max_length: 500,
        temperature: 0.7,
      }
    );
    
    console.log('\nGenerated code:');
    console.log('--------------');
    console.log(response);
    
    // Test quantum code generation
    const quantumCode = await huggingFaceService.generateQuantumCode(
      'Create a 2-qubit quantum circuit that creates a Bell state',
      'python'
    );
    
    console.log('\nGenerated quantum code:');
    console.log('---------------------');
    console.log(quantumCode);
    
  } catch (error) {
    console.error('Error testing Hugging Face integration:', error);
    process.exit(1);
  }
}

testHuggingFace();
