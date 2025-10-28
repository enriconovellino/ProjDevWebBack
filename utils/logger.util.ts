// Conteúdo para: utils/logger.util.ts

import pino from 'pino';

// Configuração do pino-pretty (apenas para desenvolvimento)
const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true, // Adiciona cores
    translateTime: 'SYS:dd-mm-yyyy HH:MM:ss', // Formata a data
    ignore: 'pid,hostname', // Oculta informações desnecessárias
  },
});

// Cria o logger
// Em desenvolvimento, usa o transport 'pretty', em produção, usa o padrão JSON
const logger = pino(
  process.env.NODE_ENV === 'development'
    ? transport
    : {
        level: 'info', // Nível de log em produção
      }
);

export default logger;
