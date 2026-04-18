import { createLogger } from '@aihivemind/core';
import type { 
  LLMRequest, 
  LLMResponse, 
  LLMProvider,
  MessageContent,
  FunctionDefinition 
} from '@aihivemind/types';

const logger = createLogger('LLMService');

/**
 * Configuration for LLM providers
 */
export interface ProviderConfig {
  id: string;
  name: string;
  apiKey?: string;
  baseUrl: string;
  models: string[];
  defaultModel: string;
}

/**
 * Unified LLM Service supporting multiple providers
 */
export class LLMService {
  private static instance: LLMService | null = null;
  private providers: Map<string, ProviderConfig> = new Map();
  private defaultProviderId: string;

  private constructor() {
    this.defaultProviderId = 'openai';
    logger.info('LLMService initialized');
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Register an LLM provider
   */
  public registerProvider(config: ProviderConfig): void {
    this.providers.set(config.id, config);
    logger.info(`Registered LLM provider: ${config.name}`);
  }

  /**
   * Set default provider
   */
  public setDefaultProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider ${providerId} not found`);
    }
    this.defaultProviderId = providerId;
    logger.info(`Set default provider to: ${providerId}`);
  }

  /**
   * Generate text using the specified or default provider
   */
  public async generateText(
    messages: MessageContent[],
    options: {
      providerId?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      functions?: FunctionDefinition[];
    } = {}
  ): Promise<string> {
    const providerId = options.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    logger.info(`Generating text with provider: ${provider.name}`);

    const request: LLMRequest = {
      model: options.model || provider.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 1024,
      functions: options.functions,
    };

    try {
      const response = await this.callProvider(provider, request);
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Error generating text:', error);
      throw error;
    }
  }

  /**
   * Generate text with function calling support
   */
  public async generateWithFunctions(
    messages: MessageContent[],
    functions: FunctionDefinition[],
    options: {
      providerId?: string;
      model?: string;
      temperature?: number;
    } = {}
  ): Promise<{ content?: string; functionCall?: { name: string; arguments: Record<string, any> } }> {
    const providerId = options.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    logger.info(`Generating with functions using provider: ${provider.name}`);

    const request: LLMRequest = {
      model: options.model || provider.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      functions,
    };

    try {
      const response = await this.callProvider(provider, request);
      const choice = response.choices[0];
      
      if (choice.message.functionCall) {
        return { functionCall: choice.message.functionCall };
      }
      
      return { content: choice.message.content };
    } catch (error) {
      logger.error('Error generating with functions:', error);
      throw error;
    }
  }

  /**
   * Create embeddings for text
   */
  public async createEmbeddings(
    texts: string[],
    options: {
      providerId?: string;
      model?: string;
    } = {}
  ): Promise<number[][]> {
    const providerId = options.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    logger.info(`Creating embeddings for ${texts.length} texts`);

    // This would be implemented based on provider capabilities
    // For now, throw not implemented
    throw new Error('Embeddings not yet implemented for this provider');
  }

  /**
   * Call provider API (to be implemented for each provider)
   */
  private async callProvider(provider: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
    // This is a simplified implementation
    // In production, you would have separate clients for each provider
    
    const apiKey = provider.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Provider API error: ${error}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Provider API call failed:', error);
      throw error;
    }
  }

  /**
   * Get available providers
   */
  public getProviders(): LLMProvider[] {
    return Array.from(this.providers.values()).map(p => ({
      id: p.id,
      name: p.name,
      models: p.models,
      capabilities: ['text-generation', 'function-calling'],
    }));
  }
}

// Export singleton instance
export const llmService = LLMService.getInstance();
