// Conteúdo para: middlewares/authorization.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { Perfil } from '@prisma/client';
import logger from '../utils/logger.util.js';

/**
 * Factory function que cria um middleware de autorização.
 * Verifica se o perfil do usuário logado está na lista de perfis permitidos.
 * DEVE ser usado após o authMiddleware.
 */
export const authorizationMiddleware = (perfisPermitidos: Perfil[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    // Pega o usuário do request (anexado pelo authMiddleware)
    const user = req.user;

    // Se não houver usuário (authMiddleware falhou ou esqueceu de usar)
    if (!user) {
      logger.error('Autorização: Middleware de autenticação não foi usado antes da autorização.');
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    // Verifica se o perfil do usuário está na lista permitida
    if (perfisPermitidos.includes(user.perfil)) {
      // Usuário autorizado, pode continuar
      next();
    } else {
      // Usuário não autorizado
      logger.warn(`Autorização: Usuário ${user.email} (Perfil: ${user.perfil}) tentou acessar rota restrita para [${perfisPermitidos.join(', ')}]`);
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para este recurso.' });
    }
  };
};
