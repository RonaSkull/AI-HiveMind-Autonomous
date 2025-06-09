import dotenv from 'dotenv';

dotenv.config();

export const quantumConfig = {
  apiKey: process.env.IBM_QUANTUM_API_KEY || '',
  instance: process.env.IBM_QUANTUM_INSTANCE || 'ibm-q/open/main',
  defaultBackend: 'ibmq_qasm_simulator', // Default simulator
  maxCredits: 15, // Max credits to use per job
  timeout: 60000, // 60 seconds timeout
};

export default quantumConfig;
