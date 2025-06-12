// Simple script to check IBM Quantum API key setup
const fs = require('fs');
const path = require('path');

console.log('=== IBM Quantum API Key Check ===');

// Try to read .env file
const envPath = path.resolve(__dirname, '../.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`✅ Found .env file at: ${envPath}`);
} catch (error) {
  console.error(`❌ Could not read .env file at ${envPath}`);
  process.exit(1);
}

// Check for IBM Quantum API key
const apiKeyRegex = /^\s*IBM_QUANTUM_API_KEY\s*=\s*(['"]?)([^\r\n'"#]+)\1/m;
const apiKeyMatch = envContent.match(apiKeyRegex);

if (apiKeyMatch && apiKeyMatch[2]) {
  console.log('✅ IBM_QUANTUM_API_KEY is set in .env');
  console.log(`   Key length: ${apiKeyMatch[2].length} characters`);
  console.log(`   First 8 chars: ${apiKeyMatch[2].substring(0, 8)}...`);
} else {
  console.log('❌ IBM_QUANTUM_API_KEY is not set in .env');
  console.log('   Please add it to your .env file:');
  console.log('   IBM_QUANTUM_API_KEY=your_api_key_here');
  process.exit(1);
}

// Check for IBM Quantum instance
const instanceRegex = /^\s*IBM_QUANTUM_INSTANCE\s*=\s*(['"]?)([^\r\n'"#]+)\1/m;
const instanceMatch = envContent.match(instanceRegex);

if (instanceMatch && instanceMatch[2]) {
  console.log(`✅ IBM_QUANTUM_INSTANCE is set to: ${instanceMatch[2]}`);
} else {
  console.log('ℹ️  IBM_QUANTUM_INSTANCE is not set, using default: ibm-q/open/main');
}

console.log('\nNext steps:');
console.log('1. Make sure you have installed the required packages:');
console.log('   npm install @qiskit/ibm-runtime');
console.log('2. Test the connection with:');
console.log('   node scripts/test-quantum-http.js');
