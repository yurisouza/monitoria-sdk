// Exportações principais da Monitoria SDK
import { Logger } from './logger/logger';
import { LogLevel, LogEntry, LoggerConfig, NestLoggingConfig, shouldLogLevel } from './types';

// Tipos e classes principais
export { Logger, LogLevel, LogEntry, LoggerConfig, NestLoggingConfig, shouldLogLevel };

// NestJS adapter
export { setupLogging } from './adapters/nestjs';

// Telemetria - importação direta do arquivo que funciona
export { sdk } from './telemetry';

// Factory simplificada
export function createLogger(config: LoggerConfig = {}): Logger {
  // Carregar configurações das variáveis de ambiente
  const serviceName = process.env.MONITORIA_SERVICE_NAME || 'unknown-service';
  const serviceVersion = process.env.MONITORIA_SERVICE_VERSION || '1.0.0';
  const environment = process.env.MONITORIA_ENVIRONMENT || 'development';
  const collectorEndpoint = process.env.MONITORIA_COLLECTOR_ENDPOINT || 'http://localhost:4318';
  const logLevel = process.env.MONITORIA_LOG_LEVEL || 'info';
  const enableConsole = process.env.MONITORIA_ENABLE_CONSOLE === 'true';
  const enableTracing = process.env.MONITORIA_ENABLE_TRACING !== 'false';
  const enableLogs = process.env.MONITORIA_ENABLE_LOGS !== 'false';
  const enableMetrics = process.env.MONITORIA_ENABLE_METRICS !== 'false';

  const envConfig = {
    serviceName,
    serviceVersion,
    environment,
    collectorEndpoint,
    logLevel,
    enableConsole,
    enableTracing,
    enableLogs,
    enableMetrics,
  };

  const finalConfig = { ...envConfig, ...config };
  return new Logger(finalConfig);
}