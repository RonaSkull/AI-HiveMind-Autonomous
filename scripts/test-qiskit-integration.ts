import { HuggingFaceService } from '../src/services/HuggingFaceService.js';
import { createLogger } from '../src/utils/logger.js';

const logger = createLogger('QiskitIntegrationTest');

async function testQiskitIntegration() {
  try {
    console.log('🚀 Starting Qiskit model integration test...');
    
    // Initialize the HuggingFaceService
    const hfService = await HuggingFaceService.initialize();
    
    // Test question about quantum computing
    const question = 'How do I create a simple quantum circuit with Qiskit that creates a Bell state?';
    const context = 'I want to create a 2-qubit quantum circuit that creates a Bell state using Qiskit.';
    
    console.log('\n🤖 Generating quantum code...');
    console.log(`Question: ${question}`);
    
    // Generate the quantum code
    const quantumCode = await hfService.generateQuantumCode(question, context);
    
    console.log('\n✅ Generated Qiskit code:');
    console.log('```python');
    console.log(quantumCode);
    console.log('```');
    
    // Test if the code is valid Python
    if (quantumCode.includes('QuantumCircuit') && quantumCode.includes('import qiskit')) {
      console.log('\n🎉 Success! The generated code appears to be valid Qiskit code.');
    } else {
      console.warn('⚠️ Warning: The generated code might not be valid Qiskit code.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the test
testQiskitIntegration();
