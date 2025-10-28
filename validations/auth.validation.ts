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

// Schema para o corpo (body) da requisição de registro de paciente
export const registerSchema = z.object({
  body: z.object({
    // Dados para o model 'Usuario'
    email: z
      .string({ message: 'O email é obrigatório' })
      .email('O email fornecido não é válido'),
    senha: z
      .string({ message: 'A senha é obrigatória' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres'),
    nome: z
      .string({ message: 'O nome é obrigatório' }),
    cpf: z
      .string({ message: 'O CPF é obrigatório' })
      .length(11, 'O CPF deve ter 11 dígitos'),

    // Dados para o model 'Paciente'
    telefone: z
      .string({ message: 'O telefone é obrigatório' }),
    data_nascimento: z
      .string({ message: 'A data de nascimento é obrigatória' })
      .datetime('A data de nascimento deve estar no formato ISO 8601 (ex: YYYY-MM-DDTHH:MM:SSZ)'),
  }),
});
