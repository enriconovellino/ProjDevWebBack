// Conteúdo para: validations/agenda.validation.ts

import { z } from 'zod';
import { StatusSlot } from '@prisma/client';

// Regex para "HH:MM"
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

// Schema para o BODY de 'gerar slots'
export const generateSlotsSchema = z.object({
  body: z.object({
    medico_id: z.number().int().positive(),
    data_inicio: z.string().datetime('Formato de data inválido (ISO 8601)'),
    data_fim: z.string().datetime('Formato de data inválido (ISO 8601)'),
    hora_inicio: z.string().regex(timeRegex, 'Formato de hora inválido (HH:MM)'), // ex: "08:00"
    hora_fim: z.string().regex(timeRegex, 'Formato de hora inválido (HH:MM)'),   // ex: "18:00"
  }),
});

// Schema para a QUERY de 'listar slots'
export const listAgendaSchema = z.object({
  query: z.object({
    medico_id: z.string().transform(Number).pipe(z.number().int().positive()), // Converte string para number
    data_inicio: z.string().datetime('Data de início inválida (ISO 8601)'),
    data_fim: z.string().datetime('Data de fim inválida (ISO 8601)'),
  }),
});

// Schema para o BODY de 'atualizar status' (bloquear/desbloquear)
export const updateSlotStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      [StatusSlot.BLOQUEADO, StatusSlot.DISPONIVEL], 
      { message: 'O status deve ser BLOQUEADO ou DISPONIVEL' }
    ),
  }),
});
