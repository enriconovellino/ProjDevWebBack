// Conteúdo para: validations/consulta.validation.ts

import { z } from 'zod';
import { StatusConsulta } from '@prisma/client';

// Schema para o BODY de 'criar consulta' (agendamento)
export const createConsultaSchema = z.object({
  body: z.object({
    // O ID do slot que o paciente está tentando agendar
    agenda_slot_id: z.number().int().positive('O ID do slot da agenda é obrigatório'),
  }),
});

// Schema para a QUERY de 'listar consultas'
export const listConsultaSchema = z.object({
  query: z.object({
    // Filtros opcionais
    medico_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    paciente_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    status: z.enum([StatusConsulta.AGENDADA, StatusConsulta.CANCELADA, StatusConsulta.REALIZADA]).optional(),
    data_inicio: z.string().datetime('Data de início inválida (ISO 8601)').optional(),
    data_fim: z.string().datetime('Data de fim inválida (ISO 8601)').optional(),
  }),
});

// Schema para o BODY de 'atualizar status' (pelo Admin/Medico)
export const updateConsultaStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      [StatusConsulta.REALIZADA, StatusConsulta.CANCELADA], // Status que um Admin/Medico pode forçar
      { message: 'O status deve ser REALIZADA ou CANCELADA' }
    ),
  }),
});
