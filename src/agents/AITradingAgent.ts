import { BaseAgent, Task } from './BaseAgent.js';

// Mock implementation for testing
const mockCerebrasClient = {
  analyzeMarket: async (marketData: any) => {
    console.log('Mock analyzeMarket called with:', marketData);
    return `Analysis for ${marketData.market || 'unknown'} market`;
  },
  generateTradingSignal: async (data: any) => {
    console.log('Mock generateTradingSignal called with:', data);
    return { 
      action: 'BUY', 
      confidence: 0.85, 
      timestamp: new Date().toISOString() 
    };
  }
};

export class AITradingAgent extends BaseAgent {
  private marketData: any = {};

  protected override async initialize(): Promise<void> {
    this.logger.info('Initializing AI Trading Agent');
    // Initialize any required resources here
  }

  protected override async processTask(task: Task): Promise<any> {
    this.logger.info(`Processing task ${task.id} of type ${task.type}`);
    
    switch (task.type) {
      case 'ANALYZE_MARKET':
        return this.analyzeMarket(task.data);
      case 'GENERATE_SIGNAL':
        return this.generateTradingSignal(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async analyzeMarket(marketData: any): Promise<string> {
    this.marketData = { ...this.marketData, ...marketData };
    this.logger.debug('Analyzing market data');
    
    try {
      const analysis = await mockCerebrasClient.analyzeMarket(marketData);
      this.logger.info('Market analysis completed');
      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing market:', error);
      throw error;
    }
  }

  private async generateTradingSignal(marketData: any): Promise<any> {
    this.logger.debug('Generating trading signal');
    
    try {
      const signal = await mockCerebrasClient.generateTradingSignal({
        ...this.marketData,
        ...marketData
      });
      
      this.logger.info(`Trading signal generated: ${signal}`);
      return { signal, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Error generating trading signal:', error);
      throw error;
    }
  }

  public async updateMarketData(data: any): Promise<void> {
    this.marketData = { ...this.marketData, ...data };
    this.emit('marketDataUpdated', this.marketData);
  }

  public getCurrentMarketData(): any {
    return { ...this.marketData };
  }
}

export const tradingAgent = new AITradingAgent();
