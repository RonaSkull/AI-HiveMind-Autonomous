// Simple test to verify IBM Quantum connectivity
const { IQXService } = require('@qiskit/ibm-quantum');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('=== IBM Quantum Connection Test ===');

// Get API key from environment
const apiKey = process.env.IBM_QUANTUM_API_KEY;
const instance = process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main';

if (!apiKey) {
  console.error('❌ IBM_QUANTUM_API_KEY is not set in .env');
  process.exit(1);
}

console.log('✅ API key found');
console.log(`Using instance: ${instance}`);

async function testConnection() {
  try {
    console.log('\nInitializing IBM Quantum service...');
    const service = new IQXService({
      apiKey,
      instance
    });

    console.log('Fetching backends...');
    const backends = await service.backends();
    
    console.log('\nAvailable backends:');
    backends.forEach(backend => {
      console.log(`- ${backend.name} (${backend.status.operational ? '🟢' : '🔴'} ${backend.status.status})`);
    });
    
    console.log('\n✅ Successfully connected to IBM Quantum!');
  } catch (error) {
    console.error('\n❌ Error connecting to IBM Quantum:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    
    if (error.message.includes('401')) {
      console.log('\n⚠️  Authentication failed. Please check your IBM Quantum API key.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n⚠️  Network error. Please check your internet connection.');
    }
    
    process.exit(1);
  }
}

testConnection();
