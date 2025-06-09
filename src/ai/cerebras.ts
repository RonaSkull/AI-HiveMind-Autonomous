import axios from 'axios';
import config from '@config/config';
import { createLogger } from '@utils/logger';

const logger = createLogger('CerebrasClient');

interface CompletionOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export class CerebrasClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultOptions: {
    model: string;
    temperature: number;
    maxTokens: number;
  };

  constructor() {
    this.baseUrl = config.cerebras.endpoint;
    this.apiKey = config.cerebras.apiKey;
    
    if (!this.apiKey) {
      logger.warn('Cerebras API key not configured');
    }

    this.defaultOptions = {
      model: config.cerebras.model,
      temperature: config.cerebras.temperature,
      maxTokens: config.cerebras.maxTokens,
    };
  }

  async complete(prompt: string, options: Partial<CompletionOptions> = {}) {
    const requestOptions = {
      ...this.defaultOptions,
      ...options,
      prompt,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        requestOptions,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.choices[0].text.trim();
    } catch (error) {
      logger.error('Error in Cerebras completion:', error);
      throw new Error(`Cerebras API error: ${error.message}`);
    }
  }

  async analyzeMarket(data: any) {
    const prompt = `Analyze the following market data and provide insights:\n${JSON.stringify(data, null, 2)}\n\nAnalysis:`;
    
    return this.complete(prompt, {
      temperature: 0.3, // More deterministic for analysis
      maxTokens: 500,
    });
  }

  async generateTradingSignal(marketData: any) {
    const prompt = `Based on the following market data, generate a trading signal (BUY/SELL/HOLD) with reasoning:\n${JSON.stringify(marketData, null, 2)}\n\nSignal:`;
    
    return this.complete(prompt, {
      temperature: 0.2, // Very deterministic for trading signals
      maxTokens: 200,
    });
  }
}

export const cerebrasClient = new CerebrasClient();
