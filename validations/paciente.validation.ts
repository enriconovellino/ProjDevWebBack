// Conteúdo para: validations/paciente.validation.ts

import { z } from 'zod';

// Schema para o corpo (body) da requisição de ATUALIZAÇÃO de paciente
// Todos os campos são opcionais
export const updatePacienteSchema = z.object({
  body: z.object({
    // Dados do 'Usuario'
    email: z.string().email('O email fornecido não é válido').optional(),
    nome: z.string().optional(),
    
    // Dados do 'Paciente'
    telefone: z.string().optional(),
    data_nascimento: z.string().datetime().optional(),
    ativo: z.boolean().optional(), // Para Admin reativar
  }),
});
