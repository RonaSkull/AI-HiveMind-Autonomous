// Simple script to verify IBM Quantum API key
const fs = require('fs');
const path = require('path');

console.log('=== IBM Quantum API Key Verification ===');

// 1. Check if .env file exists
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error(`❌ .env file not found at: ${envPath}`);
  console.log('\nPlease create a .env file with your IBM Quantum API key:');
  console.log('IBM_QUANTUM_API_KEY=your_api_key_here');
  process.exit(1);
}

console.log(`✅ Found .env file at: ${envPath}`);

// 2. Read .env file
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error(`❌ Error reading .env file: ${error.message}`);
  process.exit(1);
}

// 3. Check for IBM Quantum API key
const apiKeyMatch = envContent.match(/^\s*IBM_QUANTUM_API_KEY\s*=\s*(['"]?)([^\r\n'"#]+)\1/m);

if (!apiKeyMatch || !apiKeyMatch[2]) {
  console.error('❌ IBM_QUANTUM_API_KEY not found in .env file');
  console.log('\nPlease add your IBM Quantum API key to the .env file:');
  console.log('IBM_QUANTUM_API_KEY=your_api_key_here');
  process.exit(1);
}

const apiKey = apiKeyMatch[2];
console.log('✅ Found IBM_QUANTUM_API_KEY in .env');
console.log(`   Key length: ${apiKey.length} characters`);
console.log(`   First 8 chars: ${apiKey.substring(0, 8)}...`);

// 4. Check for instance (optional)
let instance = 'ibm-q/open/main';
const instanceMatch = envContent.match(/^\s*IBM_QUANTUM_INSTANCE\s*=\s*(['"]?)([^\r\n'"#]+)\1/m);
if (instanceMatch && instanceMatch[2]) {
  instance = instanceMatch[2];
  console.log(`✅ Found IBM_QUANTUM_INSTANCE: ${instance}`);
} else {
  console.log(`ℹ️  Using default IBM_QUANTUM_INSTANCE: ${instance}`);
}

console.log('\n✅ IBM Quantum environment appears to be properly configured!');
console.log('\nNext steps:');
console.log('1. Make sure you have installed the required packages:');
console.log('   npm install @qiskit/ibm-runtime');
console.log('2. Test the connection with:');
console.log('   node scripts/test-quantum-fetch.js');
