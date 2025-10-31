// Conteúdo para: validations/medico.validation.ts

import { z } from 'zod';
import { paginationSchema } from './pagination.validation.js'; // Importa o schema de paginação

// Schema para o corpo (body) da requisição de CRIAÇÃO de médico
export const createMedicoSchema = z.object({
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
      .length(11, 'O CPF deve ter 11 dígitos'), // Ajuste o tamanho conforme necessidade

    // Dados para o model 'Medico'
    telefone: z
      .string({ message: 'O telefone é obrigatório' }),
    crm: z
      .string({ message: 'O CRM é obrigatório' }) // RB01 
      .min(4, 'CRM inválido'),
    duracao_minutos: z
      .number({ message: 'A duração deve ser um número' })
      .int()
      .positive('A duração deve ser positiva')
      .optional()
      .default(30), // RB03
  }),
});

// Schema para o corpo (body) da requisição de ATUALIZAÇÃO de médico
// Todos os campos são opcionais
export const updateMedicoSchema = z.object({
  body: z.object({
    // Dados do 'Usuario'
    email: z.string().email('O email fornecido não é válido').optional(),
    nome: z.string().optional(),
    
    // Dados do 'Medico'
    telefone: z.string().optional(),
    crm: z.string().min(4, 'CRM inválido').optional(),
    duracao_minutos: z.number().int().positive().optional(),
    ativo: z.boolean().optional(), // Para reativar um usuário
  }),
});

// Schema para a QUERY de 'listar médicos'
export const listMedicosSchema = z.object({
  query: paginationSchema.merge(z.object({ // Combina com paginação
    // Adicione filtros futuros aqui, ex:
    // nome: z.string().optional(),
    // crm: z.string().optional(),
  })),
});
