/**
 * Represents the result of a quantum circuit execution
 */
export interface QuantumResult {
  success: boolean;
  jobId?: string;
  backend?: string;
  result?: {
    counts: Record<string, number>;
    timeTaken?: number;
    metadata?: Record<string, any>;
  };
  error?: string;
}

/**
 * Represents the status of a quantum job
 */
export interface JobStatus {
  jobId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  creationDate?: string;
  endDate?: string;
  queuePosition?: number;
  backend?: string;
  errorMessage?: string;
}

/**
 * Configuration for quantum circuit execution
 */
export interface QuantumExecutionConfig {
  shots?: number;
  maxCredits?: number;
  timeout?: number;
  backend?: string;
  optimizationLevel?: number;
}
