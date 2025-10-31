// Conteúdo para: controllers/consulta.controller.ts

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.util.js';
import logger from '../utils/logger.util.js';
import { Perfil, StatusConsulta, StatusSlot } from '@prisma/client';

// Define a antecedência mínima para cancelamento (em horas)
const ANTECEDENCIA_MINIMA_HORAS = 24; // (RB06)

/**
 * Controller para AGENDAR uma nova Consulta (POST /consultas)
 * Restrito ao Paciente.
 */
export const createConsulta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agenda_slot_id } = req.body;
    const user = req.user!; // Perfil.PACIENTE (garantido pela rota)

    // 1. Encontrar o paciente logado
    const paciente = await prisma.paciente.findUnique({
      where: { usuario_id: user.id },
    });
    if (!paciente) {
      return res.status(404).json({ message: 'Perfil de paciente não encontrado para este usuário.' });
    }

    // 2. Iniciar transação para garantir atomicidade
    const novaConsulta = await prisma.$transaction(async (tx) => {
      // 3. Buscar o slot desejado COM LOCK (para evitar race condition)
      const slot = await tx.agendaSlot.findUnique({
        where: { id: agenda_slot_id },
        // Trava o registro para esta transação
        // Requer MySQL (InnoDB) ou PostgreSQL
        // Em SQLite, isso é simulado pelo Prisma
      });

      // 4. Validações de Regra de Negócio
      if (!slot) {
        throw new Error('Slot de agenda não encontrado'); // Causa rollback
      }
      if (slot.status !== StatusSlot.DISPONIVEL) {
        throw new Error('Este horário não está disponível'); // Causa rollback (RB04)
      }
      if (new Date(slot.inicio) < new Date()) {
        throw new Error('Não é permitido agendar no passado'); // Causa rollback (RB12)
      }

      // 5. Verificar conflito de horário para o paciente (RB05)
      const conflito = await tx.consulta.findFirst({
        where: {
          paciente_id: paciente.id,
          status: StatusConsulta.AGENDADA,
          agenda_slot: {
            inicio: slot.inicio, // Verifica se já tem consulta nesse mesmo horário
          },
        },
      });
      if (conflito) {
        throw new Error('Você já possui uma consulta agendada neste mesmo horário'); // Causa rollback (RB05)
      }

      // 6. Atualizar o slot
      await tx.agendaSlot.update({
        where: { id: agenda_slot_id },
        data: { status: StatusSlot.OCUPADO },
      });

      // 7. Criar a consulta
      const consulta = await tx.consulta.create({
        data: {
          paciente_id: paciente.id,
          medico_id: slot.medico_id,
          agenda_slot_id: agenda_slot_id,
          status: StatusConsulta.AGENDADA,
        },
        include: {
          agenda_slot: true,
          medico: { include: { usuario: { select: { nome: true } } } },
          paciente: { include: { usuario: { select: { nome: true } } } },
        }
      });

      return consulta;
    });

    logger.info(`Paciente ${user.email} agendou consulta ${novaConsulta.id} (Slot ${agenda_slot_id})`);
    return res.status(201).json(novaConsulta);

  } catch (error: any) {
    // Se o 'throw new Error' foi chamado dentro da transação
    if (error.message.includes('não está disponível') ||
        error.message.includes('não encontrado') ||
        error.message.includes('agendar no passado') ||
        error.message.includes('possui uma consulta agendada')) {
      logger.warn(`Agendamento: Falha na regra de negócio: ${error.message}`);
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    next(error);
  }
};

/**
 * Controller para LISTAR Consultas (GET /consultas)
 * Filtra baseado no perfil do usuário (RF07).
 */
