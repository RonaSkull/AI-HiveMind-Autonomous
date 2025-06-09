#!/usr/bin/env node

import 'dotenv/config';
import { runQuantumExample } from '../src/services/quantum/examples/QuantumExample';
import { logger } from '../src/utils/logger';

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
