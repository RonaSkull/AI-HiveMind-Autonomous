import axios from 'axios';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('HuggingFaceService');

interface HuggingFaceResponse {
  generated_text: string;
  // Add other response fields as needed
}

export class HuggingFaceService {
  private static instance: HuggingFaceService;
  private apiKey: string;
  private apiUrl = 'https://api-inference.huggingface.co/models';
  private model = 'Qiskit/granite-8b-qiskit'; // Updated to use the granite-8b-qiskit model
  private defaultParameters = {
    max_new_tokens: 500,
    temperature: 0.7,
    top_p: 0.9,
    return_full_text: false,
  };

  private constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    if (!this.apiKey) {
      const errorMsg = 'HUGGINGFACE_API_KEY not found in environment variables';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Initialize the service (load environment variables if needed)
   */
  public static async initialize(): Promise<HuggingFaceService> {
    if (process.env.NODE_ENV !== 'production' && !process.env.HUGGINGFACE_API_KEY) {
      try {
        const dotenv = await import('dotenv');
        dotenv.config();
      } catch (error) {
        logger.warn('Failed to load .env file:', error);
      }
    }
    return HuggingFaceService.instance;
  }

  public static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  /**
   * Get or create an instance with initialization
   */
  public static async getInitializedInstance(): Promise<HuggingFaceService> {
    const instance = this.getInstance();
    await this.initialize();
    return instance;
  }

  public async generateText(prompt: string, parameters: Record<string, any> = {}): Promise<string> {
    try {
      const response = await axios.post<HuggingFaceResponse[]>(
        `${this.apiUrl}/${this.model}`,
        { inputs: prompt, parameters },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0]?.generated_text || '';
    } catch (error) {
      logger.error('Error calling Hugging Face API:', error);
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async generateQuantumCode(question: string, context: string = ''): Promise<string> {
    try {
      const prompt = `You are a quantum computing expert. ${context ? `Context: ${context}\n\n` : ''}Question: ${question}\n\nPlease provide a complete Qiskit code solution.`;
      
      const response = await axios.post<Array<{ generated_text: string }>>(
        `${this.apiUrl}/${this.model}`,
        {
          inputs: prompt,
          parameters: this.defaultParameters
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000 // 60 seconds timeout
        }
      );

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('Invalid response format from Hugging Face API');
      }

      // Extract the generated text from the response
      const generatedText = response.data[0]?.generated_text || '';
      
      // Extract code blocks from the response
      const codeBlockRegex = /```(?:python)?\n([\s\S]*?)\n```/;
      const match = generatedText.match(codeBlockRegex);
      
      // If no code block found, try to extract import statements and code
      if (!match) {
        const importMatch = generatedText.match(/(import\s+[\w\s,]+\n)+([\s\S]*)/);
        return importMatch ? importMatch[0].trim() : generatedText.trim();
      }
      
      return match[1].trim();
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        stack: error instanceof Error ? error.stack : undefined
      };
      
      logger.error('Error generating quantum code:', errorDetails);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Hugging Face API key. Please check your HUGGINGFACE_API_KEY.');
      } else if (error.response?.status === 404) {
        throw new Error('Qiskit model not found. Please check the model name and try again.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The model might be loading. Please try again in a moment.');
      } else {
        throw new Error(`Failed to generate quantum code: ${errorMessage}`);
      }
    }
  }
}

export const huggingFaceService = HuggingFaceService.getInstance();
