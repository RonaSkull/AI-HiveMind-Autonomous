import { EventEmitter } from 'eventemitter3';
import type { Message, MessageType } from '@aihivemind/types';
import { createLogger } from './logger.js';

const logger = createLogger('EventBus');

/**
 * Central event bus for inter-agent communication
 * Implements publish-subscribe pattern with type safety
 */
export class EventBus extends EventEmitter {
  private static instance: EventBus | null = null;
  private messageHistory: Map<string, Message[]> = new Map();
  private readonly maxHistorySize: number;

  private constructor(maxHistorySize: number = 100) {
    super();
    this.maxHistorySize = maxHistorySize;
    logger.info('EventBus initialized');
  }

  /**
   * Get singleton instance of EventBus
   */
  public static getInstance(maxHistorySize?: number): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(maxHistorySize);
    }
    return EventBus.instance;
  }

  /**
   * Publish a message to the event bus
   */
  public publish<T>(type: MessageType, payload: T, metadata?: { from?: string; correlationId?: string }): void {
    const message: Message<T> = {
      id: this.generateMessageId(),
      type,
      from: metadata?.from || 'system',
      to: '*',
      payload,
      timestamp: new Date(),
      correlationId: metadata?.correlationId,
    };

    logger.debug(`Publishing message: ${type} from ${message.from}`);
    
    // Store in history
    this.addToHistory(message);

    // Emit the message
    this.emit(`message:${type}`, message);
    this.emit('message:*', message);
  }

  /**
   * Subscribe to a specific message type
   */
  public subscribe<T>(type: MessageType, handler: (message: Message<T>) => void): () => void {
    const eventName = `message:${type}`;
    
    logger.debug(`Subscribing to ${type}`);
    
    this.on(eventName, handler);

    // Return unsubscribe function
    return () => {
      this.off(eventName, handler);
      logger.debug(`Unsubscribed from ${type}`);
    };
  }

  /**
   * Subscribe to all messages
   */
  public subscribeAll(handler: (message: Message) => void): () => void {
    logger.debug('Subscribing to all messages');
    
    this.on('message:*', handler);

    return () => {
      this.off('message:*', handler);
      logger.debug('Unsubscribed from all messages');
    };
  }

  /**
   * Send a message to a specific agent
   */
  public sendTo<T>(agentId: string, type: MessageType, payload: T, metadata?: { from?: string; correlationId?: string }): void {
    const message: Message<T> = {
      id: this.generateMessageId(),
      type,
      from: metadata?.from || 'system',
      to: agentId,
      payload,
      timestamp: new Date(),
      correlationId: metadata?.correlationId,
    };

    logger.debug(`Sending message to ${agentId}: ${type}`);
    
    this.addToHistory(message);
    this.emit(`message:${type}:to:${agentId}`, message);
    this.emit(`message:to:${agentId}`, message);
  }

  /**
   * Get message history for a specific type
   */
  public getHistory(type?: MessageType, limit: number = 50): Message[] {
    if (!type) {
      // Return all recent messages
      const allMessages: Message[] = [];
      for (const messages of this.messageHistory.values()) {
        allMessages.push(...messages);
      }
      return allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
    }

    const messages = this.messageHistory.get(type) || [];
    return messages.slice(-limit);
  }

  /**
   * Clear message history
   */
  public clearHistory(type?: MessageType): void {
    if (!type) {
      this.messageHistory.clear();
      logger.info('Cleared all message history');
    } else {
      this.messageHistory.delete(type);
      logger.debug(`Cleared history for ${type}`);
    }
  }

  /**
   * Get statistics about the event bus
   */
  public getStats(): { 
    listenerCount: number; 
    eventNames: (string | symbol)[];
    historySize: number;
  } {
    return {
      listenerCount: this.listenerCount('message:*'),
      eventNames: this.eventNames(),
      historySize: Array.from(this.messageHistory.values()).reduce((acc, arr) => acc + arr.length, 0),
    };
  }

  private addToHistory(message: Message): void {
    const type = message.type;
    const messages = this.messageHistory.get(type) || [];
    
    messages.push(message);
    
    // Limit history size
    if (messages.length > this.maxHistorySize) {
      messages.shift();
    }
    
    this.messageHistory.set(type, messages);
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
