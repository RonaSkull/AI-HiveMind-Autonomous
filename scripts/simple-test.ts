// Simple test script for HuggingFaceService
import { HuggingFaceService } from '../src/services/HuggingFaceService.js';

async function test() {
  try {
    console.log('🚀 Starting simple test...');
    const hf = await HuggingFaceService.initialize();
    console.log('✅ Service initialized');
    
    const text = await hf.generateText('Hello, world!');
    console.log('📝 Generated text:', text);
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

test();
