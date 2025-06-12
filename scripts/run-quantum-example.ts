#!/usr/bin/env node

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Register path aliases
import 'tsconfig-paths/register';

import { runQuantumExample } from '@services/quantum/examples/QuantumExample';
import { logger } from '@utils/logger';

// Log environment variable loading status
logger.info('Environment variables loaded');
logger.debug(`IBM_QUANTUM_API_KEY: ${process.env.IBM_QUANTUM_API_KEY ? 'Set' : 'Not set'}`);

async function main() {
  logger.info('Starting quantum example...');
  
  try {
    await runQuantumExample();
    logger.info('Quantum example completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error in quantum example:', error);
    process.exit(1);
  }
}

main();
