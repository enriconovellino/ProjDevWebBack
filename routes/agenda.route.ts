// Conteúdo para: routes/agenda.route.ts

import { Router } from 'express';
import { Perfil } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
// --- Importar o novo query validator ---
import { validationMiddleware, queryValidationMiddleware } from '../middlewares/validation.middleware.js';
import {
  generateSlotsSchema,
  listAgendaSchema,
  updateSlotStatusSchema
} from '../validations/agenda.validation.js';
import {
  createAgendaSlots,
  listAgendaSlots,
  updateSlotStatus
} from '../controllers/agenda.controller.js';

const router = Router();
const adminOnly = authorizationMiddleware([Perfil.ADMIN]);

// Todas as rotas de agenda requerem autenticação
router.use(authMiddleware);

/**
 * @route POST /api/agenda/generate-slots
 * @desc Gera slots de agenda para um médico (RF04).
 * @access Privada (Admin)
 */
router.post(
  '/generate-slots',
  adminOnly,
  validationMiddleware(generateSlotsSchema.shape.body),
  createAgendaSlots
);

/**
 * @route GET /api/agenda
 * @desc Lista slots de agenda de um médico (RF05).
 * @access Privada (Qualquer usuário autenticado)
 */
router.get(
  '/',
  queryValidationMiddleware(listAgendaSchema.shape.query),
  listAgendaSlots
);

/**
 * @route PATCH /api/agenda/:id/status
 * @desc Bloqueia ou desbloqueia um slot (RF10, RB07).
 * @access Privada (Admin ou Médico dono da agenda)
 */
router.patch(
  '/:id/status',
  validationMiddleware(updateSlotStatusSchema.shape.body),
  updateSlotStatus
);

export default router;
