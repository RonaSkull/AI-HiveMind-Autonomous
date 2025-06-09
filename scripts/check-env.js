// Simple script to check environment variables
console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('IBM_QUANTUM_API_KEY:', process.env.IBM_QUANTUM_API_KEY ? '*** (set)' : 'NOT SET');
console.log('IBM_QUANTUM_INSTANCE:', process.env.IBM_QUANTUM_INSTANCE || 'Not set (using default)');

// Try to read .env file
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
console.log('\n=== .env File ===');
console.log('Path:', envPath);

if (fs.existsSync(envPath)) {
  console.log('File exists. Contents:');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(content);
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
} else {
  console.log('File does not exist.');
}
