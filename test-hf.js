// Simple test for Hugging Face integration
require('dotenv').config();

async function testHuggingFace() {
  try {
    console.log('Loading HuggingFaceService...');
    const { huggingFaceService, HuggingFaceService } = require('./dist/services/HuggingFaceService.js');
    
    console.log('Initializing...');
    await HuggingFaceService.initialize();
    
    console.log('Sending test request...');
    const result = await huggingFaceService.generateText('Hello, world!');
    
    console.log('Success! Response:', result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testHuggingFace();
