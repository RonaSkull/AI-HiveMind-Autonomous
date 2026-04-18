import { createLogger } from '@aihivemind/core';
import type { Document, VectorStore } from '@aihivemind/types';

const logger = createLogger('RAGService');

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Provides context-aware responses using vector search
 */
export class RAGService implements VectorStore {
  private static instance: RAGService | null = null;
  private documents: Map<string, Document> = new Map();
  private index: Map<string, number[]> = new Map(); // Simple in-memory index

  private constructor() {
    logger.info('RAGService initialized');
  }

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]): Promise<void> {
    logger.info(`Adding ${documents.length} documents to vector store`);

    for (const doc of documents) {
      this.documents.set(doc.id, doc);
      
      // In production, you would generate embeddings here
      // For now, we'll use a simple placeholder
      const embedding = doc.embedding || this.generatePlaceholderEmbedding(doc.content);
      this.index.set(doc.id, embedding);
    }

    logger.debug(`Total documents in store: ${this.documents.size}`);
  }

  /**
   * Search for relevant documents
   */
  async search(query: string, limit: number = 5): Promise<Document[]> {
    logger.debug(`Searching for: "${query}" (limit: ${limit})`);

    // In production, you would:
    // 1. Generate embedding for the query
    // 2. Perform similarity search
    // 3. Return top-k results

    // Simple keyword-based search for now
    const queryLower = query.toLowerCase();
    const scoredDocs: Array<{ doc: Document; score: number }> = [];

    for (const doc of this.documents.values()) {
      const contentLower = doc.content.toLowerCase();
      let score = 0;

      // Simple scoring based on keyword matches
      const queryWords = queryLower.split(/\s+/);
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          score++;
        }
      }

      if (score > 0) {
        scoredDocs.push({ doc, score });
      }
    }

    // Sort by score and return top results
    const results = scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ doc }) => doc);

    logger.debug(`Found ${results.length} relevant documents`);
    return results;
  }

  /**
   * Delete a document from the store
   */
  async deleteDocument(id: string): Promise<void> {
    logger.debug(`Deleting document: ${id}`);
    
    this.documents.delete(id);
    this.index.delete(id);
  }

  /**
   * Get statistics about the vector store
   */
  getStats(): { 
    documentCount: number;
    totalCharacters: number;
  } {
    const totalCharacters = Array.from(this.documents.values())
      .reduce((acc, doc) => acc + doc.content.length, 0);

    return {
      documentCount: this.documents.size,
      totalCharacters,
    };
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
    this.index.clear();
    logger.info('Cleared all documents from RAG store');
  }

  /**
   * Generate a placeholder embedding (for development only)
   * In production, use a real embedding model
   */
  private generatePlaceholderEmbedding(content: string): number[] {
    // This is a naive placeholder - NOT suitable for production
    // Use models like: text-embedding-ada-002, BERT, etc.
    const embedding = new Array(1536).fill(0);
    const hash = this.simpleHash(content);
    
    // Set some values based on content hash
    for (let i = 0; i < 10; i++) {
      embedding[i] = ((hash >> i) & 1) * 2 - 1;
    }
    
    return embedding;
  }

  /**
   * Simple hash function for placeholder embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

// Export singleton instance
export const ragService = RAGService.getInstance();
