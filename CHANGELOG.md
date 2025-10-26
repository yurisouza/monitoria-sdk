# Changelog

## [2.0.0] - 2025-01-09

### Breaking Changes
- ❌ **Removido** `createLogger()` - Use `getLogger()` para obter a instância singleton do logger
- A SDK agora usa um padrão singleton globalmente para garantir uma única instância do logger

### Added
- ✅ Função `getLogger()` - Obtém a instância singleton do logger
- ✅ Função `setLogger()` - Permite definir a instância do logger manualmente (útil para testes)
- ✅ Função `resetLogger()` - Reseta a instância do logger (útil para testes)
- ✅ `LoggerSingleton` - Gerencia a instância global do logger
- ✅ Documentação completa com exemplos de uso em Services, Controllers, Guards e Middlewares
- ✅ Exemplos práticos de uso

### Changed
- `LoggingInterceptor` agora usa `LoggerSingleton` para garantir uma única instância
- API simplificada: apenas `getLogger()` para obter o logger
- Todas as referências ao `createLogger()` foram removidas da documentação

### Migration Guide

**Antes (v1.x):**
```typescript
import { createLogger } from '@psouza.yuri/monitoria-sdk';

const logger = createLogger();
logger.info('mensagem');
```

**Depois (v2.x):**
```typescript
import { getLogger } from '@psouza.yuri/monitoria-sdk';

const logger = getLogger();
logger.info('mensagem');
```

## [1.0.0] - 2025-01-09

### Added
- ✅ Configuração via variáveis de ambiente `MONITORIA_*`
- ✅ Interface `LoggerConfig` simplificada
- ✅ Inicialização automática do OpenTelemetry
- ✅ Integração completa com NestJS
- ✅ Documentação consolidada
- ✅ Suporte a logs estruturados
- ✅ Tracing distribuído automático
- ✅ Métricas de performance
- ✅ Configuração zero-config
- ✅  Nome do pacote: `@psouza.yuri/monitoria-sdk`
- ✅  Versão inicial: `1.0.0`
- ✅  Estrutura simplificada e limpa


## Como usar

```bash
npm install @psouza.yuri/monitoria-sdk
```

```typescript
// main.ts
import '@psouza.yuri/monitoria-sdk/telemetry';
import { setupLogging } from '@psouza.yuri/monitoria-sdk';

setupLogging(app); // Usa ENV vars automaticamente
```

### Variáveis de ambiente obrigatórias:
```bash
MONITORIA_SERVICE_NAME=meu-servico
MONITORIA_COLLECTOR_ENDPOINT=http://localhost:4318
```
