import { Qiskit } from 'qiskit';
import { quantumConfig } from '@config/quantum.config';
import { logger } from '@utils/logger';

// Log configuration status
logger.debug('IBM Quantum Service: Initializing with config', { 
  hasApiKey: !!quantumConfig.apiKey,
  instance: quantumConfig.instance
});

export class IBMQuantumService {
  private qiskit: Qiskit | null = null;
  private initialized: boolean = false;

  constructor() {
    if (!quantumConfig.apiKey) {
      logger.warn('IBM Quantum API key not found. Quantum features will be disabled.');
      return;
    }

    try {
      this.qiskit = new Qiskit({
        token: quantumConfig.apiKey,
        instance: quantumConfig.instance,
      });
      this.initialized = true;
      logger.info('IBM Quantum service initialized successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to initialize IBM Quantum service: ${errorMessage}`);
    }
  }

  /**
   * Check if the quantum service is available
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Run a quantum circuit on the IBM Quantum backend
   * @param circuit The quantum circuit to execute
   * @param shots Number of shots to run (default: 1024)
   */
  async runCircuit(circuit: any, shots: number = 1024): Promise<any> {
    if (!this.initialized || !this.service) {
      throw new Error('IBM Quantum service is not initialized');
    }

    try {
      logger.debug('Running quantum circuit...');
      
      // Get the least busy simulator backend
      const backend = await this.qiskit.least_busy_backend({ simulator: true });
      
      // Run the circuit
      const job = await this.qiskit.run(circuit, backend, {
        shots,
        max_credits: quantumConfig.maxCredits,
      });

      logger.debug(`Job ${job.job_id} submitted to ${backend}`);
      const result = await job.result();
      
      return {
        success: true,
        jobId: job.job_id,
        backend: backend,
        result: result,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error running quantum circuit: ${errorMessage}`);
      throw new Error(`Quantum computation failed: ${errorMessage}`);
    }
  }

  /**
   * Get the status of a quantum job
   * @param jobId The job ID to check
   */
  async getJobStatus(jobId: string): Promise<any> {
    if (!this.initialized || !this.service) {
      throw new Error('IBM Quantum service is not initialized');
    }

    try {
      const job = await this.qiskit.retrieve_job(jobId);
      const status = job.status();
      const backend = job.backend();
      
      return {
        jobId: job.job_id,
        status: status,
        creationDate: job.creation_date(),
        backend: backend,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error getting status for job ${jobId}: ${errorMessage}`);
      throw new Error(`Failed to get job status: ${errorMessage}`);
    }
  }
}

// Export a singleton instance
export const quantumService = new IBMQuantumService();
