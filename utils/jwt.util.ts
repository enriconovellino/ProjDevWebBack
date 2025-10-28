// Conteúdo para: utils/jwt.util.ts

import jwt from 'jsonwebtoken';
import { Perfil } from '@prisma/client'; // Importa o Enum 'Perfil' do Prisma

// 1. Define a Interface do Payload do Token
export interface JwtPayload {
  id: number;
  email: string;
  perfil: Perfil; // Usa o Enum 'Perfil' (ADMIN, MEDICO, PACIENTE)
}

// 2. Busca o Segredo do JWT do .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Variável de ambiente JWT_SECRET não definida.');
}

// 3. Função para Gerar o Token
/**
 * Gera um token JWT com expiração de 7 dias.
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expira em 7 dias
  });
};

// 4. Função para Verificar o Token
/**
 * Verifica um token JWT. Retorna o payload decodificado ou lança um erro.
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    // A função 'verify' decodifica e verifica a assinatura
    // Ela retorna o payload (como string ou objeto)
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fazemos um type-check para garantir que é o nosso payload
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      return decoded as JwtPayload;
    }
    
    throw new Error('Token JWT com payload inválido');
  } catch (error) {
    // Lança um erro se o token for inválido, expirado, etc.
    throw new Error('Token JWT inválido ou expirado');
  }
};
