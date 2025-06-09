// Simple test for IBM Quantum Runtime (CommonJS version)
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('=== IBM Quantum Simple Test ===');

// Check if API key is set
if (!process.env.IBM_QUANTUM_API_KEY) {
  console.error('❌ IBM_QUANTUM_API_KEY is not set in .env');
  process.exit(1);
}

console.log('✅ API key is set');

async function testQuantum() {
  try {
    // Try to require the package
    const { Qiskit } = require('@qiskit/ibm-runtime');
    
    // Initialize Qiskit
    const qiskit = new Qiskit({
      apiKey: process.env.IBM_QUANTUM_API_KEY,
      instance: process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main'
    });
    
    console.log('✅ Successfully initialized IBM Quantum client');
    
    // List available backends
    console.log('\nFetching available backends...');
    const backends = await qiskit.backends();
    console.log('Available backends:');
    backends.forEach(backend => {
      console.log(`- ${backend.name} (${backend.status.operational ? '🟢' : '🔴'} ${backend.status.status})`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testQuantum().catch(console.error);
