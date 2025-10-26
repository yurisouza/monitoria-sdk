import { LoggingInterceptor } from './logging.interceptor';
import { LoggerConfig } from '../../types';

/**
 * Configura o logging para aplicações NestJS
 * Usa APENAS configurações de ambiente MONITORIA_*
 * 
 * @param app - Instância da aplicação NestJS
 * @param config - Configuração opcional para sobrescrever ENV vars (apenas serviceName e enableConsole)
 */
export function setupLogging(app: any, config: LoggerConfig = {}): void {
  try {
   
    // Validação básica do app
    if (!app || typeof app.useGlobalInterceptors !== 'function') {
      console.log('❌ App inválido ou sem useGlobalInterceptors');
      return;
    }

    // Carregar configurações das variáveis de ambiente
    const serviceName = process.env.MONITORIA_SERVICE_NAME || 'unknown-service';
    const serviceVersion = process.env.MONITORIA_SERVICE_VERSION || '1.0.0';
    const environment = process.env.MONITORIA_ENVIRONMENT || 'development';
    const collectorEndpoint = process.env.MONITORIA_COLLECTOR_ENDPOINT || 'http://localhost:4318';
    const logLevel = process.env.MONITORIA_LOG_LEVEL || 'info';
    const enableConsole = process.env.MONITORIA_ENABLE_CONSOLE !== 'false';
    const enableTracing = process.env.MONITORIA_ENABLE_TRACING !== 'false';
    const enableLogs = process.env.MONITORIA_ENABLE_LOGS !== 'false';
    const enableMetrics = process.env.MONITORIA_ENABLE_METRICS !== 'false';

    // Apenas sobrescrever se fornecido no config
    const finalConfig = {
      serviceName: config.serviceName || serviceName,
      serviceVersion,
      environment,
      collectorEndpoint,
      logLevel,
      enableConsole: config.enableConsole !== undefined ? config.enableConsole : enableConsole,
      enableTracing,
      enableLogs,
      enableMetrics,
    };

    console.log('✅ Configuração válida, registrando interceptor');
    console.log(`📊 Service: ${finalConfig.serviceName}@${finalConfig.serviceVersion}`);
    console.log(`🔗 Collector: ${finalConfig.collectorEndpoint}`);
    console.log(`🌍 Environment: ${finalConfig.environment}`);
    console.log(`🖥️ Console: ${finalConfig.enableConsole}`);
    console.log(`📝 Logs: ${finalConfig.enableLogs}`);
    console.log(`🔍 Tracing: ${finalConfig.enableTracing}`);
    console.log(`📈 Metrics: ${finalConfig.enableMetrics}`);
    
    // Registrar interceptor globalmente
    const interceptor = new LoggingInterceptor(finalConfig);
    app.useGlobalInterceptors(interceptor);
    
    console.log('✅ Interceptor de logging registrado com sucesso');
  } catch (error) {
    console.log('❌ Erro ao configurar logging:', error);
    // Não quebra a aplicação, apenas ignora o logging
  }
}