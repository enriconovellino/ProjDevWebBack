// Conteúdo para: controllers/especialidade.controller.ts

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.util.js';
import logger from '../utils/logger.util.js';

/**
 * Controller para criar uma nova Especialidade (POST /especialidades)
 * Restrito ao Admin.
 */
export const createEspecialidade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, codigo } = req.body;

    const novaEspecialidade = await prisma.especialidade.create({
      data: {
        nome,
        codigo,
        ativo: true,
      },
    });

    logger.info(`Admin criou nova especialidade: ${nome} (${codigo})`);
    return res.status(201).json(novaEspecialidade);

  } catch (error) {
    next(error); // errorHandler tratará P2002 (nome/codigo duplicado)
  }
};

/**
 * Controller para listar todas as Especialidades ATIVAS (GET /especialidades)
 * Acessível por qualquer usuário autenticado.
 */
export const listEspecialidades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const especialidades = await prisma.especialidade.findMany({
      where: {
        ativo: true, // Lista apenas as ativas
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return res.status(200).json(especialidades);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller para atualizar uma Especialidade (PUT /especialidades/:id)
 * (Usado para atualizar nome, código ou ATIVAR/DESATIVAR)
 * Restrito ao Admin.
 */
export const updateEspecialidade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const especialidadeId = parseInt(id, 10);
    const { nome, codigo, ativo } = req.body;

    const especialidade = await prisma.especialidade.update({
      where: { id: especialidadeId },
      data: {
        nome,
        codigo,
        ativo,
      },
    });

    logger.info(`Admin atualizou especialidade ID: ${especialidadeId}`);
    return res.status(200).json(especialidade);

  } catch (error) {
    next(error);
  }
};
