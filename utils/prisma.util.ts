// Conteúdo para: utils/prisma.util.ts

import { PrismaClient } from '@prisma/client';

// Declara uma variável global para o Prisma Client
declare global {
  var prisma: PrismaClient | undefined;
}

// Cria a instância do Prisma Client
// Ativa os logs de query se estiver em ambiente de desenvolvimento
const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

// Se não estiver em produção, armazena a instância no globalThis
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
