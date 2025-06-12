import { createLogger } from '../utils/logger.js';
import { quantumAgent } from './QuantumAgent.js';
import { huggingFaceService, HuggingFaceService } from '../services/HuggingFaceService.js';

const logger = createLogger('QiskitCodeAssistant');

interface CodeGenerationOptions {
  language?: 'python' | 'qasm';
  optimizationLevel?: number;
  targetBackend?: string;
}

export class QiskitCodeAssistantAgent {
  private static instance: QiskitCodeAssistantAgent | null = null;
  private isInitialized = false;

  private constructor() {
    // Initialization is now handled by HuggingFaceService
  }

  /**
   * Get the singleton instance of QiskitCodeAssistantAgent
   */
  public static getInstance(): QiskitCodeAssistantAgent {
    if (!QiskitCodeAssistantAgent.instance) {
      QiskitCodeAssistantAgent.instance = new QiskitCodeAssistantAgent();
    }
    return QiskitCodeAssistantAgent.instance;
  }

  /**
   * Initialize the Qiskit Code Assistant
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('Qiskit Code Assistant is already initialized');
      return;
    }

    try {
      // Initialize HuggingFaceService
      await HuggingFaceService.initialize();
      
      // Test the Hugging Face connection with a simple request
      await huggingFaceService.generateText('Test connection');
      this.isInitialized = true;
      logger.info('Qiskit Code Assistant initialized with Hugging Face API');
    } catch (error) {
      const errorMsg = 'Failed to initialize Qiskit Code Assistant with Hugging Face';
      logger.error(errorMsg, error);
      throw new Error(`${errorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate quantum code using natural language
   * @param description Natural language description of the quantum circuit
   * @param options Options for code generation
   */
  public async generateCode(
    description: string,
    options: CodeGenerationOptions = {}
  ): Promise<{
    code: string;
    metadata: {
      model: string;
      duration: number;
      tokens?: number;
    };
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    try {
      logger.info('Generating quantum code...', { description });
      
      // Generate code using Hugging Face API
      const response = await huggingFaceService.generateQuantumCode(
        description,
        options.language
      );
      
      const code = this.extractCodeFromResponse(response);
      const duration = Date.now() - startTime;
      
      return {
        code,
        metadata: {
          model: 'HuggingFace/Qiskit',
          duration,
        },
      };
    } catch (error) {
      logger.error('Error generating quantum code:', error);
      throw new Error(`Failed to generate quantum code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize an existing quantum circuit
   * @param code The quantum code to optimize
   * @param optimizationLevel Level of optimization (0-3)
   */
  public async optimizeCircuit(
    code: string,
    optimizationLevel: number = 1
  ): Promise<{
    optimizedCode: string;
    optimizationMetrics: {
      originalGateCount: number;
      optimizedGateCount: number;
      reductionPercentage: number;
    };
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info('Optimizing quantum circuit...');
      
      const prompt = this.buildOptimizationPrompt(code, optimizationLevel);
      const response = await huggingFaceService.generateQuantumCode(
        prompt,
        'python'
      );
      
      const optimizedCode = this.extractCodeFromResponse(response);
      
      // In a real implementation, we would parse the actual metrics from the response
      // For now, we'll return placeholder metrics
      return {
        optimizedCode,
        optimizationMetrics: {
          originalGateCount: 0, // Would be calculated from original code
          optimizedGateCount: 0, // Would be calculated from optimized code
          reductionPercentage: 0, // Would be calculated
        },
      };
    } catch (error) {
      logger.error('Error optimizing quantum circuit:', error);
      throw error;
    }
  }

  /**
   * Build a prompt for code generation
   * @private
   */
  private buildCodeGenerationPrompt(
    description: string,
    options: CodeGenerationOptions = {}
  ): string {
    const language = options.language || 'python';
    const optimizationLevel = options.optimizationLevel || 1;
    const backend = options.targetBackend || 'ibmq_qasm_simulator';

    return `You are a quantum computing expert. Generate a Qiskit quantum circuit that:

${description}

Requirements:
- Language: ${language}
- Optimization Level: ${optimizationLevel}
- Target Backend: ${backend}

Only output the code, no explanations or markdown formatting.`;
  }

  /**
   * Extract code from the model's response
   * @private
   */
  private extractCodeFromResponse(response: string): string {
    // Remove markdown code blocks if present
    const codeBlockRegex = /(?:```(?:python)?\s*)?([\s\S]*?)\s*```?/;
    const match = response.match(codeBlockRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return response.trim();
  }

  /**
   * Build a prompt for circuit optimization
   * @private
   */
  private buildOptimizationPrompt(code: string, optimizationLevel: number): string {
    return `You are a quantum computing expert. Optimize the following Qiskit code with optimization level ${optimizationLevel}.
    
Original code:
\`\`\`python
${code}
\`\`\`

Optimized code (only the code, no explanations):`;
  }

  /**
   * Parse circuit information from code
   * @private
   */
  private parseCircuitInfo(code: string): any {
    // This is a simplified implementation
    // In a real implementation, you would use a proper parser or the Qiskit SDK
    const qubitsMatch = code.match(/QuantumCircuit\((\d+)\)/);
    const gates = [];
    
    if (code.includes('h(')) gates.push('h');
    if (code.includes('cx(')) gates.push('cx');
    if (code.includes('x(')) gates.push('x');
    if (code.includes('y(')) gates.push('y');
    if (code.includes('z(')) gates.push('z');
    if (code.includes('measure')) gates.push('measure');

    return {
      qubits: qubitsMatch ? parseInt(qubitsMatch[1], 10) : 2,
      gates: gates.length ? gates : ['h', 'cx'],
      depth: 3, // Would be calculated in a real implementation
    };
  }
}

// Export a singleton instance
export const qiskitCodeAssistant = QiskitCodeAssistantAgent.getInstance();
