// test-agent.mjs - Test script for BaseAgent (ES Modules)
import { BaseAgent } from './src/agents/BaseAgent.js';

class TestAgent extends BaseAgent {
  async initialize() {
    console.log('TestAgent initialized');
  }

  async processTask(task) {
    console.log('Processing task:', task);
    return `Processed: ${task.id}`;
  }
}

async function runTest() {
  console.log('Starting test...');
  const agent = new TestAgent();
  
  try {
    console.log('Starting agent...');
    await agent.start();
    
    console.log('Enqueuing test task...');
    const result = await agent.enqueueTask({
      id: 'test-1',
      type: 'TEST',
      data: { test: 'data' },
      priority: 1
    });
    
    console.log('Task result:', result);
    
    console.log('Stopping agent...');
    await agent.stop();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest().catch(console.error);
