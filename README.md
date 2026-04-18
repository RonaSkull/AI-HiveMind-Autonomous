# AI HiveMind Autonomous v2.0

> Plataforma descentralizada de economia AI com agentes autônomos, computação quântica e blockchain - Agora com arquitetura moderna e técnicas avançadas.

## 🚀 O Que Há de Novo na Versão 2.0?

### Arquitetura Completamente Refatorada

- **Monorepo Moderno** com TurboRepo para builds otimizadas
- **Arquitetura Baseada em Agentes** com Actor Model
- **Sistema de Mensagens Assíncrono** tipado e escalável
- **Multi-LLM Support** (OpenAI, Anthropic, Local via Ollama)
- **RAG (Retrieval-Augmented Generation)** para conhecimento contextual
- **TypeScript 5.x** com strict mode máximo

### Componentes Principais

#### 📦 Packages

| Package | Descrição | Status |
|---------|-----------|--------|
| `@aihivemind/types` | Definições de tipos TypeScript compartilhados | ✅ Pronto |
| `@aihivemind/core` | Núcleo com BaseAgent, EventBus, Logger | ✅ Pronto |
| `@aihivemind/ai` | Serviços de IA (LLM, RAG) | ✅ Pronto |
| `@aihivemind/quantum` | Serviços de computação quântica | 🚧 Em desenvolvimento |
| `@aihivemind/blockchain` | Integração Web3 e smart contracts | 🚧 Em desenvolvimento |
| `@aihivemind/utils` | Utilitários compartilhados | 🚧 Em desenvolvimento |

#### 🎯 Apps

| App | Descrição | Status |
|-----|-----------|--------|
| `agents` | Microserviço de agentes autônomos | 🚧 Em desenvolvimento |
| `api` | API Gateway REST/GraphQL | 🚧 Em desenvolvimento |
| `worker` | Background workers para tarefas assíncronas | 🚧 Em desenvolvimento |
| `frontend` | Interface moderna (React/Next.js) | 🚧 Em desenvolvimento |

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Apps Layer                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Agents     │     API      │    Worker    │   Frontend     │
│  Service     │   Gateway    │   Processes  │   (Next.js)    │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Packages Layer                            │
├───────────┬───────────┬───────────┬───────────┬────────────┤
│   Core    │    AI     │  Quantum  │ Blockchain│   Utils    │
│  (Base)   │  (LLM/RAG)│ (Qiskit)  │  (Viem)   │            │
└───────────┴───────────┴───────────┴───────────┴────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                   Infrastructure                             │
├──────────────┬──────────────┬───────────────────────────────┤
│   Docker     │  Kubernetes  │         Terraform             │
│  Compose     │   Manifests  │      (IaC)                    │
└──────────────┴──────────────┴───────────────────────────────┘
```

## 🛠 Instalação Rápida

### Pré-requisitos

- Node.js 20+ 
- pnpm 8+
- Git

### Setup

```bash
# Clonar repositório
git clone https://github.com/yourusername/ai-hivemind-autonomous.git
cd ai-hivemind-autonomous

# Instalar dependências
pnpm install

# Build de todos os packages
pnpm build

# Rodar em modo desenvolvimento
pnpm dev
```

## 📖 Uso Básico

### Criando um Agente Personalizado

```typescript
import { BaseAgent } from '@aihivemind/core';
import type { AgentConfig, Task } from '@aihivemind/types';

// Configurar agente
const config: AgentConfig = {
  id: 'trading-agent-1',
  name: 'AITradingAgent',
  version: '2.0.0',
  capabilities: ['market-analysis', 'signal-generation'],
  maxConcurrency: 3,
};

// Estender BaseAgent
class AITradingAgent extends BaseAgent {
  protected async initialize(): Promise<void> {
    this.logger.info('Initializing trading agent...');
    // Setup inicial (conexões, cache, etc.)
  }

