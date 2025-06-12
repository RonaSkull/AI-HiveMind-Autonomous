// test-agent.ts - Test script for BaseAgent
import { BaseAgent } from './src/agents/BaseAgent.js';

// Enable debug logging
process.env.DEBUG = '*';

class TestAgent extends BaseAgent {
  async initialize(): Promise<void> {
    console.log('[TestAgent] initialize() called');
    console.time('[TestAgent] Initialize timer');
    
    try {
      // Simulate some async initialization
      await new Promise<void>((resolve) => {
        console.log('[TestAgent] Simulating async initialization...');
        setTimeout(() => {
          console.log('[TestAgent] Async initialization complete');
          resolve();
        }, 100);
      });
      
      console.log('[TestAgent] Initialization complete');
    } finally {
      console.timeEnd('[TestAgent] Initialize timer');
    }
  }

  async processTask(task: any): Promise<any> {
    console.log(`[TestAgent] processTask() called with:`, {
      id: task.id,
      type: task.type,
      data: task.data
    });
    
    console.time(`[TestAgent] Processing task ${task.id}`);
    
    try {
      // Simulate some work
      await new Promise<void>((resolve) => {
        console.log(`[TestAgent] Simulating work for task ${task.id}...`);
        setTimeout(() => {
          console.log(`[TestAgent] Work complete for task ${task.id}`);
          resolve();
        }, 500);
      });
      
      const result = {
        status: 'completed',
        taskId: task.id,
        processedAt: new Date().toISOString(),
        agent: this.constructor.name
      };
      
      console.log(`[TestAgent] Task ${task.id} processed successfully`);
      return result;
    } catch (error) {
      console.error(`[TestAgent] Error processing task ${task.id}:`, error);
      throw error;
    } finally {
      console.timeEnd(`[TestAgent] Processing task ${task.id}`);
    }
  }
  
  async stop(): Promise<void> {
    console.log('[TestAgent] Stopping...');
    console.time('[TestAgent] Stop timer');
    try {
      await super.stop();
      console.log('[TestAgent] Stopped successfully');
    } finally {
      console.timeEnd('[TestAgent] Stop timer');
    }
  }
}

async function runTest() {
  console.log('='.repeat(80));
  console.log('STARTING TEST');
  console.log('='.repeat(80));
  
  console.time('Total test time');
  let agent: TestAgent | null = null;
  
  try {
    // Create agent instance
    console.log('\n[Test] Creating TestAgent instance...');
    agent = new TestAgent();
    
    // Add error handler for unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('\n[Test] Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
    // Start the agent
    console.log('\n[Test] Starting agent...');
    await agent.start();
    
    // Enqueue test tasks
    const testTasks = [
      {
        id: `task-${Date.now()}-1`,
        type: 'TEST',
        data: { 
          message: 'First test task',
          timestamp: new Date().toISOString()
        },
        priority: 1
      },
      {
        id: `task-${Date.now()}-2`,
        type: 'TEST',
        data: { 
          message: 'Second test task',
          timestamp: new Date().toISOString()
        },
        priority: 2
      }
    ];
    
    console.log('\n[Test] Enqueuing test tasks...');
    const taskPromises = testTasks.map(async (task, index) => {
      console.log(`[Test] Enqueuing task ${index + 1}:`, task);
      try {
        const result = await agent!.enqueueTask(task);
        console.log(`[Test] Task ${task.id} completed:`, result);
        return result;
      } catch (error) {
        console.error(`[Test] Task ${task.id} failed:`, error);
        throw error;
      }
    });
    
    // Wait for all tasks to complete with timeout
    console.log('\n[Test] Waiting for all tasks to complete (timeout: 10s)...');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout after 10 seconds')), 10000)
    );
    
    const results = await Promise.race([
      Promise.all(taskPromises),
      timeoutPromise
    ]) as any[];
    
    console.log('\n[Test] All tasks completed successfully:', results);
    return results;
  } catch (error) {
    console.error('\n[Test] Test failed with error:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    // Clean up the agent if it was created
    if (agent) {
      try {
        console.log('\n[Test] Cleaning up agent...');
        await agent.stop();
        console.log('[Test] Agent stopped successfully');
      } catch (stopError) {
        console.error('[Test] Error stopping agent:', stopError);
      }
    }
    
    console.timeEnd('Total test time');
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETED');
    console.log('='.repeat(80));
  }
}

// Run the test with a global timeout
const TEST_TIMEOUT = 10000; // 10 seconds
const FORCE_EXIT_DELAY = 2000; // Additional 2 seconds before force exit

async function runWithTimeout() {
  return new Promise<void>((resolve, reject) => {
    let completed = false;
    let forceExitTimer: NodeJS.Timeout;

    const cleanup = () => {
      if (!completed) {
        completed = true;
        clearTimeout(forceExitTimer);
        // Force exit if we're still here after cleanup
        setTimeout(() => {
          console.log('\n[Test] Force exiting process...');
          process.exit(0);
        }, FORCE_EXIT_DELAY).unref();
      }
    };

    // Set a timeout for the entire test
    const timeout = setTimeout(() => {
      if (!completed) {
        console.error('\n[Test] Test timed out after', TEST_TIMEOUT, 'ms');
        cleanup();
        reject(new Error('Test timeout'));
      }
    }, TEST_TIMEOUT);

    // Handle process signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Run the test
    runTest()
      .then(() => {
        if (!completed) {
          clearTimeout(timeout);
          console.log('\n[Test] Test completed successfully');
          completed = true;
          resolve();
          // Force exit after a short delay if needed
          forceExitTimer = setTimeout(() => {
            console.log('\n[Test] Force exiting after completion...');
            process.exit(0);
          }, FORCE_EXIT_DELAY);
          forceExitTimer.unref();
        }
      })
      .catch((error) => {
        if (!completed) {
          clearTimeout(timeout);
          console.error('\n[Test] Test failed with error:', error);
          completed = true;
          reject(error);
          // Force exit after a short delay if needed
          forceExitTimer = setTimeout(() => {
            console.log('\n[Test] Force exiting after failure...');
            process.exit(1);
          }, FORCE_EXIT_DELAY);
          forceExitTimer.unref();
        }
      });
  });
}

// Run the test with error handling
(async () => {
  try {
    await runWithTimeout();
  } catch (error) {
    console.error('\n[Test] Test execution failed:', error);
    process.exit(1);
  }
})();
