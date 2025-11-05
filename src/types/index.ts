export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Níveis de log em ordem de prioridade (maior para menor)
const LOG_LEVEL_PRIORITY = {
  [LogLevel.ERROR]: 4,
  [LogLevel.WARN]: 3,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 1
};

// Função utilitária para verificar se um nível de log deve ser processado
export function shouldLogLevel(currentLevel: LogLevel, minLevel: LogLevel = LogLevel.INFO): boolean {
  return LOG_LEVEL_PRIORITY[currentLevel] >= LOG_LEVEL_PRIORITY[minLevel];
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  service?: string;
  version?: string;
  environment?: string;
  context?: any;
  traceId?: string;
  spanId?: string;
  requestId?: string;
  userId?: string;
  correlationId?: string;
  error?: any;
  performance?: any;
  request?: any;
  response?: any;
}

/**
 * Configuração de quais campos extrair para attributes (permite group by no SigNoz)
 * Campos extraídos aparecem como attributes filtráveis e podem ser usados em queries com group by
 */
export interface AttributeExtractionConfig {
  /**
   * Campos do request.body a extrair para attributes
   * Ex: ['category', 'status', 'priority']
   * Valores primitivos (string, number, boolean, arrays de primitivos) serão extraídos
   */
  requestBody?: string[];

  /**
   * Headers do request a extrair para attributes
   * Ex: ['x-user-id', 'x-correlation-id', 'x-tenant-id']
   * Headers são case-insensitive e serão normalizados (hífens viram pontos)
   */
  requestHeaders?: string[];

  /**
   * Campos do response.body a extrair para attributes
   * Ex: ['status', 'id', 'type']
   * Valores primitivos (string, number, boolean, arrays de primitivos) serão extraídos
   */
  responseBody?: string[];

  /**
   * Headers do response a extrair para attributes
   * Ex: ['x-request-id', 'x-trace-id']
   * Headers são case-insensitive e serão normalizados (hífens viram pontos)
   */
  responseHeaders?: string[];
}

/**
 * Configuração simplificada da SDK
 * Todas as configurações principais são capturadas via variáveis de ambiente MONITORIA_*
 * Esta interface permite apenas sobrescrever configurações específicas quando necessário
 */
export interface LoggerConfig {
  /**
   * Nome do serviço (sobrescreve MONITORIA_SERVICE_NAME)
   * Se não fornecido, usa a variável de ambiente
   */
  serviceName?: string;
  
  /**
   * Habilitar console logging (sobrescreve MONITORIA_ENABLE_CONSOLE)
   * Se não fornecido, usa a variável de ambiente
   */
  enableConsole?: boolean;
  
  /**
   * Nível mínimo de log (sobrescreve MONITORIA_LOG_LEVEL)
   * Se não fornecido, usa a variável de ambiente
   */
  minLogLevel?: LogLevel;

  /**
   * Campos a extrair para attributes (permite group by no SigNoz)
   * Configure via parâmetro no setupLogging()
   * Ex: { requestBody: ["category", "status"], requestHeaders: ["x-user-id"] }
   */
  extractAttributes?: AttributeExtractionConfig;
}

// Para NestJS - usar a mesma interface
export type NestLoggingConfig = LoggerConfig;
