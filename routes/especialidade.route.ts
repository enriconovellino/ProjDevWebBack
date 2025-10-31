// Conteúdo para: routes/especialidade.route.ts

import { Router } from 'express';
import { Perfil } from '@prisma/client';
import { createEspecialidade, listEspecialidades, updateEspecialidade } from '../controllers/especialidade.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { validationMiddleware, queryValidationMiddleware } from '../middlewares/validation.middleware.js';
import { createEspecialidadeSchema, updateEspecialidadeSchema, listEspecialidadesSchema } from '../validations/especialidade.validation.js';

const router = Router();
const adminOnly = authorizationMiddleware([Perfil.ADMIN]);

/**
 * @route POST /api/especialidades
 * @desc Cria uma nova especialidade.
 * @access Privada (Admin)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  validationMiddleware(createEspecialidadeSchema.shape.body),
  createEspecialidade
);

/**
 * @route GET /api/especialidades
 * @desc Lista todas as especialidades ativas.
 * @access Privada (Qualquer usuário autenticado)
 */
router.get(
  '/',
  authMiddleware,
  queryValidationMiddleware(listEspecialidadesSchema.shape.query),
  listEspecialidades
);

/**
 * @route PUT /api/especialidades/:id
 * @desc Atualiza uma especialidade (ou ativa/desativa).
 * @access Privada (Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  validationMiddleware(updateEspecialidadeSchema.shape.body),
  updateEspecialidade
);

export default router;
