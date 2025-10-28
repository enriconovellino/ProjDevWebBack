import 'dotenv/config'; // Garante que o .env seja lido primeiro
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Configuração do Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 requisições por janela (windowMs)
  message: 'Muitas requisições criadas a partir deste IP, por favor, tente novamente após 15 minutos',
  standardHeaders: true, // Retorna informações do limite nas headers `RateLimit-*`
  legacyHeaders: false, // Desabilita as headers `X-RateLimit-*`
});

// Define a porta, com um fallback
const PORT = process.env.PORT || 3001;

// Inicializa a aplicação Express
const app = express();

// Aplica os middlewares
app.use(express.json()); // Middleware para parsear JSON bodies
app.use(helmet());       // Middleware para adicionar headers de segurança
app.use(cors());         // Middleware para habilitar Cross-Origin Resource Sharing
app.use(limiter);        // Middleware para limitar requisições

// Rota de Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor está online e funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});
