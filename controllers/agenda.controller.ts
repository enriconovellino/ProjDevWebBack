// Conteúdo para: controllers/agenda.controller.ts

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.util.js';
import logger from '../utils/logger.util.js';
import { Perfil, StatusSlot } from '@prisma/client';

/**
 * Controller para GERAR slots de agenda (POST /agenda/generate-slots)
 * Restrito ao Admin (RF04).
 */
export const createAgendaSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { medico_id, data_inicio, data_fim, hora_inicio, hora_fim } = req.body;

    // 1. Buscar o médico para obter a duração padrão da consulta
    const medico = await prisma.medico.findUnique({
      where: { id: medico_id },
    });
    if (!medico) {
      return res.status(404).json({ message: 'Médico não encontrado' });
    }
    const duracaoConsulta = medico.duracao_minutos; // (RB03)

    // 2. Parsear datas e horas
    const dtInicio = new Date(data_inicio);
    const dtFim = new Date(data_fim);
    const [inicioH, inicioM] = hora_inicio.split(':').map(Number);
    const [fimH, fimM] = hora_fim.split(':').map(Number);

    const slotsParaCriar = [];
    let dataAtual = new Date(dtInicio); // Começa no primeiro dia

    // 3. Loop pelos dias (de data_inicio até data_fim)
    while (dataAtual <= dtFim) {
      const diaDaSemana = dataAtual.getUTCDay(); // 0 = Domingo, 6 = Sábado

      // Pular fins de semana
      if (diaDaSemana !== 0 && diaDaSemana !== 6) {
        
        // Define o horário de início e fim para o diaAtual
        const slotInicioDia = new Date(dataAtual);
        slotInicioDia.setUTCHours(inicioH, inicioM, 0, 0);

        const slotFimDia = new Date(dataAtual);
        slotFimDia.setUTCHours(fimH, fimM, 0, 0);

        let slotAtual = new Date(slotInicioDia);

        // 4. Loop pelas horas (gera slots de X em X minutos)
        while (slotAtual < slotFimDia) {
          const slotFim = new Date(slotAtual.getTime() + duracaoConsulta * 60000);

          // Garante que o último slot não ultrapasse o fim do dia
          if (slotFim <= slotFimDia) {
            slotsParaCriar.push({
              medico_id: medico_id,
              inicio: new Date(slotAtual),
              fim: new Date(slotFim),
              status: StatusSlot.DISPONIVEL,
            });
          }
          slotAtual = new Date(slotFim); // Próximo slot começa onde o último terminou
        }
      }
      // Avança para o próximo dia
      dataAtual.setUTCDate(dataAtual.getUTCDate() + 1);
    }

    // 5. Insere todos os slots no banco de uma vez
    const resultado = await prisma.agendaSlot.createMany({
      data: slotsParaCriar,
      skipDuplicates: true, // Evita criar slots idênticos (medico_id + inicio)
    });

    logger.info(`Admin gerou ${resultado.count} novos slots para o médico ID ${medico_id}`);
    return res.status(201).json({ 
      message: `${resultado.count} slots criados com sucesso.`,
      count: resultado.count 
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Controller para LISTAR slots de agenda (GET /agenda)
 * Acessível por qualquer usuário autenticado (RF05).
 */
export const listAgendaSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Os dados foram validados e transformados pelo queryValidationMiddleware
    const { page, limit, medico_id, data_inicio, data_fim } = req.query as any;

    // Calcula o skip e take para paginação
    const skip = ((page as number) - 1) * (limit as number);
    const take = limit as number;

    const whereCondition: any = {
      medico_id: medico_id,
      inicio: {
        gte: new Date(data_inicio), // Maior ou igual (>=)
      },
      fim: {
        lte: new Date(data_fim), // Menor ou igual (<=)
      },
    };

    // Busca paralela: total de registros e dados da página
    const [totalItems, slots] = await Promise.all([
      prisma.agendaSlot.count({ where: whereCondition }),
      prisma.agendaSlot.findMany({
        where: whereCondition,
        include: {
          // (Fase 11) Inclui a consulta se o slot estiver 'OCUPADO'
          consulta: { 
            include: {
              paciente: {
                include: {
                  usuario: {
                    select: { nome: true }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          inicio: 'asc',
        },
        skip,
        take,
      }),
    ]);

    // Calcula metadados de paginação
    const totalPages = Math.ceil(totalItems / take);

    return res.status(200).json({
      data: slots,
      metadata: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: take,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller para BLOQUEAR/DESBLOQUEAR um slot (PATCH /agenda/:id/status)
 * Restrito ao Admin OU ao próprio Médico (RB07, RF10).
 */
export const updateSlotStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const slotId = parseInt(id, 10);
    const { status } = req.body as { status: StatusSlot };
    const user = req.user!; // Sabemos que o user existe (authMiddleware)

    // 1. Buscar o slot para verificar dono e status atual
    const slot = await prisma.agendaSlot.findUnique({
      where: { id: slotId },
      include: {
        medico: true, // Precisamos do médico para verificar a permissão
      },
    });

    if (!slot) {
      return res.status(404).json({ message: 'Slot de agenda não encontrado' });
    }

    // 2. Verificar Permissão (Admin ou o próprio Médico)
    const eAdmin = user.perfil === Perfil.ADMIN;
    const eProprioMedico = user.id === slot.medico.usuario_id;

    if (!eAdmin && !eProprioMedico) {
      logger.warn(`Autorização: Usuário ${user.email} tentou modificar slot ${slotId} de outro médico.`);
      return res.status(403).json({ message: 'Acesso negado. Você só pode modificar sua própria agenda.' });
    }

    // 3. Verificar Regra de Negócio (Não pode mexer em slot 'OCUPADO')
    if (slot.status === StatusSlot.OCUPADO) {
      return res.status(409).json({ // 409 Conflict
        message: 'Não é possível alterar o status de um slot que já possui uma consulta agendada.' 
      });
    }

    // 4. Atualizar o status
    const slotAtualizado = await prisma.agendaSlot.update({
      where: { id: slotId },
      data: {
        status: status, // (BLOQUEADO ou DISPONIVEL)
      },
    });

    logger.info(`Usuário ${user.email} atualizou slot ${slotId} para ${status}`);
    return res.status(200).json(slotAtualizado);

  } catch (error) {
    next(error);
  }
};