export const listConsultas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { page, limit, medico_id, paciente_id, status, data_inicio, data_fim } = req.query as any;

    // Calcula o skip e take para paginação
    const skip = ((page as number) - 1) * (limit as number);
    const take = limit as number;

    const where: any = {
      status: status,
      agenda_slot: {
        inicio: data_inicio ? { gte: new Date(data_inicio) } : undefined,
        fim: data_fim ? { lte: new Date(data_fim) } : undefined,
      }
    };

    // 1. Filtrar por Perfil
    if (user.perfil === Perfil.ADMIN) {
      // Admin vê tudo, mas pode filtrar
      where.medico_id = medico_id ? Number(medico_id) : undefined;
      where.paciente_id = paciente_id ? Number(paciente_id) : undefined;
    } 
    else if (user.perfil === Perfil.MEDICO) {
      // Médico só vê as suas
      const medico = await prisma.medico.findUnique({ where: { usuario_id: user.id }});
      if (!medico) return res.status(404).json({ message: 'Perfil de médico não encontrado' });
      where.medico_id = medico.id;
      // Médico pode filtrar por um paciente específico (se fornecido)
      where.paciente_id = paciente_id ? Number(paciente_id) : undefined;
    } 
    else if (user.perfil === Perfil.PACIENTE) {
      // Paciente só vê as suas
      const paciente = await prisma.paciente.findUnique({ where: { usuario_id: user.id }});
      if (!paciente) return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      where.paciente_id = paciente.id;
      // Paciente pode filtrar por um médico específico (se fornecido)
      where.medico_id = medico_id ? Number(medico_id) : undefined;
    }

    // Busca paralela: total de registros e dados da página
    const [totalItems, consultas] = await Promise.all([
      prisma.consulta.count({ where }),
      prisma.consulta.findMany({
        where,
        include: {
          agenda_slot: true,
          medico: { include: { usuario: { select: { nome: true } } } },
          paciente: { include: { usuario: { select: { nome: true } } } },
        },
        orderBy: {
          agenda_slot: { inicio: 'asc' }
        },
        skip,
        take,
      }),
    ]);

    // Calcula metadados de paginação
    const totalPages = Math.ceil(totalItems / take);

    return res.status(200).json({
      data: consultas,
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
 * Controller para CANCELAR uma Consulta (PATCH /consultas/:id/cancel)
 * Restrito ao Admin ou Paciente dono da consulta (RF08).
 */
export const cancelConsulta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const consultaId = parseInt(id, 10);
    const user = req.user!;

    // 1. Buscar a consulta e seu slot associado
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
      include: {
        agenda_slot: true,
        paciente: true,
      },
    });

    if (!consulta) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    // 2. Verificar Permissão (Admin ou Paciente dono)
    const eAdmin = user.perfil === Perfil.ADMIN;
    const ePacienteDono = user.id === consulta.paciente.usuario_id;

    if (!eAdmin && !ePacienteDono) {
      logger.warn(`Cancelamento: Usuário ${user.email} tentou cancelar consulta ${consultaId} de outro paciente.`);
      return res.status(403).json({ message: 'Acesso negado. Você só pode cancelar suas próprias consultas.' });
    }

    // 3. Verificar Regra de Negócio (Status)
    if (consulta.status !== StatusConsulta.AGENDADA) {
      return res.status(409).json({ message: `Não é possível cancelar uma consulta que está ${consulta.status}` });
    }

    // 4. Verificar Regra de Negócio (Antecedência Mínima - RB06)
    // (Admin pode cancelar a qualquer momento, Paciente não)
    if (ePacienteDono && !eAdmin) {
      const agora = new Date();
      const inicioConsulta = new Date(consulta.agenda_slot.inicio);
      const diffMs = inicioConsulta.getTime() - agora.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      if (diffHoras < ANTECEDENCIA_MINIMA_HORAS) {
        logger.warn(`Cancelamento: Paciente ${user.email} tentou cancelar consulta ${consultaId} fora da antecedência.`);
        return res.status(403).json({ 
          message: `Cancelamento fora do prazo. Consultas só podem ser canceladas com ${ANTECEDENCIA_MINIMA_HORAS} horas de antecedência.` 
        });
      }
    }
    
    // 5. Iniciar transação para cancelar
    const consultaCancelada = await prisma.$transaction(async (tx) => {
      // Atualiza o slot para DISPONIVEL
      await tx.agendaSlot.update({
        where: { id: consulta.agenda_slot_id },
        data: { status: StatusSlot.DISPONIVEL },
      });

      // Atualiza a consulta para CANCELADA
      const consultaAtualizada = await tx.consulta.update({
        where: { id: consultaId },
        data: { status: StatusConsulta.CANCELADA },
      });

      return consultaAtualizada;
    });

    logger.info(`Usuário ${user.email} cancelou consulta ${consultaId}`);
    return res.status(200).json(consultaCancelada);

  } catch (error) {
    next(error);
  }
};

/**
 * Controller para ATUALIZAR STATUS (REALIZADA) (PATCH /consultas/:id/status)
 * Restrito ao Admin ou Médico dono da consulta (RB09).
 */
export const updateConsultaStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const consultaId = parseInt(id, 10);
    const { status } = req.body as { status: StatusConsulta };
    const user = req.user!;

    // 1. Buscar a consulta
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
      include: {
        medico: true,
      },
    });
    if (!consulta) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    // 2. Verificar Permissão (Admin ou Médico dono)
    const eAdmin = user.perfil === Perfil.ADMIN;
    const eMedicoDono = user.id === consulta.medico.usuario_id;

    if (!eAdmin && !eMedicoDono) {
      logger.warn(`Update Status: Usuário ${user.email} tentou mudar status da consulta ${consultaId} de outro médico.`);
      return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar suas próprias consultas.' });
    }
    
    // 3. Atualizar consulta
    const consultaAtualizada = await prisma.consulta.update({
      where: { id: consultaId },
      data: { status: status }, // REALIZADA ou CANCELADA
    });
    
    // 4. Se a consulta foi REALIZADA, o slot permanece OCUPADO.
    // Se um Admin/Médico cancelou (status=CANCELADA), liberamos o slot.
    if (status === StatusConsulta.CANCELADA) {
      await prisma.agendaSlot.update({
        where: { id: consulta.agenda_slot_id },
        data: { status: StatusSlot.DISPONIVEL },
      });
    }

    logger.info(`Usuário ${user.email} atualizou status da consulta ${consultaId} para ${status}`);
    return res.status(200).json(consultaAtualizada);

  } catch (error) {
    next(error);
  }
};
