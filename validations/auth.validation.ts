// Conteúdo para: validations/auth.validation.ts

import { z } from 'zod';

// Schema para o corpo (body) da requisição de login
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'O email é obrigatório' })
      .email('O email fornecido não é válido'),
    senha: z
      .string({ message: 'A senha é obrigatória' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres'),
  }),
});
