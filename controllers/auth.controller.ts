// Conteúdo para: controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.util.js'; // Nosso cliente Prisma
import logger from '../utils/logger.util.js'; // Nosso logger
import { generateToken, JwtPayload } from '../utils/jwt.util.js'; // Nossos utilitários JWT

/**
 * Controller para fazer login (POST /login)
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, senha } = req.body;

    // 1. Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // 2. Verificar se o usuário existe e está ativo
    if (!usuario || !usuario.ativo) {
      logger.warn(`Login: Tentativa falha para o email: ${email}`);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // 3. Verificar a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      logger.warn(`Login: Tentativa de senha inválida para o email: ${email}`);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // 4. Se tudo estiver correto, gerar o payload e o token
    const payload: JwtPayload = {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };
    const token = generateToken(payload);

    // 5. Remover a senha hash do objeto antes de retornar
    const { senha_hash, ...usuarioSemSenha } = usuario;

    logger.info(`Login: Usuário ${email} logado com sucesso.`);
    return res.status(200).json({
      message: 'Login bem-sucedido!',
      usuario: usuarioSemSenha,
      token: token,
    });

  } catch (error) {
    next(error); // Passa o erro para o errorHandlerMiddleware
  }
};

/**
 * Controller para buscar o perfil do usuário logado (GET /perfil)
 * Este controller é usado após o authMiddleware.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user é anexado pelo authMiddleware
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      // Isso não deve acontecer se o authMiddleware estiver correto
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Buscar o usuário no banco, incluindo suas relações (Medico ou Paciente)
    // Conforme o Guia de Dev
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        medico: true,   // Inclui o perfil de médico, se existir
        paciente: true, // Inclui o perfil de paciente, se existir
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Remover a senha hash do objeto antes de retornar
    const { senha_hash, ...perfilUsuario } = usuario;

    return res.status(200).json(perfilUsuario);

  } catch (error) {
    next(error); // Passa o erro para o errorHandlerMiddleware
  }
};
