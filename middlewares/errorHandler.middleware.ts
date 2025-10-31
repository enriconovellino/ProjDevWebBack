// Conteúdo para: middlewares/errorHandler.middleware.ts

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Middleware global de tratamento de erros.
 * DEVE ser o último middleware a ser registrado no app Express.
 */
export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // next é necessário para o Express reconhecê-lo como error handler
) => {
  logger.error(err, `Erro não tratado na rota: ${req.method} ${req.path}`);

  // Erros de Validação do Zod (embora o validationMiddleware deva pegar)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Erro de validação',
      errors: err.issues.map((e: any) => ({ path: e.path, message: e.message })),
    });
  }
  
  // Erros conhecidos do Prisma (ex: violação de constraint unique)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') { // Unique constraint failed
      const target = err.meta?.target;
      const campo = Array.isArray(target) ? target.join(', ') : (typeof target === 'string' ? target : 'desconhecido');
      return res.status(409).json({ // 409 Conflict
        message: 'Conflito de dados. Já existe um registro com este valor.',
        campo: campo,
      });
    }

    if (err.code === 'P2025') { // Record not found (update/delete)
      return res.status(404).json({
        message: 'Registro não encontrado.',
      });
    }
  }

  // Erros genéricos
  // Não vazar detalhes do erro em produção
  const mensagemErro = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Ocorreu um erro interno no servidor.';

  return res.status(500).json({ message: mensagemErro });
};
