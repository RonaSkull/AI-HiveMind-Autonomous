/**
 * Core module exports for AI HiveMind Autonomous v2.0
 */

export { BaseAgent } from './BaseAgent.js';
export type { 
  AgentConfig, 
  AgentState, 
  Task, 
  TaskResult,
  Message,
  MessageType 
} from './BaseAgent.js';

// Additional core utilities will be added here
export { createLogger } from './logger.js';
export { EventBus } from './EventBus.js';
