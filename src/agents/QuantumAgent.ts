import { EventEmitter } from 'events';
import { createLogger } from '../utils/logger.js';
import { quantumService } from '../services/quantum/IBMQuantumService.js';

// Types
export interface QuantumTaskData {
  circuit?: any; // Qiskit circuit or circuit definition (optional for some operations)
  shots?: number;
  backend?: string;
  jobId?: string;
  parameters?: Record<string, any>;
}

interface QuantumTask extends Task<QuantumTaskData> {}

export class QuantumAgent extends EventEmitter {
  private static instance: QuantumAgent | null = null;
  private quantumService = quantumService;
  private isRunning = false;
  private logger = createLogger('QuantumAgent');
  private taskQueue: Array<{task: QuantumTask; resolve: (value: any) => void; reject: (reason?: any) => void}> = [];
  private isProcessing = false;

  private constructor() {
    super();
    this.logger.info('Quantum Agent initialized');
  }

  /**
   * Get the singleton instance of QuantumAgent
   */
  public static getInstance(): QuantumAgent {
    if (!QuantumAgent.instance) {
      QuantumAgent.instance = new QuantumAgent();
    }
    return QuantumAgent.instance;
  }

  /**
   * Start the quantum agent
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Quantum Agent is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting Quantum Agent...');

    if (!this.quantumService.isAvailable()) {
      this.logger.warn('IBM Quantum service is not available. Quantum features will be disabled.');
    } else {
      this.logger.info('IBM Quantum service is available and ready');
    }
  }

  /**
   * Stop the quantum agent
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Stopping Quantum Agent...');
    // Add any cleanup logic here
  }

  /**
   * Enqueue a quantum task
   */
  public async enqueueTask<T = any>(task: Omit<QuantumTask, 'id' | 'createdAt'>): Promise<{ id: string; result: Promise<T> }> {
    const taskWithId: QuantumTask = {
      ...task,
      id: `quantum-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      this.taskQueue.push({
        task: taskWithId,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const { task, resolve, reject } = this.taskQueue.shift()!;

    try {
      this.logger.info(`Processing quantum task: ${task.id} (${task.type})`);
      const result = await this.processTask(task);
      resolve(result);
    } catch (error) {
      this.logger.error(`Error processing quantum task ${task.id}:`, error);
      reject(error);
    } finally {
      this.isProcessing = false;
      // Process next task if any
      if (this.taskQueue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }

  /**
   * Process a quantum task
   */
  private async processTask(task: QuantumTask): Promise<any> {
    try {
      switch (task.type) {
        case 'QUANTUM_RUN_CIRCUIT':
          return await this.handleRunCircuit(task.data);
        case 'QUANTUM_GET_JOB_STATUS':
          return await this.handleGetJobStatus(task.data);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in processTask: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle running a quantum circuit
   */
  private async handleRunCircuit(data: QuantumTaskData) {
    if (!this.quantumService.isAvailable()) {
      throw new Error('IBM Quantum service is not available');
    }

    const { circuit, shots = 1024, backend } = data;
    
    this.logger.info('Running quantum circuit...', {
      shots,
      backend: backend || 'default',
    });

    try {
      const result = await this.quantumService.runCircuit(circuit, shots);
      
      return {
        success: true,
        jobId: result.jobId,
        backend: result.backend,
        result: result.result,
      };
    } catch (error) {
      this.logger.error('Error running quantum circuit:', error);
      throw error;
    }
  }

  /**
   * Handle getting quantum job status
   */
  private async handleGetJobStatus(data: QuantumTaskData) {
    if (!this.quantumService.isAvailable()) {
      throw new Error('IBM Quantum service is not available');
    }

    const { jobId } = data;
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    this.logger.info('Getting job status...', { jobId });
    
    try {
      const status = await this.quantumService.getJobStatus(jobId);
      return {
        success: true,
        status,
      };
    } catch (error) {
      this.logger.error('Error getting job status:', error);
      throw error;
    }
  }

  /**
   * Run a quantum circuit and return the result
   */
  public async runQuantumCircuit(
    circuit: any,
    options: Omit<QuantumTaskData, 'circuit'> = {}
  ): Promise<{ jobId: string; result: any }> {
    const task = await this.enqueueTask({
      type: 'QUANTUM_RUN_CIRCUIT',
      data: { circuit, ...options },
    });

    return task.result;
  }

  /**
   * Get the status of a quantum job
   */
  public async getQuantumJobStatus(jobId: string): Promise<any> {
    const task = await this.enqueueTask({
      type: 'QUANTUM_GET_JOB_STATUS',
      data: { jobId },
    });

    return task.result;
  }
}

// Export a singleton instance
export const quantumAgent = QuantumAgent.getInstance();

// Re-export Task type for convenience
export interface Task<T = any> {
  id: string;
  type: string;
  data: T;
  createdAt: Date;
  priority?: number;
  metadata?: Record<string, any>;
}
