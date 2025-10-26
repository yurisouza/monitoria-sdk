/**
 * Arquivo de inicialização automática do OpenTelemetry
 * Este arquivo é importado diretamente no main.ts das aplicações
 * 
 * Configurações via variáveis de ambiente:
 * - MONITORIA_SERVICE_NAME: Nome do serviço (obrigatório)
 * - MONITORIA_SERVICE_VERSION: Versão do serviço (padrão: 1.0.0)
 * - MONITORIA_ENVIRONMENT: Ambiente (padrão: development)
 * - MONITORIA_COLLECTOR_ENDPOINT: Endpoint do collector (obrigatório)
 * - MONITORIA_ENABLE_TRACING: Habilitar tracing (padrão: true)
 * - MONITORIA_ENABLE_METRICS: Habilitar métricas (padrão: true)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

let sdk: NodeSDK | undefined;

/**
 * Inicializa o OpenTelemetry SDK usando configurações de ambiente
 */
function initializeTelemetry(): void {
  if (sdk) {
    console.log('⚠️ OpenTelemetry SDK já está inicializado. Ignorando nova inicialização.');
    return;
  }

  try {
    // Carregar configurações das variáveis de ambiente
    const serviceName = process.env.MONITORIA_SERVICE_NAME || 'unknown-service';
    const serviceVersion = process.env.MONITORIA_SERVICE_VERSION || '1.0.0';
    const environment = process.env.MONITORIA_ENVIRONMENT || 'local';
    const collectorEndpoint = process.env.MONITORIA_COLLECTOR_ENDPOINT || 'http://localhost:4318';
    const enableTracing = process.env.MONITORIA_ENABLE_TRACING !== 'false';
    const enableMetrics = process.env.MONITORIA_ENABLE_METRICS !== 'false';

    // Verificar se as configurações obrigatórias estão presentes
    const missingConfigs: string[] = [];
    
    if (serviceName === 'unknown-service' || !process.env.MONITORIA_SERVICE_NAME) {
      missingConfigs.push('MONITORIA_SERVICE_NAME');
    }
    
    if (!collectorEndpoint || !process.env.MONITORIA_COLLECTOR_ENDPOINT) {
      missingConfigs.push('MONITORIA_COLLECTOR_ENDPOINT');
    }

    if (missingConfigs.length > 0) {
      console.warn('');
      console.warn('⚠️  ═══════════════════════════════════════════════════════════');
      console.warn('⚠️  Monitoria SDK não inicializada - Variáveis de ambiente ausentes:');
      missingConfigs.forEach(config => {
        console.warn(`⚠️   - ${config}`);
      });
      console.warn('⚠️   A SDK funcionará em modo degradado (apenas logs no console)');
      console.warn('⚠️   Configure as variáveis acima para habilitar todos os recursos');
      console.warn('⚠️  ═══════════════════════════════════════════════════════════');
      console.warn('');
      return;
    }

    // Exibir configurações carregadas
    console.log('🔧 Configurações Monitoria SDK:');
    console.log(`   📊 Service: ${serviceName}@${serviceVersion}`);
    console.log(`   🌍 Environment: ${environment}`);
    console.log(`   🔗 Collector: ${collectorEndpoint}`);
    console.log(`   🔍 Tracing: ${enableTracing ? '✅' : '❌'}`);
    console.log(`   📈 Metrics: ${enableMetrics ? '✅' : '❌'}`);

    // Configurar variáveis de ambiente do OpenTelemetry
    process.env.OTEL_SERVICE_NAME = serviceName;
    process.env.OTEL_SERVICE_VERSION = serviceVersion;
    process.env.OTEL_DEPLOYMENT_ENVIRONMENT = environment;

    // Configuração do SDK - SIMPLIFICADA (igual ao api-todolist)
    const sdkConfig: any = {
      // Configurar traces
      traceExporter: new OTLPTraceExporter({
        url: `${collectorEndpoint}/v1/traces`,
      }),
      
      // Configurar métricas
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${collectorEndpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 10000, // 10 segundos
      }),
      
      // Instrumentações automáticas - configuração mínima
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-express': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-net': {
            enabled: false,
          },
          '@opentelemetry/instrumentation-dns': {
            enabled: false,
          },
        }),
      ],
    };
    
    sdk = new NodeSDK(sdkConfig);
    sdk.start();
    
  } catch (error: any) {
    console.error('❌ Erro ao inicializar OpenTelemetry SDK:', error);
    // Não quebra a aplicação, apenas ignora a telemetria
  }
}

// Inicializar automaticamente quando o módulo for importado
initializeTelemetry();

// Exportar para compatibilidade
export { sdk };
