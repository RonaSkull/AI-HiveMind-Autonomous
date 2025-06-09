import dotenv from 'dotenv';

dotenv.config();

interface AgentConfig {
  pollInterval: number;
  maxConcurrentTasks: number;
  taskTimeout: number;
  logLevel: string;
}

interface CerebrasConfig {
  apiKey: string;
  model: string;
  endpoint: string;
  temperature: number;
  maxTokens: number;
}
interface AppConfig {
  agent: AgentConfig;
  cerebras: CerebrasConfig;
}

const config: AppConfig = {
  agent: {
    pollInterval: parseInt(process.env.AGENT_POLL_INTERVAL || '5000'),
    maxConcurrentTasks: parseInt(process.env.MAX_CONCURRENT_TASKS || '5'),
    taskTimeout: parseInt(process.env.TASK_TIMEOUT_MS || '30000'),
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  cerebras: {
    apiKey: process.env.CEREBRAS_API_KEY || '',
    model: process.env.CEREBRAS_MODEL || 'llama-70b',
    endpoint: process.env.CEREBRAS_ENDPOINT || 'https://api.cerebras.ai/v1',
    temperature: parseFloat(process.env.CEREBRAS_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.CEREBRAS_MAX_TOKENS || '2048'),
  },
};

export default config;
