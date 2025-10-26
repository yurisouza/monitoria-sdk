/**
 * Exemplo Básico de Uso do Logger
 * 
 * Este exemplo demonstra como usar o logger em qualquer parte do código
 * usando o padrão singleton com getLogger()
 */

import { getLogger } from '@psouza.yuri/monitoria-sdk';

// 1. Uso Básico em um Service
export class UserService {
  private readonly logger = getLogger();

  async createUser(userData: any) {
    // Log de início
    this.logger.info('Criando novo usuário', {
      request: {
        email: userData.email,
        name: userData.name,
      }
    });

    try {
      // Simular criação
      const user = await this.saveToDatabase(userData);
      
      // Log de sucesso
      this.logger.info('Usuário criado com sucesso', {
        response: {
          userId: user.id,
        }
      });

      return user;
    } catch (error) {
      // Log de erro
      this.logger.error('Erro ao criar usuário', {
        error: {
          message: error.message,
          stack: error.stack,
        }
      });
      throw error;
    }
  }

  private async saveToDatabase(data: any) {
    // Simular operação
    return { id: '123', ...data };
  }
}

// 2. Uso em um Controller
export class UsersController {
  private readonly logger = getLogger();

  async getAllUsers() {
    this.logger.debug('GET /users - Buscando todos os usuários');
    
    // Sua lógica aqui
    return [];
  }

  async getUserById(id: string) {
    this.logger.info('GET /users/:id - Buscando usuário específico', {
      request: {
        userId: id,
      }
    });
    
    // Sua lógica aqui
    return { id };
  }
}

// 3. Uso em um Middleware
export class AuthMiddleware {
  private readonly logger = getLogger();

  async authenticate(req: any) {
    this.logger.debug('Verificando autenticação', {
      request: {
        path: req.path,
        method: req.method,
      }
    });

    // Sua lógica de autenticação
    return true;
  }
}

// 4. Uso Direto (sem classe)
export function someUtilityFunction() {
  const logger = getLogger();

  logger.info('Executando função utilitária', {
    context: {
      timestamp: new Date().toISOString(),
      processId: process.pid,
    }
  });
}

