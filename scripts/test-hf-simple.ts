import { huggingFaceService, HuggingFaceService } from '../src/services/HuggingFaceService.js';

async function main() {
  try {
    console.log('Initializing Hugging Face service...');
    await HuggingFaceService.initialize();
    
    console.log('Testing simple text generation...');
    const result = await huggingFaceService.generateText('Hello, world!');
    console.log('Success! Response:', result);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
