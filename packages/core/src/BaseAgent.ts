import { EventEmitter } from 'eventemitter3';
import PQueue from 'p-queue';
import type { 
  AgentConfig, 
  AgentState, 
  Task, 
  TaskResult,
  Message,
  MessageType 
} from '@aihivemind/types';

/**
 * BaseAgent v2.0 - Modern actor-model based agent implementation
 * 
 * Features:
 * - Actor model pattern with message passing
 * - Priority-based task queue with concurrency control
 * - Built-in retry logic with exponential backoff
 * - Comprehensive event emission for observability
 * - Type-safe message system
 */
export abstract class BaseAgent extends EventEmitter {
  protected readonly config: AgentConfig;
  protected state: AgentState;
  protected readonly queue: PQueue;
  protected readonly logger: Console;
  
  private messageHandlers: Map<MessageType, (message: Message) => Promise<void>> = new Map();

  constructor(config: AgentConfig) {
    super();
    
    this.config = config;
    this.logger = console; // Will be replaced with proper logger
    
    this.state = {
      status: 'idle',
      completedTasks: 0,
      failedTasks: 0,
      lastActivity: new Date(),
    };

    // Initialize priority queue with concurrency control
    this.queue = new PQueue({
      concurrency: config.maxConcurrency || 5,
    });

    this.setupMessageHandlers();
    this.logger.info(`[Agent:${config.name}] Initialized with maxConcurrency=${this.queue.concurrency}`);
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Start the agent and begin processing messages
   */
  async start(): Promise<void> {
    if (this.state.status === 'running') {
      this.logger.warn(`[Agent:${this.config.name}] Already running`);
      return;
    }

    this.logger.info(`[Agent:${this.config.name}] Starting...`);
    
    try {
      await this.initialize();
      this.state.status = 'running';
      this.state.lastActivity = new Date();
      
      this.emit('agent:started', { 
        agentId: this.config.id, 
        timestamp: new Date() 
      });
      
      this.logger.info(`[Agent:${this.config.name}] Started successfully`);
    } catch (error) {
      this.state.status = 'error';
      this.logger.error(`[Agent:${this.config.name}] Failed to start:`, error);
      throw error;
    }
  }

  /**
   * Stop the agent gracefully
   */
  async stop(): Promise<void> {
    if (this.state.status !== 'running') {
      this.logger.warn(`[Agent:${this.config.name}] Not running`);
      return;
    }

    this.logger.info(`[Agent:${this.config.name}] Stopping...`);
    this.state.status = 'stopped';

    // Wait for current tasks to complete
    await this.queue.onIdle();

    await this.cleanup();
    
    this.emit('agent:stopped', { 
      agentId: this.config.id, 
      timestamp: new Date() 
    });
    
    this.logger.info(`[Agent:${this.config.name}] Stopped successfully`);
  }

  /**
   * Send a message to the agent
   */
  async sendMessage<T>(message: Message<T>): Promise<void> {
    const handler = this.messageHandlers.get(message.type);
    
    if (!handler) {
      this.logger.warn(`[Agent:${this.config.name}] No handler for message type: ${message.type}`);
      return;
    }

    try {
      await handler(message);
      this.state.lastActivity = new Date();
    } catch (error) {
      this.logger.error(`[Agent:${this.config.name}] Error handling message:`, error);
      throw error;
    }
  }

  /**
   * Enqueue a task with priority and retry support
   */
  async enqueueTask<T, R>(task: Omit<Task<T, R>, 'id' | 'status' | 'createdAt' | 'retries'>): Promise<TaskResult<R>> {
    const fullTask: Task<T, R> = {
      ...task,
      id: task.id || this.generateTaskId(),
      status: 'pending',
      createdAt: new Date(),
      retries: 0,
    };

    this.logger.debug(`[Agent:${this.config.name}] Enqueuing task ${fullTask.id} (type: ${fullTask.type}, priority: ${fullTask.priority})`);

    return this.queue.add(async () => {
      return this.executeTask(fullTask);
    }, {
      priority: task.priority,
    }) as Promise<TaskResult<R>>;
  }

  /**
   * Register a message handler
   */
  registerMessageHandler(type: MessageType, handler: (message: Message) => Promise<void>): void {
    this.messageHandlers.set(type, handler);
    this.logger.debug(`[Agent:${this.config.name}] Registered handler for ${type}`);
  }

  /**
   * Abstract method to initialize agent-specific resources
   */
  protected abstract initialize(): Promise<void>;

  /**
   * Abstract method to process a task
   */
  protected abstract processTask<T, R>(task: Task<T, R>): Promise<R>;

  /**
   * Optional cleanup method for subclasses
   */
  protected async cleanup(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Setup default message handlers
   */
  private setupMessageHandlers(): void {
    this.registerMessageHandler('TASK_REQUEST', async (message: Message) => {
      const result = await this.enqueueTask(message.payload);
      // Send response back
      this.emit('message:response', {
        correlationId: message.correlationId,
        result,
      });
    });

    this.registerMessageHandler('STATUS_UPDATE', async (message: Message) => {
      this.logger.info(`[Agent:${this.config.name}] Status update received:`, message.payload);
      this.emit('status:update', message.payload);
    });

    this.registerMessageHandler('HEARTBEAT', async (message: Message) => {
      this.emit('heartbeat', { 
        agentId: this.config.id, 
        timestamp: new Date(),
        state: this.getState()
      });
    });
  }

  /**
   * Execute a task with error handling and retry logic
   */
  private async executeTask<T, R>(task: Task<T, R>): Promise<TaskResult<R>> {
    const startTime = Date.now();
    task.status = 'running';
    task.startedAt = new Date();

    this.logger.info(`[Agent:${this.config.name}] Executing task ${task.id}`);
    this.emit('task:started', { taskId: task.id, type: task.type });

    try {
      const result = await this.processTask(task);
      const duration = Date.now() - startTime;

      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      this.state.completedTasks++;

      this.logger.info(`[Agent:${this.config.name}] Task ${task.id} completed in ${duration}ms`);
      this.emit('task:completed', { 
        taskId: task.id, 
        result, 
        duration 
      });

      return {
        success: true,
        taskId: task.id,
        result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`[Agent:${this.config.name}] Task ${task.id} failed:`, error);

      // Retry logic with exponential backoff
      if (task.retries < task.maxRetries) {
        task.retries++;
        const delay = Math.min(1000 * Math.pow(2, task.retries), 30000);
        
        this.logger.info(`[Agent:${this.config.name}] Retrying task ${task.id} (${task.retries}/${task.maxRetries}) in ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeTask(task);
      }

      task.status = 'failed';
      task.error = error instanceof Error ? error : new Error(errorMessage);
      this.state.failedTasks++;

      this.emit('task:failed', { 
        taskId: task.id, 
        error: errorMessage, 
        duration 
      });

      return {
        success: false,
        taskId: task.id,
        error: errorMessage,
        duration,
      };
    } finally {
      this.state.lastActivity = new Date();
    }
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return `${this.config.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Re-export types for convenience
export type { 
  AgentConfig, 
  AgentState, 
  Task, 
  TaskResult,
  Message,
  MessageType 
};
