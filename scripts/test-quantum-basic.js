// Simple test for IBM Quantum integration
console.log('Testing IBM Quantum Integration (Basic Test)');

// Import the quantum service directly from the compiled output
import { quantumService } from '../dist/services/quantum/IBMQuantumService.js';

async function testQuantum() {
  console.log('1. Checking if quantum service is available...');
  console.log('Service available:', quantumService.isAvailable());
  
  if (!quantumService.isAvailable()) {
    console.error('Quantum service is not available. Please check your IBM Quantum API key in .env');
    return;
  }

  console.log('\n2. Creating a simple quantum circuit...');
  const circuit = {
    name: 'test-circuit',
    qubits: 1,
    operations: [
      { gate: 'h', qubits: [0] },
      { gate: 'measure', qubits: [0], cbits: [0] }
    ]
  };

  console.log('3. Running the quantum circuit (10 shots)...');
  try {
    const result = await quantumService.runCircuit(circuit, 10);
    
    console.log('\n4. Quantum computation completed!');
    console.log('Job ID:', result.jobId);
    console.log('Backend used:', result.backend);
    
    if (result.result?.counts) {
      console.log('\nMeasurement results:');
      for (const [state, count] of Object.entries(result.result.counts)) {
        console.log(`  ${state}: ${count} shots`);
      }
    } else {
      console.log('No results available');
    }
  } catch (error) {
    console.error('\nError running quantum circuit:');
    console.error(error instanceof Error ? error.message : error);
  }
}

// Run the test
testQuantum().catch(console.error);
