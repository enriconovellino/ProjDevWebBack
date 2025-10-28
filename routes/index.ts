// Conteúdo para: routes/index.ts (Atualizado)

import { Router } from 'express';
import authRouter from './auth.route.js'; // Importa o roteador de autenticação
import medicoRouter from './medico.route.js'; // Importa o roteador de médicos
import pacienteRouter from './paciente.route.js'; // --- NOVA IMPORTAÇÃO ---

const router = Router();

// Rotas de Autenticação
router.use('/auth', authRouter);

// Rotas de Médicos
router.use('/medicos', medicoRouter);

// --- NOVAS ROTAS ---
// Rotas de Pacientes
router.use('/pacientes', pacienteRouter);

export default router;
