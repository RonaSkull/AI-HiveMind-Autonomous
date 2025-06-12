// Test script for Qiskit code generation using HuggingFaceService (CommonJS)
const { HuggingFaceService } = require('../dist/services/HuggingFaceService');
const { createLogger } = require('../dist/utils/logger');
require('dotenv').config();

const logger = createLogger('QiskitTest');

async function testQiskitCodeGeneration() {
  try {
    console.log('🚀 Initializing HuggingFaceService...');
    
    // Initialize the service
    const hfService = await HuggingFaceService.initialize();
    
    // Test question about quantum computing
    const question = 'Create a quantum circuit that demonstrates quantum entanglement';
    const context = 'Use Qiskit to create a simple 2-qubit circuit that creates a Bell state.';
    
    console.log('\n🤖 Generating Qiskit code...');
    console.log(`Question: ${question}`);
    if (context) {
      console.log(`Context: ${context}`);
    }
    
    // Generate the quantum code
    const startTime = Date.now();
    const quantumCode = await hfService.generateQuantumCode(question, context);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Generated Qiskit code (${elapsedTime}s):`);
    console.log('```python');
    console.log(quantumCode);
    console.log('```');
    
    // Basic validation of the generated code
    const hasQiskitImport = quantumCode.includes('import qiskit') || quantumCode.includes('from qiskit');
    const hasQuantumCircuit = quantumCode.includes('QuantumCircuit');
    
    if (hasQiskitImport && hasQuantumCircuit) {
      console.log('\n🎉 Success! The generated code appears to be valid Qiskit code.');
    } else {
      console.warn('\n⚠️ Warning: The generated code might not be valid Qiskit code.');
      if (!hasQiskitImport) console.warn('   - Missing Qiskit import');
      if (!hasQuantumCircuit) console.warn('   - Missing QuantumCircuit usage');
    }
    
    return quantumCode;
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testQiskitCodeGeneration();
