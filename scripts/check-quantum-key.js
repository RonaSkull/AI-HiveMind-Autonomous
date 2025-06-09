// Simple script to verify IBM Quantum API key setup
console.log('=== IBM Quantum API Key Check ===');

const apiKey = process.env.IBM_QUANTUM_API_KEY;
const instance = process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main';

console.log('Checking environment variables:');
console.log(`- IBM_QUANTUM_API_KEY: ${apiKey ? '*** (set)' : 'NOT SET'}`);
console.log(`- IBM_QUANTUM_INSTANCE: ${instance}`);

if (!apiKey) {
  console.log('\n❌ Error: IBM_QUANTUM_API_KEY is not set in your .env file.');
  console.log('Please add the following to your .env file:');
  console.log('IBM_QUANTUM_API_KEY=your_actual_api_key_here');
  console.log('IBM_QUANTUM_INSTANCE=ibm-q/open/main  # optional, this is the default');
  process.exit(1);
}

console.log('\n✅ IBM Quantum API key is set in environment variables.');
console.log('To test the IBM Quantum integration, run:');
console.log('1. npm install @qiskit/ibm-runtime');
console.log('2. node scripts/test-quantum-direct.js');
