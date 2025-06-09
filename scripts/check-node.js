// Simple script to check Node.js environment (ES Module version)
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync, readdirSync } from 'fs';

console.log('=== Node.js Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());
console.log('File URL:', import.meta.url);

// Check environment variables
console.log('\n=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('IBM_QUANTUM_API_KEY:', process.env.IBM_QUANTUM_API_KEY ? '*** (set)' : 'NOT SET');
console.log('IBM_QUANTUM_INSTANCE:', process.env.IBM_QUANTUM_INSTANCE || 'Not set (using default)');

// Check if we can read files
try {
  const files = readdirSync('.');
  console.log('\n✅ File system access is working');
  console.log('Current directory contents:', files.slice(0, 10).join(', ') + (files.length > 10 ? ', ...' : ''));
  
  // Try to read .env file
  try {
    const envContent = readFileSync('.env', 'utf8');
    console.log('\n✅ .env file contents:');
    console.log(envContent.split('\n').map(line => 
      line.includes('API_KEY') ? line.substring(0, line.indexOf('=') + 1) + '***' : line
    ).join('\n'));
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
  }
} catch (error) {
  console.error('❌ Error accessing file system:', error.message);
}

// Check if we can make HTTP requests
console.log('\n=== HTTP Test ===');
try {
  const response = await fetch('https://auth.quantum-computing.ibm.com/api/version');
  const data = await response.json();
  console.log('✅ Successfully connected to IBM Quantum API');
  console.log('API Version:', data);
} catch (error) {
  console.error('❌ Error connecting to IBM Quantum API:', error.message);
}
