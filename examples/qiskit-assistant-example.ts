import { qiskitCodeAssistant } from '../src/agents/QiskitCodeAssistant.js';
import { createLogger } from '../src/utils/logger.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = createLogger('QiskitAssistantExample');

/**
 * Example demonstrating the usage of QiskitCodeAssistant with Ollama integration
 */
async function runQiskitAssistantExample() {
  try {
    // Initialize the Qiskit Code Assistant
    logger.info('Initializing Qiskit Code Assistant with Ollama...');
    
    // Check if we're using a local Ollama instance
    const isLocal = process.env.OLLAMA_IS_LOCAL !== 'false';
    
    if (isLocal) {
      logger.info('Using local Ollama instance');
    } else {
      logger.info('Using remote Ollama instance');
    }
    
    await qiskitCodeAssistant.initialize();

    // Example 1: Generate quantum code from natural language
    logger.info('\n=== Example 1: Generate Quantum Code ===');
    const description = 'Create a 2-qubit quantum circuit that creates a Bell state';
    logger.info(`Generating code for: "${description}"`);
    
    const codeGeneration = await qiskitCodeAssistant.generateCode(
      description,
      {
        language: 'python',
        optimizationLevel: 1,
        targetBackend: 'ibmq_qasm_simulator'
      }
    );

    logger.info('Generated code:', {
      code: codeGeneration.code,
      metadata: codeGeneration.metadata,
    });

    // Example 2: Optimize an existing quantum circuit
    logger.info('\n=== Example 2: Optimize Quantum Circuit ===');
    const circuitToOptimize = `
from qiskit import QuantumCircuit

# Create a 2-qubit circuit
qc = QuantumCircuit(2, 2)

# Add gates (this is intentionally not optimal)
qc.h(0)
qc.h(1)
qc.cx(0, 1)
qc.h(0)
qc.h(1)

# Measure
qc.measure([0, 1], [0, 1])
`;

    logger.info('Original circuit:');
    console.log(circuitToOptimize);

    const optimizationResult = await qiskitCodeAssistant.optimizeCircuit(
      circuitToOptimize,
      2 // Optimization level
    );

    logger.info('Optimization results:', {
      originalGateCount: optimizationResult.optimizationMetrics.originalGateCount,
      optimizedGateCount: optimizationResult.optimizationMetrics.optimizedGateCount,
      reductionPercentage: optimizationResult.optimizationMetrics.reductionPercentage,
    });
    
    logger.info('Optimized circuit:');
    console.log(optimizationResult.optimizedCode);

    // Example 3: Execute a quantum circuit
    logger.info('\n=== Example 3: Execute Quantum Circuit ===');
    
    // Only execute if we have the required environment variables
    if (process.env.IBM_QUANTUM_API_KEY) {
      logger.info('Executing quantum circuit on IBM Quantum...');
      
      const executionResult = await qiskitCodeAssistant.executeCircuit(
        optimizationResult.optimizedCode,
        {
          shots: 1000,
          backend: 'ibmq_qasm_simulator',
          useHardware: false
        }
      );

      logger.info('Execution results:', {
        jobId: executionResult.jobId,
        result: executionResult.result,
      });
    } else {
      logger.warn('Skipping circuit execution: IBM_QUANTUM_API_KEY not set in .env');
      logger.info('To enable execution, add your IBM Quantum API key to the .env file');
    }

  } catch (error) {
    logger.error('Error in Qiskit Code Assistant example:', error);
    
    // Provide helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('Failed to connect')) {
        logger.error('\nIs Ollama running? Start it with: ollama serve');
        logger.error('Or set OLLAMA_IS_LOCAL=false in your .env file to use a remote instance');
      }
      
      if (error.message.includes('model not found')) {
        logger.error('\nModel not found. Pull the model first with:');
        logger.error('ollama pull qiskit/granite-3.3-8b-qiskit');
      }
    }
  } finally {
    logger.info('\nExample completed');
  }
}

// Run the example
runQiskitAssistantExample().catch(console.error);
