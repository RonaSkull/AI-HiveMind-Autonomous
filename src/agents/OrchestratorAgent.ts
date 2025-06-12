import { BaseAgent, Task } from './BaseAgent.js';
import { tradingAgent } from './AITradingAgent.js';
// import { researchAgent } from './ResearchAgent'; // Will be uncommented later

export class OrchestratorAgent extends BaseAgent {

  protected override async initialize(): Promise<void> {
    this.logger.info('Initializing Orchestrator Agent');
  }

  protected override async processTask(task: Task): Promise<any> {
    this.logger.info(`Orchestrator processing task ${task.id}: ${task.type}`);

    switch (task.type) {
      case 'EXECUTE_TRADING_STRATEGY':
        return this.executeTradingStrategy(task.data);
      default:
        throw new Error(`Unknown task type for Orchestrator: ${task.type}`);
    }
  }

  private async executeTradingStrategy(data: any): Promise<any> {
    this.logger.info('Starting trading strategy execution', { 
      market: data.market, 
      riskLevel: data.riskLevel 
    });

    try {
      // Step 1: Analyze the market
      this.logger.debug('Enqueuing market analysis task');
      const marketAnalysis = await tradingAgent.enqueueTask({
        type: 'ANALYZE_MARKET',
        data: { market: data.market || 'crypto' }
      });

      this.logger.info('Market analysis completed', { 
        analysis: typeof marketAnalysis === 'string' ? 
          marketAnalysis : 'Analysis result available' 
      });

      // Step 2: Generate a trading signal based on the analysis
      this.logger.debug('Enqueuing signal generation task');
      const tradingSignal = await tradingAgent.enqueueTask({
        type: 'GENERATE_SIGNAL',
        data: { analysis: marketAnalysis }
      });

      this.logger.info('Trading signal generated', { 
        signal: tradingSignal,
        timestamp: new Date().toISOString()
      });

      // In a real scenario, you would execute the trade here
      const result = { 
        finalSignal: tradingSignal, 
        status: 'Strategy Complete',
        timestamp: new Date().toISOString()
      };
      
      this.logger.debug('Trading strategy execution completed successfully');
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to execute trading strategy', { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Re-throw to be handled by the BaseAgent
    }
  }
}

export const orchestratorAgent = new OrchestratorAgent();
