# 🚀 Monitoria SDK

SDK simplificada para observabilidade completa em aplicações Node.js/NestJS com configuração via variáveis de ambiente.

## ⚡ Instalação

```bash
npm install @psouza.yuri/monitoria-sdk
```

## 🎯 Funcionalidades

- ✅ **Logs Estruturados**: Logs JSON com contexto rico
- ✅ **Tracing Distribuído**: Rastreamento automático de requisições
- ✅ **Métricas**: Coleta automática de métricas de performance
- ✅ **Configuração via ENV**: Todas as configurações via variáveis `MONITORIA_*`
- ✅ **Zero Config**: Funciona com configurações mínimas
- ✅ **NestJS Ready**: Integração automática com interceptors

## 🔧 Configuração Rápida

### 1. Variáveis de Ambiente (Recomendadas)

A SDK funciona mesmo sem variáveis de ambiente configuradas, mas funcionará em **modo degradado** (apenas logs no console):

```bash
# Nome do serviço (recomendado)
MONITORIA_SERVICE_NAME=meu-servico

# Endpoint do collector (recomendado para enviar logs)
MONITORIA_COLLECTOR_ENDPOINT=http://localhost:4318
```

**Nota:** Sem estas variáveis, a SDK mostrará avisos no console, mas sua aplicação continuará funcionando normalmente.

### 2. Configuração no main.ts

```typescript
// Importar ANTES de qualquer outra coisa
import '@psouza.yuri/monitoria-sdk/telemetry';

import { NestFactory } from '@nestjs/core';
import { setupLogging } from '@psouza.yuri/monitoria-sdk';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar logging (opcional - usa ENV vars)
  setupLogging(app);
  
  await app.listen(3000);
}

bootstrap();
```

## 📋 Variáveis de Ambiente Completas

### Configurações Recomendadas (Para Produção)
```bash
MONITORIA_SERVICE_NAME=meu-servico
MONITORIA_COLLECTOR_ENDPOINT=http://localhost:4318
```

**⚠️ Sem estas variáveis:** A SDK funcionará em modo degradado (apenas logs no console) mas não interromperá sua aplicação.

### Configurações Opcionais
```bash
# Serviço
MONITORIA_SERVICE_VERSION=1.0.0
MONITORIA_ENVIRONMENT=development

# Collector
MONITORIA_COLLECTOR_PROTOCOL=http
MONITORIA_COLLECTOR_TIMEOUT=5000

# Logging
MONITORIA_LOG_LEVEL=info
MONITORIA_ENABLE_CONSOLE=false

# Telemetria
MONITORIA_ENABLE_TRACING=true
MONITORIA_ENABLE_METRICS=true
MONITORIA_ENABLE_LOGS=true
```

## 🎨 Exemplos de Uso

### Desenvolvimento
```bash
MONITORIA_SERVICE_NAME=api-dev
MONITORIA_ENVIRONMENT=development
MONITORIA_ENABLE_CONSOLE=true
MONITORIA_LOG_LEVEL=debug
```

### Produção
```bash
MONITORIA_SERVICE_NAME=api-prod
MONITORIA_ENVIRONMENT=production
MONITORIA_ENABLE_CONSOLE=false
MONITORIA_LOG_LEVEL=info
MONITORIA_COLLECTOR_ENDPOINT=https://collector.prod.com:4318
```

## 📝 Enviando Logs em Qualquer Parte do Código

### Usando o Singleton (Recomendado)

A forma mais simples e prática é usar o `getLogger()` que retorna uma instância singleton do logger:

```typescript
// Em qualquer arquivo do seu código
import { getLogger } from '@psouza.yuri/monitoria-sdk';

// Em um service/controller/middleware
export class TodoService {
  private readonly logger = getLogger();

  async create(todo: CreateTodoDto) {
    // Log de início da operação
    this.logger.info('Criando novo todo', {
      request: {
        title: todo.title,
        category: todo.category,
      }
    });

    try {
      const result = await this.todoRepository.save(todo);
      
      // Log de sucesso
      this.logger.info('Todo criado com sucesso', {
        response: {
          id: result.id,
        }
      });

      return result;
    } catch (error) {
      // Log de erro
      this.logger.error('Erro ao criar todo', {
        error: {
          message: error.message,
          stack: error.stack,
        }
      });
      throw error;
    }
  }
}
```

### Exemplo em Controller

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { getLogger } from '@psouza.yuri/monitoria-sdk';