  protected async processTask<T, R>(task: Task<T, R>): Promise<R> {
    switch (task.type) {
      case 'ANALYZE_MARKET':
        return await this.analyzeMarket(task.data as any) as R;
      case 'GENERATE_SIGNAL':
        return await this.generateSignal(task.data as any) as R;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async analyzeMarket(data: any): Promise<string> {
    // Implementação da análise de mercado
    return 'Market analysis result';
  }

  private async generateSignal(data: any): Promise<any> {
    // Implementação da geração de sinais
    return { action: 'BUY', confidence: 0.85 };
  }
}

// Usar o agente
const agent = new AITradingAgent(config);

await agent.start();

// Enqueue de tarefas
const result = await agent.enqueueTask({
  type: 'ANALYZE_MARKET',
  data: { market: 'crypto', timeframe: '1h' },
  priority: 1,
  maxRetries: 3,
});

console.log(result);
```

### Sistema de Mensagens

```typescript
import { eventBus } from '@aihivemind/core';

// Publicar mensagem
eventBus.publish('TASK_REQUEST', {
  taskId: '123',
  type: 'ANALYZE_MARKET',
}, { from: 'agent-1' });

// Subscrever a mensagens
const unsubscribe = eventBus.subscribe('TASK_REQUEST', (message) => {
  console.log('Received task request:', message.payload);
});

// Enviar para agente específico
eventBus.sendTo('agent-1', 'STATUS_UPDATE', {
  status: 'running',
  progress: 50,
});
```

### Serviço de IA Multi-Provider

```typescript
import { llmService } from '@aihivemind/ai';

// Registrar providers
llmService.registerProvider({
  id: 'openai',
  name: 'OpenAI',
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: 'https://api.openai.com/v1',
  models: ['gpt-4', 'gpt-3.5-turbo'],
  defaultModel: 'gpt-4',
});

llmService.registerProvider({
  id: 'ollama',
  name: 'Ollama Local',
  baseUrl: 'http://localhost:11434/api',
  models: ['llama2', 'mistral'],
  defaultModel: 'llama2',
});

// Gerar texto
const response = await llmService.generateText([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Explain quantum computing in simple terms.' }
], {
  providerId: 'openai',
  temperature: 0.7,
});

console.log(response);
```

### RAG (Retrieval-Augmented Generation)

```typescript
import { ragService } from '@aihivemind/ai';

// Adicionar documentos
await ragService.addDocuments([
  {
    id: 'doc-1',
    content: 'Quantum computing uses qubits instead of classical bits...',
    metadata: { source: 'wikipedia', category: 'quantum' },
  },
  {
    id: 'doc-2',
    content: 'Machine learning algorithms can optimize quantum circuits...',
    metadata: { source: 'research-paper', category: 'ml' },
  },
]);

// Buscar documentos relevantes
const results = await ragService.search('quantum machine learning', 3);

console.log(`Found ${results.length} relevant documents`);
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# IBM Quantum
IBM_QUANTUM_API_KEY=...

# Blockchain
RPC_URL=https://mainnet.infura.io/v3/...
PRIVATE_KEY=0x...

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## 📊 Monitoramento & Observabilidade

O sistema inclui:

- **Logging Estruturado** com níveis (debug, info, warn, error)
- **Event Bus** com histórico de mensagens
- **Métricas** de performance de agentes
- **Tracing** distribuído (em breve)

```typescript
import { createLogger } from '@aihivemind/core';

const logger = createLogger('MyComponent');

logger.debug('Debug message with metadata', { userId: 123 });
logger.info('User logged in');
logger.warn('Rate limit approaching');
logger.error('Critical error', error);
```

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Testes em watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📦 Deploy

### Docker

```bash
# Build das imagens
pnpm docker:build

# Start dos serviços
pnpm docker:up

# Stop
pnpm docker:down
```

### Kubernetes

```bash
# Aplicar manifests
kubectl apply -f infra/k8s/
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 License

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Documentação Completa](./docs/)
- [Guia de Migração v1→v2](./docs/MIGRATION_GUIDE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Exemplos](./examples/)

---

**Desenvolvido com ❤️ pela comunidade AI HiveMind**
