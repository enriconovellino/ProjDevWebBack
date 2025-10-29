// Conteúdo para: routes/index.ts (Atualizado)

import { Router } from 'express';
import authRouter from './auth.route.js'; // Importa o roteador de autenticação
import medicoRouter from './medico.route.js'; // Importa o roteador de médicos
import pacienteRouter from './paciente.route.js'; // --- IMPORTAÇÃO FASE 8 ---
import especialidadeRouter from './especialidade.route.js'; // --- NOVA IMPORTAÇÃO FASE 9 ---

const router = Router();

// Rotas de Autenticação
router.use('/auth', authRouter);

// Rotas de Médicos
router.use('/medicos', medicoRouter);

// Rotas de Pacientes
router.use('/pacientes', pacienteRouter);

// --- NOVA ROTA FASE 9 ---
// Rotas de Especialidades
router.use('/especialidades', especialidadeRouter);

export default router;
