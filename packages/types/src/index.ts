/**
 * Core types for AI HiveMind Autonomous v2.0
 */

// Base Agent Types
export interface AgentConfig {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  maxConcurrency?: number;
  memoryLimit?: number;
}

export interface AgentState {
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'error';
  currentTask?: Task;
  completedTasks: number;
  failedTasks: number;
  lastActivity: Date;
}

// Message System Types
export type MessageType = 
  | 'TASK_REQUEST'
  | 'TASK_RESPONSE'
  | 'TASK_CANCEL'
  | 'STATUS_UPDATE'
  | 'HEARTBEAT'
  | 'BROADCAST'
  | 'AGENT_JOIN'
  | 'AGENT_LEAVE';

export interface Message<T = any> {
  id: string;
  type: MessageType;
  from: string;
  to: string | '*';
  payload: T;
  timestamp: Date;
  correlationId?: string;
  replyTo?: string;
}

// Task System Types
export interface Task<T = any, R = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: R;
  error?: Error;
  metadata?: Record<string, any>;
  retries: number;
  maxRetries: number;
}

export interface TaskResult<T = any> {
  success: boolean;
  taskId: string;
  result?: T;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

// AI/LLM Types
export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  capabilities: LLMCapability[];
}

export type LLMCapability = 
  | 'text-generation'
  | 'function-calling'
  | 'vision'
  | 'embedding'
  | 'streaming';

export interface LLMRequest {
  model: string;
  messages: MessageContent[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  functions?: FunctionDefinition[];
  stream?: boolean;
}

export interface MessageContent {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface LLMResponse {
  id: string;
  model: string;
  choices: Choice[];
  usage: TokenUsage;
}

export interface Choice {
  message: MessageContent;
  finishReason: string;
  index: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// RAG Types
export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface VectorStore {
  addDocuments(documents: Document[]): Promise<void>;
  search(query: string, limit?: number): Promise<Document[]>;
  deleteDocument(id: string): Promise<void>;
}

// Quantum Types
export interface QuantumCircuit {
  qubits: number;
  gates: QuantumGate[];
  measurements: Measurement[];
}

export interface QuantumGate {
  type: string;
  qubits: number[];
  params?: number[];
}

export interface Measurement {
  qubit: number;
  classicalBit: number;
}

export interface QuantumBackend {
  id: string;
  name: string;
  type: 'simulator' | 'hardware';
  qubits: number;
  available: boolean;
}

export interface QuantumJob {
  id: string;
  circuit: QuantumCircuit;
  backend: string;
  shots: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: QuantumResult;
  error?: string;
}

export interface QuantumResult {
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  statevector?: number[];
}

// Blockchain Types
export interface SmartContract {
  address: string;
  abi: any[];
  bytecode?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value?: string;
  data?: string;
  nonce: number;
  gasLimit: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface ContractEvent {
  name: string;
  args: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
}

// Configuration Types
export interface AppConfig {
  agents: AgentConfig[];
  llm: LLMConfig;
  quantum: QuantumConfig;
  blockchain: BlockchainConfig;
  observability: ObservabilityConfig;
}

export interface LLMConfig {
  providers: LLMProvider[];
  defaultProvider: string;
  defaultModel: string;
}

export interface QuantumConfig {
  enabled: boolean;
  providers: string[];
  defaultBackend: string;
}

export interface BlockchainConfig {
  network: string;
  rpcUrl: string;
  chainId: number;
}

export interface ObservabilityConfig {
  logging: LoggingConfig;
  tracing: TracingConfig;
  metrics: MetricsConfig;
}

export interface LoggingConfig {
  level: string;
  format: 'json' | 'text';
  outputs: string[];
}

export interface TracingConfig {
  enabled: boolean;
  exporter: 'jaeger' | 'zipkin' | 'otlp';
  endpoint?: string;
}

export interface MetricsConfig {
  enabled: boolean;
  exporter: 'prometheus' | 'statsd';
  port?: number;
}

// Utility Types
export type AsyncFunction<T = any> = () => Promise<T>;
export type MaybePromise<T> = T | Promise<T>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface Result<T, E = Error> {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
