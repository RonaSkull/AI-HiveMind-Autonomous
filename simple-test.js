// Simple test to verify Node.js can run a basic script
console.log('Simple test script is running!');

// Try to import a built-in module
import { readFile } from 'fs/promises';

console.log('Successfully imported fs/promises');

// Keep the process alive
setInterval(() => {}, 1000);