@Controller('todos')
export class TodosController {
  private readonly logger = getLogger();

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto) {
    this.logger.info('POST /todos - Recebendo requisição', {
      request: {
        body: createTodoDto,
      }
    });

    // Sua lógica aqui
    return { message: 'Todo criado' };
  }

  @Get()
  async findAll() {
    this.logger.debug('GET /todos - Buscando todos os todos');
    
    // Sua lógica aqui
    return [];
  }
}
```

### Exemplo em Middleware/Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { getLogger } from '@psouza.yuri/monitoria-sdk';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = getLogger();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    this.logger.debug('Verificando autenticação', {
      request: {
        path: request.url,
        method: request.method,
        userId: request.user?.id,
      }
    });

    // Sua lógica de autenticação
    return true;
  }
}
```

### Exemplo em Service com Contexto Customizado

```typescript
import { Injectable } from '@nestjs/common';
import { getLogger } from '@psouza.yuri/monitoria-sdk';
import { trace } from '@opentelemetry/api';

@Injectable()
export class PaymentService {
  private readonly logger = getLogger();

  async processPayment(paymentData: any) {
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    this.logger.info('Iniciando processamento de pagamento', {
      request: {
        amount: paymentData.amount,
        currency: paymentData.currency,
      },
      // Contexto de trace para correlacionar com spans
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    try {
      // Processar pagamento
      const result = await this.paymentGateway.charge(paymentData);
      
      this.logger.info('Pagamento processado com sucesso', {
        response: {
          transactionId: result.id,
          status: result.status,
        }
      });

      return result;
    } catch (error) {
      this.logger.error('Erro ao processar pagamento', {
        error: {
          message: error.message,
          code: error.code,
        }
      });
      throw error;
    }
  }
}
```

### Fazendo Override da Configuração

Se você precisar sobrescrever a configuração padrão do logger:

```typescript
import { getLogger } from '@psouza.yuri/monitoria-sdk';

// Get logger com configuração customizada (apenas na primeira chamada)
const logger = getLogger({ 
  serviceName: 'custom-service' 
});

logger.info('Log com configuração customizada', {
  context: { custom: true }
});
```

## 🔍 O que é Capturado Automaticamente

### Logs Estruturados
```json
{
  "level": "info",
  "message": "GET /api/users (45.2ms)",
  "service": "meu-servico",
  "version": "1.0.0",
  "environment": "development",
  "traceId": "abc123...",
  "spanId": "def456...",
  "timestamp": "2025-01-09T15:30:00.000Z",
  "context": {
    "request": {
      "method": "GET",
      "url": "/api/users",
      "headers": {...}
    },
    "response": {
      "statusCode": 200,
      "headers": {...}
    },
    "performance": {
      "durationMs": 45.2
    }
  }
}
```

### Traces Distribuídos
- ✅ HTTP requests/responses
- ✅ Express middleware
- ✅ Controller execution
- ✅ Database operations
- ✅ External API calls

### Métricas
- ✅ Request count
- ✅ Response time
- ✅ Error rate
- ✅ Throughput

## ⏱️ Entendendo Duration e Timing

### 📊 Conceitos de Duration

A SDK captura diferentes tipos de duration dependendo do contexto:

#### **1. Duration do Logger (Recomendado)**
- **O que mede**: Tempo de processamento da API (span principal)
- **Exemplo**: `8.54ms` para um POST /api/v1/todos
- **Inclui**: Lógica de negócio, validações, processamento
- **Não inclui**: Operações de banco de dados, chamadas externas, middleware

#### **2. Duration do Trace Completo**
- **O que mede**: Tempo total de todas as operações
- **Exemplo**: `69ms` para o mesmo POST
- **Inclui**: 
  - Span principal (8.54ms)
  - Operações de banco de dados (48.73ms)
  - Conexões de rede (8.18ms)
  - Middleware (0.5ms)

#### **3. Duration do Postman/Cliente**
- **O que mede**: Tempo de rede (request → response)
- **Exemplo**: `42ms` para o mesmo POST
- **Inclui**: Latência de rede + processamento total

### 🎯 Por que Diferentes Durations?

```
Cliente (Postman): 42ms
    ↓ (rede)
API recebe request
    ↓
Trace inicia: 17.08ms (middleware + handler)
    ├── Middleware: 0.5ms
    ├── Request Handler: 8.54ms ← LOGGER DURATION
    ├── POST interno (DB): 48.73ms
    └── tcp.connect: 8.18ms
    ↓
Trace total: 69ms
    ↓ (rede)
Cliente recebe response: 42ms
```

