// Conteúdo para: controllers/paciente.controller.ts

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.util.js';
import logger from '../utils/logger.util.js';
import { Perfil } from '@prisma/client';

/**
 * Verifica se o usuário logado tem permissão (Admin ou é o próprio usuário).
 * Retorna true se permitido, ou envia resposta 403/404 e retorna false.
 */
async function checkPermission(
  req: Request,
  res: Response,
  pacienteId: number
): Promise<boolean> {
  const user = req.user!; // Sabemos que o user existe (authMiddleware)

  // 1. Busca o paciente para obter o 'usuario_id' associado
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
  });

  if (!paciente) {
    res.status(404).json({ message: 'Paciente não encontrado' });
    return false;
  }

  // 2. Verifica a permissão
  // Permitido se: for Admin OU o ID do usuário no token for igual ao 'usuario_id' do paciente
  if (user.perfil === Perfil.ADMIN || user.id === paciente.usuario_id) {
    return true;
  }

  // 3. Se não for nenhum dos dois, acesso negado
  logger.warn(`Autorização: Usuário ${user.email} tentou acessar dados do paciente ID ${pacienteId}`);
  res.status(403).json({ message: 'Acesso negado.' });
  return false;
}

/**
 * Controller para listar todos os Pacientes (GET /pacientes)
 * Restrito ao Admin.
 */
export const listPacientes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      where: {
        usuario: {
          ativo: true,
        },
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true }
        }
      },
      orderBy: {
        usuario: { nome: 'asc' }
      }
    });

    return res.status(200).json(pacientes);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller para buscar um Paciente por ID (GET /pacientes/:id)
 * Restrito ao Admin OU ao próprio paciente.
 */
export const getPacienteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pacienteId = parseInt(id, 10);

    // 1. Verifica a permissão
    const hasPermission = await checkPermission(req, res, pacienteId);
    if (!hasPermission) return; // Resposta 403/404 já enviada

    // 2. Busca os dados (checkPermission já buscou, mas buscamos de novo com 'include')
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true }
        }
      },
    });
    
    return res.status(200).json(paciente);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller para atualizar um Paciente (PUT /pacientes/:id)
 * Restrito ao Admin OU ao próprio paciente.
 */
export const updatePaciente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pacienteId = parseInt(id, 10);
    const { email, nome, telefone, data_nascimento, ativo } = req.body;

    // 1. Verifica a permissão
    const hasPermission = await checkPermission(req, res, pacienteId);
    if (!hasPermission) return;

    // 2. Pega o ID do usuário associado (já verificado em checkPermission)
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    const usuarioId = paciente!.usuario_id;
    
    // 3. Atualiza em uma transação
    const pacienteAtualizado = await prisma.$transaction(async (tx) => {
      // Atualiza o 'Usuario'
      const usuarioAtualizado = await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          email: email,
          nome: nome,
          // Apenas Admin pode reativar um usuário
          ativo: req.user?.perfil === Perfil.ADMIN ? ativo : undefined,
        },
      });

      // Atualiza o 'Paciente'
      const pacienteAtualizado = await tx.paciente.update({
        where: { id: pacienteId },
        data: {
          telefone: telefone,
          data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
        },
      });

      return { ...pacienteAtualizado, usuario: usuarioAtualizado };
    });

    const { usuario: { senha_hash: _, ...usuarioSemSenha }, ...pacienteAtual } = pacienteAtualizado;

    logger.info(`Usuário ${req.user?.email} atualizou paciente ID: ${pacienteId}`);
    return res.status(200).json({ ...pacienteAtual, usuario: usuarioSemSenha });

  } catch (error) {
    next(error);
  }
};

/**
 * Controller para "deletar" um Paciente (DELETE /pacientes/:id)
 * Restrito ao Admin OU ao próprio paciente (Soft Delete).
 */
export const deletePaciente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pacienteId = parseInt(id, 10);

    // 1. Verifica a permissão
    const hasPermission = await checkPermission(req, res, pacienteId);
    if (!hasPermission) return;
    
    // 2. Pega o ID do usuário associado
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    const usuarioId = paciente!.usuario_id;

    // 3. Executa o Soft Delete (desativa o usuário)
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ativo: false,
      },
    });

    logger.info(`Usuário ${req.user?.email} desativou (soft delete) paciente ID: ${pacienteId}`);
    return res.status(204).send(); // 204 No Content

  } catch (error) {
    next(error);
  }
};
