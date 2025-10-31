// Conteúdo para: routes/consulta.route.ts

import { Router } from 'express';
import { Perfil } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { validationMiddleware, queryValidationMiddleware } from '../middlewares/validation.middleware.js';
import {
  createConsultaSchema,
  listConsultaSchema,
  updateConsultaStatusSchema
} from '../validations/consulta.validation.js';
import {
  createConsulta,
  listConsultas,
  cancelConsulta,
  updateConsultaStatus
} from '../controllers/consulta.controller.js';

const router = Router();

// Todas as rotas de consulta requerem autenticação
router.use(authMiddleware);

// Permissões
const pacienteOnly = authorizationMiddleware([Perfil.PACIENTE]);
const adminOuPaciente = authorizationMiddleware([Perfil.ADMIN, Perfil.PACIENTE]);
const adminOuMedico = authorizationMiddleware([Perfil.ADMIN, Perfil.MEDICO]);

/**
 * @route POST /api/consultas
 * @desc Paciente agenda uma nova consulta (RF06).
 * @access Privada (Paciente)
 */
router.post(
  '/',
  pacienteOnly,
  validationMiddleware(createConsultaSchema.shape.body),
  createConsulta
);

/**
 * @route GET /api/consultas
 * @desc Lista consultas (Admin=todas, Medico=suas, Paciente=suas) (RF07).
 * @access Privada (Autenticado)
 */
router.get(
  '/',
  queryValidationMiddleware(listConsultaSchema.shape.query),
  listConsultas
);

/**
 * @route PATCH /api/consultas/:id/cancel
 * @desc Cancela uma consulta (RF08, RB06).
 * @access Privada (Admin ou Paciente dono)
 */
router.patch(
  '/:id/cancel',
  adminOuPaciente,
  cancelConsulta
);

/**
 * @route PATCH /api/consultas/:id/status
 * @desc Atualiza status da consulta (ex: REALIZADA) (RB09).
 * @access Privada (Admin ou Médico dono)
 */
router.patch(
  '/:id/status',
  adminOuMedico,
  validationMiddleware(updateConsultaStatusSchema.shape.body),
  updateConsultaStatus
);

export default router;
