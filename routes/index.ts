// Conteúdo para: routes/index.ts (Atualizado)

import { Router } from 'express';
import authRouter from './auth.route.js'; // Importa o roteador de autenticação
import medicoRouter from './medico.route.js'; // Importa o roteador de médicos
import pacienteRouter from './paciente.route.js'; // --- IMPORTAÇÃO FASE 8 ---
import especialidadeRouter from './especialidade.route.js'; // --- IMPORTAÇÃO FASE 9 ---
import agendaRouter from './agenda.route.js'; // --- NOVA IMPORTAÇÃO FASE 10 ---

const router = Router();

// Rotas de Autenticação
router.use('/auth', authRouter);

// Rotas de Médicos
router.use('/medicos', medicoRouter);

// Rotas de Pacientes
router.use('/pacientes', pacienteRouter);

// Rotas de Especialidades
router.use('/especialidades', especialidadeRouter);

// --- NOVA ROTA FASE 10 ---
// Rotas de Agenda
router.use('/agenda', agendaRouter);

export default router;
