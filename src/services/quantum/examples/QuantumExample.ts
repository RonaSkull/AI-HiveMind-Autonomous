import { quantumService } from '../IBMQuantumService';
import { logger } from '@utils/logger';

/**
 * Example class demonstrating quantum circuit creation and execution
 */
export class QuantumExample {
  /**
   * Creates a simple quantum circuit that demonstrates superposition
   */
  static createSuperpositionCircuit(): any {
    // This is a placeholder for the actual circuit creation
    // In a real implementation, you would use Qiskit's circuit builder
    return {
      name: 'superposition_circuit',
      qubits: 1,
      operations: [
        { gate: 'h', qubits: [0] }, // Hadamard gate to create superposition
        { gate: 'measure', qubits: [0], cbits: [0] } // Measure the qubit
      ]
    };
  }

  /**
   * Run a simple quantum example
   */
  static async runExample(): Promise<void> {
    if (!quantumService.isAvailable()) {
      logger.warn('Quantum service is not available. Skipping example.');
      return;
    }

    try {
      logger.info('Running quantum example...');
      
      // Create a simple quantum circuit
      const circuit = this.createSuperpositionCircuit();
      
      // Run the circuit
      const result = await quantumService.runCircuit(circuit, 1000);
      
      logger.info('Quantum computation completed successfully');
      logger.info(`Job ID: ${result.jobId}`);
      logger.info(`Backend used: ${result.backend}`);
      
      // Log the measurement results
      if (result.result && result.result.counts) {
        logger.info('Measurement results:');
        for (const [state, count] of Object.entries<number>(result.result.counts)) {
          logger.info(`  ${state}: ${count} (${(count / 1000 * 100).toFixed(1)}%)`);
        }
      }
      
    } catch (error) {
      logger.error('Error running quantum example:', error);
    }
  }
}

// Export the example runner
export const runQuantumExample = QuantumExample.runExample;
