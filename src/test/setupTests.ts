// Setup file for Jest tests
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env.test' });

// Mock console methods to keep test output clean
const originalConsole = { ...console };

beforeAll(() => {
  // Mock console methods
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
});

afterAll(() => {
  // Restore original console
  global.console = originalConsole;
});

// Global test timeout
jest.setTimeout(30000); // 30 seconds