### ✅ Qual Duration Usar?

| Contexto | Duration Recomendado | Por quê? |
|----------|---------------------|----------|
| **Logs da API** | Logger (8.54ms) | Tempo real de processamento da API |
| **Monitoramento** | Trace completo (69ms) | Visão completa de performance |
| **Cliente** | Postman (42ms) | Experiência do usuário final |

## 🔧 Configuração do OpenTelemetry Collector

Para usar o Collector, você precisa configurar um arquivo `collector.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    send_batch_size: 4096
    timeout: 5s

exporters:
  # Debug (opcional)
  debug:
    verbosity: basic

  # Envio para backend de observabilidade
  otlphttp/backend:
    endpoint: https://your-backend.com/v1/logs
    headers:
      authorization: Bearer ${API_KEY}
    compression: gzip
    timeout: 30s

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/backend, debug]
```

### Docker Compose para Collector

```yaml
version: '3.8'
services:
  collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/collector.yaml"]
    volumes:
      - ./collector.yaml:/etc/collector.yaml
    ports:
      - "4317:4317"   # gRPC
      - "4318:4318"   # HTTP
    environment:
      - API_KEY=your-api-key-here
```

## 🎨 Adicionando Contexto via Decorator

É possível enriquecer os logs dinamicamente usando **decorators** no NestJS para adicionar atributos extras (ex.: ação, categoria, etc.).  
Esses valores simples (string, número, boolean, arrays) irão automaticamente para **attributes** no SigNoz, ficando filtráveis.  
Objetos complexos irão para o **body.context**, ficando navegáveis no detalhe do log.

### Exemplo de uso

```typescript
// add-log-context.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AddLogContext = (ctx: Record<string, any>) =>
  SetMetadata('logContext', ctx);
```

```typescript
// controller
@Post()
@AddLogContext({ action: 'create_todo', category: createTodoDto.category })
async create(@Body() createTodoDto: CreateTodoDto) {
  return this.todoService.create(createTodoDto);
}
```

No SigNoz:
- `action` e `category` aparecerão como **attributes filtráveis**
- Qualquer objeto/array complexo adicionado irá para **body.context** como detalhe navegável

## 📊 Configurando Extração de Attributes para Group By no SigNoz

O SigNoz não permite fazer group by em campos que estão dentro do `body`. Para permitir group by em campos específicos do body ou headers, você pode configurar quais campos devem ser extraídos para `attributes`.

### Por que isso é necessário?

- **Attributes**: Campos indexados e filtráveis, podem ser usados em group by
- **Body**: Campos não indexados, apenas para navegação, não podem ser usados em group by

### Configuração

```typescript
// main.ts
import { setupLogging } from '@psouza.yuri/monitoria-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  setupLogging(app, {
    extractAttributes: {
      requestBody: ['category', 'status', 'priority'],
      requestHeaders: ['x-user-id', 'x-correlation-id', 'x-tenant-id'],
      responseBody: ['id', 'status'],
      responseHeaders: ['x-request-id']
    }
  });
  
  await app.listen(3000);
}
```

### Como funciona

1. **requestBody**: Campos do `request.body` que serão extraídos para attributes
   - Exemplo: `['category', 'status']` → attributes `body.category`, `body.status`

2. **requestHeaders**: Headers do `request.headers` que serão extraídos
   - Exemplo: `['x-user-id']` → attribute `header.x.user.id` (hífens viram pontos)
   - Headers são case-insensitive

3. **responseBody**: Campos do `response.body` que serão extraídos
   - Exemplo: `['id', 'status']` → attributes `response.body.id`, `response.body.status`

4. **responseHeaders**: Headers do `response.headers` que serão extraídos
   - Exemplo: `['x-request-id']` → attribute `response.header.x.request.id`

### Exemplo de Uso

Com a configuração acima, quando você fizer um request:

```typescript
// POST /todos
{
  "category": "trabalho",
  "priority": "high",
  "description": "Descrição longa..."
}
```

No SigNoz você terá:
- **Attributes** (podem ser usados em group by):
  - `body.category` = "trabalho"
  - `body.priority` = "high"
  - `header.x.user.id` = "12345" (se presente no header)
- **Body completo** (para navegação):
  - Todos os campos incluindo `description`

### Notas Importantes

- ✅ Apenas valores primitivos são extraídos (string, number, boolean, arrays de primitivos)
- ✅ Objetos complexos continuam apenas no body
- ✅ Se um campo não existir, é ignorado silenciosamente (não quebra o fluxo)
- ✅ Headers são case-insensitive e normalizados (hífens viram pontos)
- ✅ A configuração é aplicada automaticamente em todos os logs do interceptor

