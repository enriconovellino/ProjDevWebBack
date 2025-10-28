// Conteúdo para: middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util.js';
import logger from '../utils/logger.util.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Obter o header de autorização
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Auth: Header de autorização ausente');
      return res.status(401).json({ message: 'Header de autorização ausente' });
    }

    // 2. Verificar se o formato é "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Auth: Token mal formatado');
      return res.status(401).json({ message: 'Token mal formatado' });
    }
    const token = parts[1];

    // 3. Verificar o token
    const payload = verifyToken(token) as JwtPayload;

    // 4. Anexar o payload ao request
    req.user = payload;
    
    // 5. Passar para o próximo middleware
    next();
  } catch (error: any) {
    // Se verifyToken falhar (expirado, inválido)
    logger.error(error, 'Auth: Token inválido ou expirado');
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
