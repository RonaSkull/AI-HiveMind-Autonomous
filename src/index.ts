import { orchestratorAgent } from './agents/OrchestratorAgent.js';
import { tradingAgent } from './agents/AITradingAgent.js';
import { researchAgent } from './agents/ResearchAgent.js';
import { quantumAgent } from './agents/QuantumAgent.js';
import { qiskitCodeAssistant } from './agents/QiskitCodeAssistant.js';
import { logger } from './utils/logger.js';
import * as fs from 'fs/promises';

interface StrategyResult {
  finalSignal: any;
  status: string;
}

async function main() {
  console.log('Starting AI HiveMind Autonomous System...');
  logger.info('Starting AI HiveMind Autonomous System...');

  try {
    console.log('Starting agents...');
    // Start all agents
    await Promise.all([
      orchestratorAgent.start().then(() => console.log('Orchestrator agent started')),
      tradingAgent.start().then(() => console.log('Trading agent started')),
      researchAgent.start().then(() => console.log('Research agent started')),
      quantumAgent.start().then(() => console.log('Quantum agent started')),
      qiskitCodeAssistant.initialize().then(() => console.log('Qiskit Code Assistant initialized')),
    ]);

    console.log('All agents started successfully');
    logger.info('All agents started successfully.');

    // Give the orchestrator a high-level goal and wait for it to complete
    try {
      const strategyResult = await orchestratorAgent.enqueueTask<any, StrategyResult>({
        type: 'EXECUTE_TRADING_STRATEGY',
        data: {
          market: 'CRYPTO',
          riskLevel: 'MEDIUM',
        },
      });

      logger.info('Orchestrator has completed the strategy.', { result: strategyResult });
      
      try {
        await fs.writeFile('strategy_result.log', JSON.stringify(strategyResult, null, 2));
        logger.info('Strategy result saved to strategy_result.log');
      } catch (writeError) {
        logger.error('Failed to write strategy result to file:', writeError);
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error executing trading strategy:', err);
    } finally {
      // Ensure shutdown happens after the task is attempted
      await shutdown();
    }

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('A critical error occurred in the main execution loop:', err);
    // On a critical error, we will initiate a graceful shutdown.
    await shutdown();
  }
}

async function shutdown() {
  logger.info('Shutting down all agents...');
  try {
    // Stop all agents and services
    await Promise.all([
      orchestratorAgent.stop(),
      tradingAgent.stop(),
      researchAgent.stop(),
      quantumAgent.stop(),
      // Qiskit Code Assistant doesn't need explicit cleanup in this example
    ]);
    logger.info('All agents stopped gracefully.');
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error during agent shutdown:', err);
  }
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the application
// Force re-evaluation
main().catch((error: Error) => {
  logger.error('Unhandled exception during startup:', error);
  process.exit(1);
});

