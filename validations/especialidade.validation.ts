// Conteúdo para: validations/especialidade.validation.ts

import { z } from 'zod';

export const createEspecialidadeSchema = z.object({
  body: z.object({
    nome: z
      .string({ message: 'O nome é obrigatório' }),
    codigo: z
      .string({ message: 'O código é obrigatório' })
      .length(4, 'O código deve ter 4 caracteres') // Ex: CARD, DERM
      .transform(val => val.toUpperCase()), // Converte para maiúsculo
  }),
});

export const updateEspecialidadeSchema = z.object({
  body: z.object({
    nome: z.string().optional(),
    codigo: z.string().length(4, 'O código deve ter 4 caracteres').optional().transform(val => val?.toUpperCase()),
    ativo: z.boolean().optional(), // Para ativar/desativar
  }),
});

export const linkEspecialidadeSchema = z.object({
  body: z.object({
    especialidade_id: z
      .number({ message: 'O especialidade_id é obrigatório' })
      .int()
      .positive('ID inválido'),
  }),
});