### Exemplo Completo

```typescript
// main.ts
setupLogging(app, {
  extractAttributes: {
    requestBody: ['category', 'status'],
    requestHeaders: ['x-user-id']
  }
});

// Agora todos os logs terão automaticamente:
// - body.category e body.status extraídos do request.body
// - header.x.user.id extraído do header x-user-id
```

Depois disso, você pode fazer group by por `body.category` ou `header.x.user.id` no SigNoz! 🎉

## 🔍 Criando Traces Customizados

Para rastrear operações específicas do seu negócio, você pode criar spans customizados que aparecerão no trace distribuído.

### 1. Importar o Tracer

```typescript
import { trace } from '@opentelemetry/api';

// Obter o tracer
const tracer = trace.getTracer('meu-servico', '1.0.0');
```

### 2. Criar Spans Customizados

```typescript
// Exemplo: Rastrear operação de negócio
async function processarPagamento(pagamento: Pagamento) {
  // Criar span customizado
  const span = tracer.startSpan('processar-pagamento', {
    attributes: {
      'payment.id': pagamento.id,
      'payment.amount': pagamento.valor,
      'payment.method': pagamento.metodo,
      'business.operation': 'payment_processing'
    }
  });

  try {
    // Sua lógica de negócio aqui
    const resultado = await validarPagamento(pagamento);
    
    // Adicionar atributos de sucesso
    span.setAttributes({
      'payment.status': 'success',
      'payment.processed_at': new Date().toISOString()
    });

    return resultado;
  } catch (error) {
    // Marcar span como erro
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    // Sempre finalizar o span
    span.end();
  }
}
```

## 📊 Monitoramento

### SigNoz/OpenTelemetry Collector
- **Traces**: Visualização completa de requisições
- **Logs**: Logs estruturados com contexto
- **Métricas**: Performance e health checks

### Dashboards Recomendados
- Request rate por endpoint
- Response time percentiles
- Error rate por serviço
- Throughput por ambiente

## 🚨 Troubleshooting

### A SDK mostra avisos mas a aplicação funciona

Isso é **esperado**! A SDK foi projetada para não quebrar sua aplicação mesmo sem variáveis de ambiente configuradas.

Você verá mensagens como:
```
⚠️  Monitoria SDK não inicializada - Variáveis de ambiente ausentes:
⚠️   - MONITORIA_SERVICE_NAME
⚠️   - MONITORIA_COLLECTOR_ENDPOINT
⚠️   A SDK funcionará em modo degradado (apenas logs no console)
```

**Solução:** Configure as variáveis de ambiente conforme documentado acima.

### Logs não aparecem no Collector
- Verificar `MONITORIA_COLLECTOR_ENDPOINT`
- Verificar conectividade de rede
- Verificar se o collector está rodando

### Traces não aparecem
- Verificar se `import '@psouza.yuri/monitoria-sdk/telemetry'` foi feito ANTES do NestJS
- Verificar se `setupLogging()` foi chamado DEPOIS do NestJS
- Verificar se requests estão sendo feitos

### Erro de compilação
- Verificar se todas as dependências estão instaladas
- Verificar se as interfaces estão sendo importadas corretamente

### ❓ "Por que o duration do log é diferente do Postman?"

**Resposta**: São medições diferentes!

- **Logger (8.54ms)**: Tempo de processamento da API
- **Postman (42ms)**: Tempo total incluindo rede
- **Trace (69ms)**: Tempo de todas as operações internas

### ❓ "O duration do log está correto?"

**Resposta**: Sim! O logger mede o **span principal** da API, que é exatamente o que você quer para logs de aplicação.

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
src/
├── telemetry.ts            # Lógica de telemetria
├── adapters/
│   └── nestjs/
│       ├── setup.ts        # Setup do NestJS
│       └── logging.interceptor.ts
├── logger/
│   └── logger.ts          # Logger principal
└── types/
    └── index.ts           # Interfaces simplificadas
```

### Testes
```bash
npm test
npm run test:watch
```

### Build
```bash
npm run build
npm run dev
```

## 📝 Changelog

### v1.0.0 - Versão Inicial
- ✅ Configuração via variáveis de ambiente `MONITORIA_*`
- ✅ Interface `LoggerConfig` simplificada
- ✅ Inicialização automática do OpenTelemetry
- ✅ Integração completa com NestJS
- ✅ Documentação consolidada

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.