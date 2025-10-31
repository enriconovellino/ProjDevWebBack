// Conteúdo para: routes/index.ts (Atualizado)

import { Router } from 'express';
import authRouter from './auth.route.js'; // Importa o roteador de autenticação
import medicoRouter from './medico.route.js'; // Importa o roteador de médicos
import pacienteRouter from './paciente.route.js'; // --- IMPORTAÇÃO FASE 8 ---
import especialidadeRouter from './especialidade.route.js'; // --- IMPORTAÇÃO FASE 9 ---
import agendaRouter from './agenda.route.js'; // --- IMPORTAÇÃO FASE 10 ---
import consultaRouter from './consulta.route.js'; // --- NOVA IMPORTAÇÃO FASE 11 ---

const router = Router();

// Rotas de Autenticação
router.use('/auth', authRouter);

// Rotas de Médicos
router.use('/medicos', medicoRouter);

// Rotas de Pacientes
router.use('/pacientes', pacienteRouter);

// Rotas de Especialidades
router.use('/especialidades', especialidadeRouter);

// Rotas de Agenda
router.use('/agenda', agendaRouter);

// --- NOVA ROTA FASE 11 ---
// Rotas de Consultas
router.use('/consultas', consultaRouter);

export default router;
