// Conteúdo para: routes/index.ts

import { Router } from 'express';
import authRouter from './auth.route.js'; // Importa o roteador de autenticação

const router = Router();

// Define a rota base para os endpoints de autenticação
router.use('/auth', authRouter);

// (Futuramente, adicionaremos outras rotas aqui)
// router.use('/medicos', medicoRouter);
// router.use('/pacientes', pacienteRouter);

export default router;
