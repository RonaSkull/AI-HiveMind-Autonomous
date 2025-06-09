import { quantumService } from '../IBMQuantumService';
import { logger } from '@utils/logger';

// Mock the qiskit module
jest.mock('qiskit', () => ({
  Qiskit: jest.fn().mockImplementation(() => ({
    least_busy_simulator: jest.fn().mockResolvedValue('ibmq_qasm_simulator'),
    run: jest.fn().mockResolvedValue({
      job_id: 'test-job-id',
      status: jest.fn().mockReturnValue('COMPLETED'),
      result: jest.fn().mockResolvedValue({
        counts: { '0': 512, '1': 512 },
        time_taken: 0.5,
      }),
    }),
    retrieve_job: jest.fn().mockResolvedValue({
      job_id: 'test-job-id',
      status: jest.fn().mockReturnValue('COMPLETED'),
      creation_date: jest.fn().mockReturnValue('2023-01-01T00:00:00.000Z'),
      backend: jest.fn().mockReturnValue('ibmq_qasm_simulator'),
    }),
  })),
}));

describe('IBMQuantumService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be available when API key is present', () => {
    expect(quantumService.isAvailable()).toBe(true);
  });

  describe('runCircuit', () => {
    it('should run a quantum circuit and return results', async () => {
      const circuit = {
        name: 'test-circuit',
        qubits: 1,
        operations: [
          { gate: 'h', qubits: [0] },
          { gate: 'measure', qubits: [0], cbits: [0] },
        ],
      };

      const result = await quantumService.runCircuit(circuit, 1024);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.jobId).toBe('test-job-id');
      expect(result.backend).toBe('ibmq_qasm_simulator');
      expect(result.result).toBeDefined();
    });
  });

  describe('getJobStatus', () => {
    it('should return the status of a job', async () => {
      const status = await quantumService.getJobStatus('test-job-id');
      
      expect(status).toBeDefined();
      expect(status.jobId).toBe('test-job-id');
      expect(status.status).toBe('COMPLETED');
      expect(status.backend).toBe('ibmq_qasm_simulator');
    });
  });
});
