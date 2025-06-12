// Simple script to check environment variables
require('dotenv').config();

console.log('Environment Variables:');
console.log('---------------------');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '***' + process.env.HUGGINGFACE_API_KEY.slice(-4) : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('---------------------');

// Try to load and log the HuggingFaceService
console.log('Loading HuggingFaceService...');
try {
  const { HuggingFaceService } = require('./dist/services/HuggingFaceService');
  console.log('HuggingFaceService loaded successfully');
} catch (error) {
  console.error('Failed to load HuggingFaceService:', error);
}
