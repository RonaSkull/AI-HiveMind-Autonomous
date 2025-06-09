#!/usr/bin/env node

import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import quantum service using dynamic import
const { quantumService } = await import('../src/services/quantum/IBMQuantumService.js');

async function testQuantum() {
  console.log('Testing IBM Quantum Service...');
  
  if (!quantumService.isAvailable()) {
    console.error('Quantum service is not available. Please check your IBM Quantum API key in .env');
    return;
  }

  try {
    console.log('Creating a simple quantum circuit...');
    const circuit = {
      name: 'test-circuit',
      qubits: 1,
      operations: [
        { gate: 'h', qubits: [0] },
        { gate: 'measure', qubits: [0], cbits: [0] }
      ]
    };

    console.log('Running the quantum circuit...');
    const result = await quantumService.runCircuit(circuit, 100);
    
    console.log('\nQuantum computation completed successfully!');
    console.log('Job ID:', result.jobId);
    console.log('Backend used:', result.backend);
    
    if (result.result) {
      console.log('\nMeasurement results:');
      for (const [state, count] of Object.entries<number>(result.result.counts)) {
        console.log(`  ${state}: ${count} (${(count / 100 * 100).toFixed(1)}%)`);
      }
    }
  } catch (error) {
    console.error('Error running quantum test:', error);
  }
}

// Run the test
testQuantum().catch(console.error);
