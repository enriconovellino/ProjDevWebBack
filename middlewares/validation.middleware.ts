// Conteúdo para: middlewares/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../utils/logger.util.js';

/**
 * Factory function que cria um middleware de validação do Zod.
 * Valida o req.body contra o schema fornecido.
 */
export const validationMiddleware = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Tenta validar o body da requisição
      schema.parse(req.body);
      // Sucesso, pode continuar
      next();
    } catch (error: any) {
      // Se for um erro de validação do Zod
      if (error instanceof ZodError) {
        logger.warn(error, 'Validação: Dados de entrada inválidos');
        // Formata os erros para serem mais amigáveis
        const errosFormatados = error.issues.map((err: any) => ({
          campo: err.path.join('.'),
          mensagem: err.message,
        }));
        
        return res.status(400).json({ 
          message: 'Dados de entrada inválidos', 
          errors: errosFormatados 
        });
      }

      // Se for outro tipo de erro
      logger.error(error, 'Validação: Erro inesperado no middleware');
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  };
};
