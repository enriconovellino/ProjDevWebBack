// Conteúdo para: routes/paciente.route.ts

import { Router } from 'express';
import { Perfil } from '@prisma/client';
import { listPacientes, getPacienteById, updatePaciente, deletePaciente } from '../controllers/paciente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { updatePacienteSchema } from '../validations/paciente.validation.js';

const router = Router();
const adminOnly = authorizationMiddleware([Perfil.ADMIN]);

// Todas as rotas de gerenciamento de pacientes requerem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/pacientes
 * @desc Lista todos os pacientes ativos.
 * @access Privada (Admin)
 */
router.get('/', adminOnly, listPacientes);

/**
 * @route GET /api/pacientes/:id
 * @desc Busca um paciente pelo ID.
 * @access Privada (Admin OU Próprio Paciente)
 */
router.get('/:id', getPacienteById);

/**
 * @route PUT /api/pacientes/:id
 * @desc Atualiza um paciente.
 * @access Privada (Admin OU Próprio Paciente)
 */
router.put(
  '/:id',
  validationMiddleware(updatePacienteSchema.shape.body),
  updatePaciente
);

/**
 * @route DELETE /api/pacientes/:id
 * @desc Desativa um paciente (Soft Delete).
 * @access Privada (Admin OU Próprio Paciente)
 */
router.delete('/:id', deletePaciente);

export default router;
