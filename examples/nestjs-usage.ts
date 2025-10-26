/**
 * Exemplo Completo de Uso do Logger em NestJS
 * 
 * Demonstra o uso do logger em Services, Controllers, Guards e Interceptors
 */

import { Injectable, Controller, Get, Post, Body, UseGuards, ExecutionContext, CanActivate } from '@nestjs/common';
import { getLogger } from '@psouza.yuri/monitoria-sdk';
import { trace } from '@opentelemetry/api';

// 1. Service com Logger
@Injectable()
export class TodoService {
  private readonly logger = getLogger();

  async create(createTodoDto: any) {
    // Obter contexto do trace atual
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    // Log com contexto de trace para correlacionar
    this.logger.info('Criando novo todo', {
      request: {
        title: createTodoDto.title,
        category: createTodoDto.category,
      },
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
    });

    try {
      // Simular criação no banco
      const result = await this.saveToDatabase(createTodoDto);
      
      this.logger.info('Todo criado com sucesso', {
        response: {
          id: result.id,
        }
      });

      return result;
    } catch (error) {
      this.logger.error('Erro ao criar todo', {
        error: {
          message: error.message,
          code: error.code,
        }
      });
      throw error;
    }
  }

  private async saveToDatabase(data: any) {
    return { id: 'todo-123', ...data, createdAt: new Date() };
  }
}

// 2. Controller com Logger
@Controller('todos')
export class TodosController {
  private readonly logger = getLogger();

  constructor(private readonly todoService: TodoService) {}

  @Post()
  async create(@Body() createTodoDto: any) {
    this.logger.info('POST /todos - Recebendo requisição', {
      request: {
        body: createTodoDto,
      }
    });

    return this.todoService.create(createTodoDto);
  }

  @Get()
  async findAll() {
    this.logger.debug('GET /todos - Buscando todos os todos');
    return this.todoService.findAll();
  }

  @Get(':id')
  async findOne(id: string) {
    this.logger.info('GET /todos/:id - Buscando todo específico', {
      request: {
        id,
      }
    });

    return this.todoService.findOne(id);
  }
}

// 3. Guard com Logger
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = getLogger();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    this.logger.debug('Verificando autenticação', {
      request: {
        path: request.url,
        method: request.method,
      }
    });

    // Sua lógica de autenticação
    const token = request.headers.authorization;
    
    if (!token) {
      this.logger.warn('Token não fornecido', {
        request: {
          path: request.url,
        }
      });
      return false;
    }

    this.logger.debug('Autenticação bem-sucedida');
    return true;
  }
}

// 4. Exemplo de uso em um módulo
export const TODOS_MODULE_EXAMPLE = {
  controllers: [TodosController],
  providers: [TodoService, AuthGuard],
};

/**
 * Como usar no main.ts:
 * 
 * import '@psouza.yuri/monitoria-sdk/telemetry';
 * import { setupLogging } from '@psouza.yuri/monitoria-sdk';
 * import { NestFactory } from '@nestjs/core';
 * 
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   setupLogging(app);
 *   await app.listen(3000);
 * }
 * 
 * bootstrap();
 */

