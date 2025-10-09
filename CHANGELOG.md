# Changelog

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
