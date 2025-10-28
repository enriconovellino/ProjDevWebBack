// Conteúdo para: controllers/medico.controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.util.js';
import logger from '../utils/logger.util.js';

/**
 * Controller para criar um novo Médico (POST /medicos)
 * Restrito ao Admin.
 */
export const createMedico = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, senha, nome, cpf, telefone, crm, duracao_minutos } = req.body;

    // 1. Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    // 2. Usar transação para criar Usuário e Médico
    // (Garante que ou ambos são criados, ou nenhum é)
    const novoMedico = await prisma.$transaction(async (tx) => {
      // Cria o Usuário
      const usuario = await tx.usuario.create({
        data: {
          email,
          senha_hash,
          nome,
          cpf,
          perfil: 'MEDICO', // Define o perfil
          ativo: true,
        },
      });

      // Cria o Médico, linkando com o usuário recém-criado
      const medico = await tx.medico.create({
        data: {
          telefone,
          crm,
          duracao_minutos,
          usuario_id: usuario.id, // Link 1:1
          nome: nome, // O diagrama pede 'medicos' (nome), vamos usar 'nome'
        },
      });

      // Retorna o médico completo (com dados do usuário)
      return { ...medico, usuario };
    });

    // Remove a senha antes de retornar
    const { usuario: { senha_hash: _, ...usuarioSemSenha }, ...medico } = novoMedico;

    logger.info(`Admin criou novo médico: ${email} (CRM: ${crm})`);
    return res.status(201).json({ ...medico, usuario: usuarioSemSenha });

  } catch (error) {
    next(error); // Passa para o errorHandler (que tratará P2002 - email/cpf/crm duplicado)
  }
};

/**
 * Controller para listar todos os Médicos (GET /medicos)
 * Acessível por qualquer usuário autenticado.
 */
export const listMedicos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const medicos = await prisma.medico.findMany({
      where: {
        // Retorna apenas médicos cujo usuário está ATIVO
        usuario: {
          ativo: true,
        },
      },
      include: {
        // Inclui os dados do usuário (para nome, email)
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true
          }
        },
        // Inclui as especialidades (Fase 9, mas já preparamos)
        especialidades: {
          include: {
            especialidade: true
          }
        }
      },
      orderBy: {
        nome: 'asc' // Ordena por nome
      }
    });

    return res.status(200).json(medicos);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller para buscar um Médico por ID (GET /medicos/:id)
 * Acessível por qualquer usuário autenticado.
 */
export const getMedicoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const medicoId = parseInt(id, 10);

    const medico = await prisma.medico.findUnique({
      where: { id: medicoId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true
          }
        },
        especialidades: {
          include: {
            especialidade: true
          }
        }
      },
    });

    if (!medico) {
      return res.status(404).json({ message: 'Médico não encontrado' });
    }

    return res.status(200).json(medico);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller para atualizar um Médico (PUT /medicos/:id)
 * Restrito ao Admin.
 */
export const updateMedico = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const medicoId = parseInt(id, 10);
    const { email, nome, telefone, crm, duracao_minutos, ativo } = req.body;

    // Verifica se o médico existe
    const medico = await prisma.medico.findUnique({
      where: { id: medicoId },
    });

    if (!medico) {
      return res.status(404).json({ message: 'Médico não encontrado' });
    }

    // Usa transação para atualizar 'Usuario' e 'Medico'
    const medicoAtualizado = await prisma.$transaction(async (tx) => {
      // Atualiza o 'Usuario' (se dados foram fornecidos)
      const usuarioAtualizado = await tx.usuario.update({
        where: { id: medico.usuario_id },
        data: {
          email: email, // Atualiza email (se fornecido)
          nome: nome,   // Atualiza nome (se fornecido)
          ativo: ativo, // Atualiza status (se fornecido)
        },
      });

      // Atualiza o 'Medico' (se dados foram fornecidos)
      const medicoAtualizado = await tx.medico.update({
        where: { id: medicoId },
        data: {
          telefone: telefone,
          crm: crm,
          duracao_minutos: duracao_minutos,
          nome: nome, // Atualiza o nome no 'Medico' também
        },
      });

      return { ...medicoAtualizado, usuario: usuarioAtualizado };
    });

    const { usuario: { senha_hash: _, ...usuarioSemSenha }, ...medicoAtual } = medicoAtualizado;

    logger.info(`Admin atualizou médico ID: ${medicoId}`);
    return res.status(200).json({ ...medicoAtual, usuario: usuarioSemSenha });

  } catch (error) {
    next(error);
  }
};

/**
 * Controller para "deletar" um Médico (DELETE /medicos/:id)
 * Restrito ao Admin (Soft Delete).
 */
export const deleteMedico = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const medicoId = parseInt(id, 10);

    // 1. Encontra o médico para pegar o ID do usuário associado
    const medico = await prisma.medico.findUnique({
      where: { id: medicoId },
    });

    if (!medico) {
      return res.status(404).json({ message: 'Médico não encontrado' });
    }

    // 2. Executa o Soft Delete (apenas desativa o usuário)
    // O registro em 'Medico' permanece para integridade histórica.
    await prisma.usuario.update({
      where: { id: medico.usuario_id },
      data: {
        ativo: false, // Soft Delete
      },
    });

    logger.info(`Admin desativou médico (soft delete) ID: ${medicoId}`);
    return res.status(204).send(); // 204 No Content

  } catch (error) {
    next(error);
  }
};
