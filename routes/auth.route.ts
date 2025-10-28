// Conteúdo para: routes/auth.route.ts

import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { loginSchema } from '../validations/auth.validation.js';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Autentica um usuário e retorna um token JWT.
 * @access Pública
 */
router.post('/login', validationMiddleware(loginSchema.shape.body), login);

/**
 * @route GET /api/auth/perfil
 * @desc Retorna o perfil do usuário autenticado.
 * @access Privada (Requer token)
 */
router.get('/perfil', authMiddleware, getProfile);

export default router;
