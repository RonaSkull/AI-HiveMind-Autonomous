// Simple test file to verify Node.js environment
console.log('Node.js environment test');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Test ES modules dynamic import
import('node:fs').then(fs => {
  console.log('\nDynamic import works!');
  console.log('fs module functions:', Object.keys(fs).filter(k => typeof fs[k] === 'function').join(', '));
}).catch(err => {
  console.error('Dynamic import failed:', err);
});

// Test async/await
(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('\nAsync/await works!');
  } catch (err) {
    console.error('Async/await failed:', err);
  }
})();
