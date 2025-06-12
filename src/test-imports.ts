console.log('Test imports file is running!');

// Try to import the logger directly
import { logger } from './utils/logger.js';
logger.info('Successfully imported logger!');

// Keep the process alive
setInterval(() => {}, 1000);
