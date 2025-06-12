import { EventEmitter } from 'events';
import { createLogger } from '../utils/logger.js';

// Types
export interface Task<T = any> {
  id: string;
  type: string;
  data: T;
  createdAt: Date;
  priority?: number;
  metadata?: Record<string, any>;
}

interface QueuedTask<T = any> {
  task: Task<T>;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  startedAt?: Date;
}

export interface TaskResult<T = any> {
  success: boolean;
  taskId: string;
  result?: T;
  error?: Error;
  metadata?: Record<string, any>;
}

export abstract class BaseAgent extends EventEmitter {
  protected readonly logger = createLogger(this.constructor.name);
  protected isRunning = false;
  private isProcessing = false;
  private activeTasks = new Map<string, Promise<void>>();
  private taskQueue: QueuedTask[] = [];

  constructor() {
    super();
    this.logger.info('Agent initialized');
  }

  // Public API
  public async start(): Promise<void> {
    console.log(`[${this.constructor.name}] Starting agent...`);
    if (this.isRunning) {
      const warning = 'Agent is already running';
      console.warn(`[${this.constructor.name}] ${warning}`);
      this.logger.warn(warning);
      return;
    }

    try {
      console.log(`[${this.constructor.name}] Setting agent as running`);
      this.isRunning = true;
      
      console.log(`[${this.constructor.name}] Starting initialization...`);
      const initStart = Date.now();
      await this.initialize();
      console.log(`[${this.constructor.name}] Initialization completed in ${Date.now() - initStart}ms`);
      
      console.log(`[${this.constructor.name}] Starting task processing queue...`);
      // Start the queue processing in the background
      const processPromise = this.processQueue().catch(error => {
        console.error(`[${this.constructor.name}] Error in processQueue:`, error);
        this.logger.error('Error in processQueue:', error);
      });
      
      // Store the process promise to track completion
      this.activeTasks.set('process-queue', processPromise);
      
      console.log(`[${this.constructor.name}] Agent started successfully`);
      this.logger.info('Agent started successfully');
    } catch (error) {
      console.error(`[${this.constructor.name}] Error during agent start:`, error);
      this.isRunning = false;
      this.logger.error('Failed to start agent:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Stopping agent');
    
    // Wait for active tasks to complete
    await Promise.all(Array.from(this.activeTasks.values()));
    
    await this.cleanup();
  }

  public async enqueueTask<T = any, R = any>(
    task: Omit<Task<T>, 'id' | 'createdAt'>, 
    priority = 0
  ): Promise<R> {
    const taskWithId: Task<T> = {
      ...task,
      id: this.generateTaskId(),
      createdAt: new Date(),
      priority,
    };

    console.log(`[${this.constructor.name}] Enqueuing task:`, {
      id: taskWithId.id,
      type: taskWithId.type,
      priority: taskWithId.priority,
      currentQueueSize: this.taskQueue.length
    });
    
    return new Promise<R>((resolve, reject) => {
      const queuedTask = { 
        task: taskWithId, 
        resolve, 
        reject,
        enqueuedAt: new Date()
      };
      
      this.taskQueue.push(queuedTask);
      
      // Sort queue by priority (highest first)
      this.taskQueue.sort((a, b) => (b.task.priority || 0) - (a.task.priority || 0));
      
      console.log(`[${this.constructor.name}] Task queued. New queue size: ${this.taskQueue.length}`);
      
      // Start processing if not already
      if (!this.isProcessing) {
        console.log(`[${this.constructor.name}] Starting task processor...`);
        setImmediate(() => this.processQueue());
      }
    });
  }

  // Abstract methods to be implemented by child classes
  protected abstract processTask(task: Task): Promise<any>;
  protected abstract initialize(): Promise<void>;
  
  protected async cleanup(): Promise<void> {
    // Optional cleanup logic can be overridden by child classes
  }

  // Private methods
  private generateTaskId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processQueue(): Promise<void> {
    const logPrefix = `[${this.constructor.name}]`;
    
    try {
      console.log(`${logPrefix} processQueue() called`);
      
      if (this.isProcessing) {
        console.log(`${logPrefix} Queue is already being processed, returning early`);
        return;
      }
      
      if (this.taskQueue.length === 0) {
        console.log(`${logPrefix} No tasks in queue, returning early`);
        return;
      }

      this.isProcessing = true;
      const nextTask = this.taskQueue.shift()!;
      const taskId = nextTask.task.id;
      
      console.log(`${logPrefix} Starting to process task:`, {
        id: taskId,
        type: nextTask.task.type,
        remainingInQueue: this.taskQueue.length,
        activeTasks: this.activeTasks.size
      });

      const processTask = async (): Promise<void> => {
        const startTime = Date.now();
        
        try {
          console.log(`${logPrefix} [${taskId}] Processing started`);
          this.logger.info(`Starting task ${taskId} (${nextTask.task.type})`);
          
          // Process the task
          const result = await this.processTask(nextTask.task);
          const duration = Date.now() - startTime;
          
          console.log(`${logPrefix} [${taskId}] Processing completed in ${duration}ms`);
          this.logger.info(`Completed task ${taskId} (${nextTask.task.type}) in ${duration}ms`);
          
          // Resolve the task promise
          nextTask.resolve(result);
          
          // Emit task completed event
          this.emit('taskCompleted', { 
            taskId,
            type: nextTask.task.type,
            result,
            duration
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const duration = Date.now() - startTime;
          
          console.error(`${logPrefix} [${taskId}] Processing failed after ${duration}ms:`, error);
          this.logger.error(`Task ${taskId} (${nextTask.task.type}) failed after ${duration}ms: ${errorMessage}`);
          
          // Reject the task promise
          nextTask.reject(error);
          
          // Emit task failed event
          this.emit('taskFailed', { 
            taskId,
            type: nextTask.task.type,
            error: errorMessage,
            duration
          });
          
          throw error; // Re-throw to be caught by the outer catch
        } finally {
          // Clean up
          this.activeTasks.delete(taskId);
          this.isProcessing = false;
          
          // Process next task if available
          if (this.taskQueue.length > 0) {
            console.log(`${logPrefix} [${taskId}] Queue has ${this.taskQueue.length} pending tasks, processing next...`);
            setImmediate(() => this.processQueue().catch(console.error));
          } else {
            console.log(`${logPrefix} [${taskId}] No more tasks in queue`);
          }
        }
      };

      // Start processing the task
      const taskPromise = processTask();
      this.activeTasks.set(taskId, taskPromise as Promise<void>);
      
      // Handle any unhandled errors in the task
      taskPromise.catch(console.error);
      
      // Return the promise to satisfy TypeScript
      return taskPromise;
    } catch (error) {
      console.error(`${logPrefix} Error in processQueue:`, error);
      this.isProcessing = false;
      throw error;
    }
  }
}
