// Simple test script to verify TypeScript and Node.js setup
console.log('TypeScript is working!');
console.log('Node.js version:', process.version);

// Test object spread
const testObj = { a: 1, b: 2 };
console.log('Test object:', { ...testObj, c: 3 });

// Test async/await
const testAsync = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Async/await works!');
};

testAsync().catch(console.error);

// Test dynamic import
import('node:fs').then(fs => {
  console.log('Dynamic import works!');
}).catch(console.error);
