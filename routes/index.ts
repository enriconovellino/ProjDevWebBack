// Conteúdo para: routes/index.ts (Atualizado)

import { Router } from 'express';
import authRouter from './auth.route.js'; // Importa o roteador de autenticação
import medicoRouter from './medico.route.js'; // --- NOVA IMPORTAÇÃO ---

const router = Router();

// Rotas de Autenticação
router.use('/auth', authRouter);

// --- NOVAS ROTAS ---
// Rotas de Médicos
router.use('/medicos', medicoRouter);

// (Futuramente, adicionaremos outras rotas aqui)
// router.use('/pacientes', pacienteRouter);

export default router;
