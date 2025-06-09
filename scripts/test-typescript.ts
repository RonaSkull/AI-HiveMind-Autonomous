// Simple TypeScript test file with ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('TypeScript test running with ES modules...');
console.log('File:', __filename);
console.log('Directory:', __dirname);

// Test TypeScript features
interface TestInterface {
  name: string;
  value: number;
}

const testObj: TestInterface = {
  name: 'Test',
  value: 42
};

console.log('Test object:', testObj);

// Test async/await with TypeScript
async function testAsync() {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('TypeScript async/await works!');
  
  // Test dynamic import
  try {
    const path = await import('node:path');
    console.log('TypeScript dynamic import works!');
    console.log('Current directory:', path.dirname(__dirname));
  } catch (err) {
    console.error('Dynamic import failed:', err);
  }
}

testAsync().catch(console.error);
