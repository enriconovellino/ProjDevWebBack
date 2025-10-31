// Conteúdo para: validations/pagination.validation.ts

import { z } from 'zod';

// Schema reutilizável para parâmetros de query de paginação
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1') // Padrão página 1
    .transform(Number)
    .pipe(z.number().int().positive('A página deve ser um número positivo')),
  limit: z
    .string()
    .optional()
    .default('10') // Padrão 10 itens por página
    .transform(Number)
    .pipe(z.number().int().positive('O limite deve ser um número positivo')),
});
