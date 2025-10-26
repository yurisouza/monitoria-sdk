import { Logger } from './logger/logger';
import { LoggerConfig } from './types';

/**
 * Singleton para gerenciar instância global do Logger
 * Permite acesso ao logger de qualquer parte do código sem necessidade
 * de instanciar novamente
 */
class LoggerSingleton {
  private static instance: Logger | null = null;
  private static config: LoggerConfig = {};

  /**
   * Configura e retorna a instância do Logger
   * Se já existe uma instância, retorna ela
   * Caso contrário, cria uma nova baseada nas configurações de ambiente
   * 
   * A SDK funciona mesmo sem variáveis de ambiente configuradas (modo degradado)
   */
  static getInstance(config: LoggerConfig = {}): Logger {
    // Se já existe instância e o config não mudou, retorna a instância existente
    if (this.instance && Object.keys(config).length === 0) {
      return this.instance;
    }

    // Carregar configurações das variáveis de ambiente (com defaults tolerantes)
    const serviceName = process.env.MONITORIA_SERVICE_NAME || 'unknown-service';
    const serviceVersion = process.env.MONITORIA_SERVICE_VERSION || '1.0.0';
    const environment = process.env.MONITORIA_ENVIRONMENT || 'development';
    const collectorEndpoint = process.env.MONITORIA_COLLECTOR_ENDPOINT || ''; // Vazio por padrão - não quebra
    const logLevel = process.env.MONITORIA_LOG_LEVEL || 'info';
    const enableConsole = process.env.MONITORIA_ENABLE_CONSOLE !== 'false';
    const enableTracing = process.env.MONITORIA_ENABLE_TRACING !== 'false';
    const enableLogs = process.env.MONITORIA_ENABLE_LOGS !== 'false';
    const enableMetrics = process.env.MONITORIA_ENABLE_METRICS !== 'false';

    const envConfig: any = {
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

    // Criar instância apenas se não existe
    if (!this.instance) {
      this.instance = new Logger(finalConfig);
      this.config = finalConfig;
    }
    // Se já existe instância, retorna a existente (configuração passada é ignorada)

    return this.instance;
  }

  /**
   * Define manualmente a instância do Logger (útil para testes)
   */
  static setInstance(instance: Logger): void {
    this.instance = instance;
  }

  /**
   * Reseta a instância (útil para testes)
   */
  static reset(): void {
    this.instance = null;
    this.config = {};
  }

  /**
   * Verifica se já existe uma instância configurada
   */
  static hasInstance(): boolean {
    return this.instance !== null;
  }
}

export { LoggerSingleton };

