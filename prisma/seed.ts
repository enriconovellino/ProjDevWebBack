import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Instancia o Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando o seed...`);

  // 1. Criar o usuário Admin
  // (Senha padrão 'admin123', será hasheada)
  const senhaAdmin = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(senhaAdmin, salt);

  const admin = await prisma.usuario.upsert({
    // 'upsert' tenta encontrar um registro, e se não encontrar, ele cria.
    // Isso evita criar admins duplicados se rodarmos o seed várias vezes.
    where: { email: 'admin@clinica.com' }, // Chave única para buscar
    update: {}, // Se o admin já existe, não faz nada
    create: {
      email: 'admin@clinica.com',
      nome: 'Administrador',
      cpf: '00000000000', // CPF placeholder (deve ser único)
      senha_hash: senhaHash,
      perfil: 'ADMIN', // Conforme o enum 'Perfil'
      ativo: true
    },
  });
  console.log(`Usuário Admin criado/atualizado: ${admin.email}`);

  // 2. Criar algumas especialidades médicas
  const especialidades = await prisma.especialidade.createMany({
    data: [
      { nome: 'Cardiologia', codigo: 'CARDIO' },
      { nome: 'Dermatologia', codigo: 'DERMA' },
      { nome: 'Ortopedia', codigo: 'ORTO' },
      { nome: 'Clínica Geral', codigo: 'GERAL' },
    ],
    skipDuplicates: true, // Evita erro se as especialidades já existirem (pelo @unique)
  });
  console.log(`Criadas ${especialidades.count} novas especialidades.`);

  console.log(`Seed finalizado com sucesso.`);
}

// Executa a função main e trata erros
main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Fecha a conexão com o banco de dados
    await prisma.$disconnect();
  });