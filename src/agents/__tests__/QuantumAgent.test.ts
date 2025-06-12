import { quantumAgent } from '../QuantumAgent.js';
import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

describe('QuantumAgent', () => {
  before(async () => {
    await quantumAgent.start();
  });

  after(async () => {
    await quantumAgent.stop();
  });

  it('should initialize correctly', () => {
    expect(quantumAgent).to.exist;
    expect(quantumAgent).to.be.an('object');
  });

  it('should have a runQuantumCircuit method', () => {
    expect(quantumAgent.runQuantumCircuit).to.be.a('function');
  });

  it('should have a getQuantumJobStatus method', () => {
    expect(quantumAgent.getQuantumJobStatus).to.be.a('function');
  });

  // Note: Actual quantum circuit tests would require a valid IBM Quantum API key
  // and would be more complex to set up in a test environment
  describe('with mock quantum service', () => {
    let originalService: any;
    
    before(() => {
      // Store the original service
      originalService = (quantumAgent as any).quantumService;
      
      // Mock the quantum service
      (quantumAgent as any).quantumService = {
        isAvailable: () => true,
        runCircuit: async () => ({
          jobId: 'test-job-123',
          result: { counts: { '00': 500, '11': 500 } },
          backend: 'ibmq_qasm_simulator'
        }),
        getJobStatus: async () => ({
          status: 'COMPLETED',
          creationDate: new Date().toISOString(),
          backend: 'ibmq_qasm_simulator'
        })
      };
    });
    
    after(() => {
      // Restore the original service
      (quantumAgent as any).quantumService = originalService;
    });
    
    it('should run a quantum circuit', async () => {
      const result = await quantumAgent.runQuantumCircuit(
        { /* mock circuit */ },
        { shots: 1000 }
      );
      
      expect(result).to.have.property('jobId');
      expect(result).to.have.property('result');
      expect(result.result).to.have.property('counts');
    });
    
    it('should get job status', async () => {
      const status = await quantumAgent.getQuantumJobStatus('test-job-123');
      expect(status).to.have.property('status', 'COMPLETED');
    });
  });
});
