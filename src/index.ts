// Exportações principais da Monitoria SDK
import { Logger } from './logger/logger';
import { LogLevel, LogEntry, LoggerConfig, NestLoggingConfig, shouldLogLevel } from './types';
import { LoggerSingleton } from './singleton';

// Tipos e classes principais
export { Logger, LogLevel, LogEntry, LoggerConfig, NestLoggingConfig, shouldLogLevel };

// NestJS adapter
export { setupLogging } from './adapters/nestjs';

// Telemetria - importação direta do arquivo que funciona
export { sdk } from './telemetry';

/**
 * Obtém a instância SINGLETON do Logger
 * Use esta função em qualquer parte do código para acessar o logger
 * 
 * @param config - Configuração opcional (apenas se não houver instância ainda)
 * @returns Instância global do Logger
 * 
 * @example
 * ```typescript
 * // Em qualquer arquivo do seu código
 * import { getLogger } from '@psouza.yuri/monitoria-sdk';
 * 
 * const logger = getLogger();
 * logger.info('Processamento iniciado', { userId: '123' });
 * ```
 */
export function getLogger(config: LoggerConfig = {}): Logger {
  return LoggerSingleton.getInstance(config);
}

/**
 * Define manualmente a instância do Logger (útil para testes)
 * 
 * @param instance - Instância do Logger
 */
export function setLogger(instance: Logger): void {
  LoggerSingleton.setInstance(instance);
}

/**
 * Reseta a instância do logger (útil para testes)
 */
export function resetLogger(): void {
  LoggerSingleton.reset();
}