// Direct test for IBM Quantum integration
console.log('=== IBM Quantum Direct Test ===');

// Import the IBM Quantum Runtime directly
import { Qiskit } from '@qiskit/ibm-runtime';

// Configuration
const config = {
  apiKey: process.env.IBM_QUANTUM_API_KEY,
  instance: process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main'
};

async function testQuantum() {
  console.log('1. Initializing IBM Quantum Runtime...');
  
  if (!config.apiKey) {
    console.error('Error: IBM_QUANTUM_API_KEY not found in environment variables');
    console.log('Please set your IBM Quantum API key in the .env file:');
    console.log('IBM_QUANTUM_API_KEY=your_api_key_here');
    return;
  }

  try {
    // Initialize Qiskit
    const qiskit = new Qiskit({
      apiKey: config.apiKey,
      instance: config.instance
    });

    console.log('2. Creating a simple quantum circuit...');
    const circuit = {
      name: 'test-circuit',
      qubits: 1,
      operations: [
        { gate: 'h', qubits: [0] },
        { gate: 'measure', qubits: [0], cbits: [0] }
      ]
    };

    console.log('3. Running the quantum circuit (10 shots)...');
    const backend = 'ibmq_qasm_simulator';
    const result = await qiskit.run(circuit, backend, { shots: 10 });
    
    console.log('\n4. Quantum computation completed!');
    console.log('Job ID:', result.job_id);
    console.log('Backend used:', backend);
    
    if (result.results && result.results.length > 0) {
      console.log('\nMeasurement results:');
      const counts = result.results[0].data.counts;
      for (const [state, count] of Object.entries(counts)) {
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
