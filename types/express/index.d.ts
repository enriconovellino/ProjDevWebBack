// Conteúdo para: types/express/index.d.ts

// Importa o payload do nosso utilitário JWT
import { JwtPayload } from '../../utils/jwt.util';

// Estende a interface 'Request' do Express
declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload; // Adiciona a propriedade 'user' opcional ao Request
    }
  }
}
