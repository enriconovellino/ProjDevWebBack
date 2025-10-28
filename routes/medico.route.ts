// Conteúdo para: routes/medico.route.ts

import { Router } from 'express';
import { Perfil } from '@prisma/client';
import { createMedico, listMedicos, getMedicoById, updateMedico, deleteMedico } from '../controllers/medico.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { createMedicoSchema, updateMedicoSchema } from '../validations/medico.validation.js';

const router = Router();
const adminOnly = authorizationMiddleware([Perfil.ADMIN]); // Middleware de Admin

/**
 * @route POST /api/medicos
 * @desc Cria um novo médico (Usuário + Médico).
 * @access Privada (Admin) 
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  validationMiddleware(createMedicoSchema.shape.body),
  createMedico
);

/**
 * @route GET /api/medicos
 * @desc Lista todos os médicos ativos.
 * @access Privada (Qualquer usuário autenticado)
 */
router.get('/', authMiddleware, listMedicos);

/**
 * @route GET /api/medicos/:id
 * @desc Busca um médico específico pelo ID.
 * @access Privada (Qualquer usuário autenticado)
 */
router.get('/:id', authMiddleware, getMedicoById);

/**
 * @route PUT /api/medicos/:id
 * @desc Atualiza um médico (Usuário + Médico).
 * @access Privada (Admin) 
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  validationMiddleware(updateMedicoSchema.shape.body),
  updateMedico
);

/**
 * @route DELETE /api/medicos/:id
 * @desc Desativa um médico (Soft Delete).
 * @access Privada (Admin) 
 */
router.delete('/:id', authMiddleware, adminOnly, deleteMedico);

export default router;
