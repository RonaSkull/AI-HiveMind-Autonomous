// Test script to verify environment variables and IBM Quantum setup
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env') });

console.log('=== IBM Quantum Setup Test ===');
console.log('Environment file:', resolve(__dirname, '../.env'));
console.log('IBM_QUANTUM_API_KEY:', 
  process.env.IBM_QUANTUM_API_KEY ? '*** (set)' : 'NOT SET');
console.log('IBM_QUANTUM_INSTANCE:', 
  process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main (default)');

// Test if we can load the IBM Quantum package
async function testQuantumSetup() {
  try {
    // Try dynamic import of the package
    const { Qiskit } = await import('@qiskit/ibm-runtime');
    console.log('\n✅ @qiskit/ibm-runtime is installed and can be imported');
    
    if (process.env.IBM_QUANTUM_API_KEY) {
      console.log('✅ IBM Quantum API key is set');
      
      // Try to initialize the client
      try {
        const qiskit = new Qiskit({
          apiKey: process.env.IBM_QUANTUM_API_KEY,
          instance: process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main'
        });
        console.log('✅ Successfully initialized IBM Quantum client');
        console.log('\nYou can now run: npm run quantum:direct');
      } catch (initError) {
        console.error('\n❌ Error initializing IBM Quantum client:');
        console.error(initError.message);
        if (initError.message.includes('401')) {
          console.log('\nThe API key might be invalid. Please check your IBM Quantum API key.');
        }
      }
    } else {
      console.log('\n❌ IBM Quantum API key is not set in .env');
    }
  } catch (error) {
    console.error('\n❌ Error loading @qiskit/ibm-runtime:');
    console.error(error.message);
    console.log('\nPlease make sure it is installed with:');
    console.log('npm install @qiskit/ibm-runtime');
  }
}

testQuantumSetup().catch(console.error);
