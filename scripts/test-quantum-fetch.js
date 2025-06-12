// Simple test for IBM Quantum API using node-fetch

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.IBM_QUANTUM_API_KEY;
const INSTANCE = process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main';

if (!API_KEY) {
  console.error('❌ IBM_QUANTUM_API_KEY is not set in .env');
  process.exit(1);
}

console.log('=== IBM Quantum API Test ===');
console.log('Using instance:', INSTANCE);

async function testQuantumAPI() {
  const fetch = (await import('node-fetch')).default;
  try {
    console.log('\nTesting IBM Quantum API authentication...');
    
    const response = await fetch('https://auth.quantum-computing.ibm.com/api/users/me', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Successfully authenticated with IBM Quantum API');
      console.log('\nUser information:');
      console.log(`- User ID: ${data.user_id}`);
      console.log(`- Name: ${data.name || 'Not provided'}`);
      console.log(`- Email: ${data.email || 'Not provided'}`);
    } else {
      console.error('❌ Authentication failed:');
      console.error(data);
    }
    
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n⚠️  Network error. Please check your internet connection.');
    } else if (error.type === 'system' && error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.log('\n⚠️  SSL certificate error. Try running with NODE_TLS_REJECT_UNAUTHORIZED=0 (not recommended for production)');
    }
  }
}

testQuantumAPI();
