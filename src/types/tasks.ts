export interface Task<T = any, R = any> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  createdAt?: Date;
  timeout?: number;
  result?: R;
  error?: Error;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TaskResult<R = any> {
  success: boolean;
  error?: Error;
  result?: R;
}

export interface TaskHandler<T = any, R = any> {
  (task: Task<T, R>): Promise<R>;
}
