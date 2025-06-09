import { EventEmitter } from 'events';
import { createLogger } from '@utils/logger';
import config from '@config/config';

export interface Task {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  taskId: string;
  result?: any;
  error?: Error;
  metadata?: Record<string, any>;
}

export abstract class BaseAgent extends EventEmitter {
  protected readonly logger = createLogger(this.constructor.name);
  private isRunning = false;
  private activeTasks = new Map<string, Promise<void>>();
  private taskQueue: Array<{ task: Task; resolve: (value: any) => void; reject: (error: Error) => void }> = [];

  constructor() {
    super();
    this.logger.info('Agent initialized');
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting agent');
    await this.initialize();
    this.processQueue();
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Stopping agent');
    
    // Wait for active tasks to complete
    await Promise.all(Array.from(this.activeTasks.values()));
    
    await this.cleanup();
  }

  public async enqueueTask(task: Omit<Task, 'id' | 'createdAt'>, priority = 0): Promise<any> {
    const taskWithId: Task = {
      ...task,
      id: this.generateTaskId(),
      createdAt: new Date(),
      priority,
    };

    this.logger.debug(`Enqueuing task ${taskWithId.id} of type ${task.type}`);
    
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task: taskWithId, resolve, reject });
      // Sort queue by priority (highest first)
      this.taskQueue.sort((a, b) => (b.task.priority || 0) - (a.task.priority || 0));
    });
  }

  protected abstract processTask(task: Task): Promise<any>;
  
  protected async initialize(): Promise<void> {
    // Override in child classes if needed
  }

  protected async cleanup(): Promise<void> {
    // Override in child classes if needed
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.taskQueue.length > 0 && this.activeTasks.size < config.agent.maxConcurrentTasks) {
        const { task, resolve, reject } = this.taskQueue.shift()!;
        
        const taskPromise = (async () => {
          try {
            this.logger.debug(`Starting task ${task.id} of type ${task.type}`);
            const result = await Promise.race([
              this.processTask(task),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Task timeout')), config.agent.taskTimeout)
              )
            ]);
            
            this.emit('taskComplete', { success: true, taskId: task.id, result });
            resolve(result);
          } catch (error) {
            this.logger.error(`Task ${task.id} failed:`, error);
            this.emit('taskError', { success: false, taskId: task.id, error });
            reject(error);
          } finally {
            this.activeTasks.delete(task.id);
          }
        })();

        this.activeTasks.set(task.id, taskPromise);
      } else {
        // No tasks to process or at max concurrency, wait a bit
        await new Promise(resolve => setTimeout(resolve, config.agent.pollInterval));
      }
    }
  }

  private generateTaskId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getActiveTasks(): string[] {
    return Array.from(this.activeTasks.keys());
  }

  public getQueuedTasks(): Task[] {
    return this.taskQueue.map(item => item.task);
  }
}
