# 🏥 Sistema de Agendamento Médico - Backend

API RESTful para gerenciamento de consultas médicas, desenvolvida com Node.js, Express, TypeScript e Prisma ORM.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Banco de Dados](#banco-de-dados)
- [Segurança](#segurança)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Contribuindo](#contribuindo)

## 🎯 Sobre o Projeto

Sistema completo para gerenciamento de consultas médicas que permite:
- Cadastro e autenticação de usuários (Médicos, Pacientes e Administradores)
- Gerenciamento de especialidades médicas
- Controle de agenda de médicos com slots de horários
- Agendamento e gestão de consultas
- Sistema de permissões baseado em perfis

## 🚀 Tecnologias

### Core
- **Node.js** - Ambiente de execução JavaScript
- **TypeScript** - Superset JavaScript com tipagem estática
- **Express 5** - Framework web minimalista

### Database & ORM
- **Prisma** - ORM moderno para Node.js e TypeScript
- **MySQL** - Sistema de gerenciamento de banco de dados

### Segurança
- **Helmet** - Headers de segurança HTTP
- **CORS** - Controle de acesso entre origens
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT
- **express-rate-limit** - Limitação de requisições

### Validação & Logging
- **Zod** - Validação de schemas TypeScript-first
- **Pino** - Logger de alta performance

### DevOps
- **tsx** - Executor TypeScript para desenvolvimento
- **ts-node** - Executor TypeScript
- **dotenv** - Gerenciamento de variáveis de ambiente

## ✨ Funcionalidades

### Autenticação e Autorização
- ✅ Login com email e senha
- ✅ Geração de tokens JWT
- ✅ Middleware de autenticação
- ✅ Sistema de permissões por perfil (ADMIN, MEDICO, PACIENTE)

### Gestão de Usuários
- ✅ Cadastro de médicos e pacientes
- ✅ Atualização de perfis
- ✅ Ativação/desativação de contas

### Especialidades
- ✅ CRUD completo de especialidades médicas
- ✅ Associação de múltiplas especialidades a médicos

### Agenda Médica
- ✅ Criação de slots de horários disponíveis
- ✅ Visualização de agenda por médico
- ✅ Filtros por data e especialidade
- ✅ Controle de status dos slots (DISPONIVEL, OCUPADO, BLOQUEADO)

### Consultas
- ✅ Agendamento de consultas
- ✅ Visualização de consultas por paciente/médico
- ✅ Cancelamento de consultas
- ✅ Atualização de status (AGENDADA, REALIZADA, CANCELADA)

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas:

```
┌─────────────────────────────────────┐
│         Routes (Rotas)              │
├─────────────────────────────────────┤
│      Middlewares (Validação)        │
├─────────────────────────────────────┤
│     Controllers (Lógica)            │
├─────────────────────────────────────┤
│    Prisma ORM (Acesso a Dados)     │
├─────────────────────────────────────┤
│         MySQL Database              │
└─────────────────────────────────────┘
```

### Padrões Utilizados
- **MVC Pattern** - Separação de responsabilidades
- **Middleware Pattern** - Processamento em cadeia
- **Repository Pattern** - Abstração de acesso a dados via Prisma
- **Dependency Injection** - Injeção de dependências

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **MySQL** (versão 8 ou superior)
- **Git**

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/enriconovellino/ProjDevWebBack.git
cd ProjDevWebBack
```

2. **Instale as dependências**
```bash
npm install
```

## ⚙️ Configuração

1. **Crie o arquivo `.env`** na raiz do projeto:

```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu_segredo_super_secreto_aqui_min_32_caracteres
JWT_EXPIRES_IN=7d

# CORS (opcional)
CORS_ORIGIN=http://localhost:3000
```

2. **Configure o banco de dados**

Crie o banco de dados MySQL:
```sql
CREATE DATABASE nome_do_banco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Execute as migrations**
```bash
npm run prisma:migrate
```

4. **Execute o seed (opcional)** - Popula o banco com dados iniciais:
```bash
npm run prisma:seed
```

## 🚀 Execução

### Modo Desenvolvimento
```bash
npm run dev
```
O servidor estará disponível em `http://localhost:3000`

### Modo Produção
```bash
# Build
npm run build

# Start
npm start
```

### Health Check
Verifique se o servidor está rodando:
```bash
curl http://localhost:3000/health
```

## 📁 Estrutura do Projeto

```
ProjDevWebBack/
├── controllers/          # Lógica de negócio
│   ├── agenda.controller.ts
│   ├── auth.controller.ts
│   ├── consulta.controller.ts
│   ├── especialidade.controller.ts
│   ├── medico.controller.ts
│   └── paciente.controller.ts
├── middlewares/          # Middlewares da aplicação
│   ├── auth.middleware.ts
│   ├── authorization.middleware.ts
│   ├── errorHandler.middleware.ts
│   └── validation.middleware.ts
├── routes/              # Definição de rotas
│   ├── index.ts
│   ├── agenda.route.ts
│   ├── auth.route.ts
│   ├── consulta.route.ts
│   ├── especialidade.route.ts
│   ├── medico.route.ts
│   └── paciente.route.ts
├── validations/         # Schemas de validação Zod
│   ├── agenda.validation.ts
│   ├── auth.validation.ts
│   ├── consulta.validation.ts
│   ├── especialidade.validation.ts
│   ├── medico.validation.ts
│   ├── paciente.validation.ts
│   └── pagination.validation.ts
├── utils/              # Utilitários
│   ├── jwt.util.ts
│   ├── logger.util.ts
│   └── prisma.util.ts
├── types/              # Definições TypeScript
│   └── express/
│       └── index.d.ts
├── prisma/             # Prisma ORM
│   ├── schema.prisma   # Schema do banco de dados
│   ├── seed.ts        # Dados iniciais
│   └── migrations/    # Histórico de migrations
├── server.ts          # Ponto de entrada da aplicação
├── package.json
└── tsconfig.json
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Autenticação

#### `POST /api/auth/login`
Realiza login e retorna token JWT

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "usuario@email.com",
    "nome": "Nome do Usuário",
    "perfil": "PACIENTE"
  }
}
```

### Médicos

#### `GET /api/medicos`
Lista todos os médicos (requer autenticação)

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `especialidade_id` (opcional): Filtrar por especialidade

**Headers:**
```
Authorization: Bearer <token>
```

#### `POST /api/medicos`
Cria um novo médico (requer perfil ADMIN)

**Request Body:**
```json
{
  "nome": "Dr. João Silva",
  "email": "joao.silva@email.com",
  "senha": "senha123",
  "cpf": "12345678900",
  "crm": "12345-SP",
  "telefone": "(11) 98765-4321",
  "duracao_minutos": 30,
  "especialidades": [1, 2]
}
```

#### `GET /api/medicos/:id`
Busca um médico por ID

#### `PUT /api/medicos/:id`
Atualiza um médico (requer perfil ADMIN ou ser o próprio médico)

#### `DELETE /api/medicos/:id`
Desativa um médico (requer perfil ADMIN)

### Pacientes

#### `GET /api/pacientes`
Lista todos os pacientes (requer perfil ADMIN)

#### `POST /api/pacientes`
Cria um novo paciente

**Request Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria.santos@email.com",
  "senha": "senha123",
  "cpf": "98765432100",
  "telefone": "(11) 91234-5678",
  "data_nascimento": "1990-05-15"
}
```

#### `GET /api/pacientes/:id`
Busca um paciente por ID

#### `PUT /api/pacientes/:id`
Atualiza um paciente

#### `DELETE /api/pacientes/:id`
Desativa um paciente

### Especialidades

#### `GET /api/especialidades`
Lista todas as especialidades

#### `POST /api/especialidades`
Cria uma nova especialidade (requer perfil ADMIN)

**Request Body:**
```json
{
  "nome": "Cardiologia",
  "codigo": "CARDIO"
}
```

#### `PUT /api/especialidades/:id`
Atualiza uma especialidade (requer perfil ADMIN)

#### `DELETE /api/especialidades/:id`
Desativa uma especialidade (requer perfil ADMIN)

### Agenda

#### `GET /api/agenda/medico/:medicoId`
Lista slots de agenda de um médico

**Query Parameters:**
- `data_inicio`: Data inicial (ISO 8601)
- `data_fim`: Data final (ISO 8601)
- `status`: Filtrar por status (DISPONIVEL, OCUPADO, BLOQUEADO)

#### `POST /api/agenda/slots`
Cria slots de horários para um médico (requer perfil MEDICO ou ADMIN)

**Request Body:**
```json
{
  "medico_id": 1,
  "data_inicio": "2025-11-10T08:00:00Z",
  "data_fim": "2025-11-10T18:00:00Z",
  "duracao_minutos": 30
}
```

#### `PUT /api/agenda/slots/:id`
Atualiza um slot (requer perfil MEDICO ou ADMIN)

#### `DELETE /api/agenda/slots/:id`
Remove um slot (requer perfil MEDICO ou ADMIN)

### Consultas

#### `GET /api/consultas`
Lista consultas (filtradas por perfil)

**Query Parameters:**
- `status`: Filtrar por status (AGENDADA, REALIZADA, CANCELADA)
- `data_inicio`: Data inicial
- `data_fim`: Data final

#### `POST /api/consultas`
Agenda uma nova consulta

**Request Body:**
```json
{
  "paciente_id": 1,
  "medico_id": 2,
  "agenda_slot_id": 5
}
```

#### `GET /api/consultas/:id`
Busca uma consulta por ID

#### `PUT /api/consultas/:id/status`
Atualiza o status de uma consulta

**Request Body:**
```json
{
  "status": "REALIZADA"
}
```

#### `DELETE /api/consultas/:id`
Cancela uma consulta

## 🗄️ Banco de Dados

### Modelos Principais

#### Usuario
- Armazena dados de autenticação e perfil
- Relacionamento 1:1 com Medico ou Paciente

#### Medico
- Dados específicos de médicos (CRM, duração de consulta)
- Relacionamento N:N com Especialidade

#### Paciente
- Dados específicos de pacientes (data de nascimento)

#### Especialidade
- Especialidades médicas disponíveis
- Relacionamento N:N com Medico

#### AgendaSlot
- Slots de horários na agenda dos médicos
- Controle de disponibilidade

#### Consulta
- Registro de consultas agendadas
- Relaciona Paciente, Médico e AgendaSlot

### Diagrama ER Simplificado

```
┌──────────┐     1:1     ┌─────────┐     N:N     ┌────────────────┐
│ Usuario  │────────────▶│ Medico  │◀───────────▶│ Especialidade  │
└──────────┘             └─────────┘             └────────────────┘
     │                        │                           
     │ 1:1                    │ 1:N                       
     │                        │                           
     ▼                        ▼                           
┌──────────┐             ┌─────────────┐                 
│ Paciente │             │ AgendaSlot  │                 
└──────────┘             └─────────────┘                 
     │                        │                           
     │         N:1            │ 1:1                       
     └───────────▶┌──────────┐◀───────                   
                  │ Consulta │                            
                  └──────────┘                            
```

## 🔐 Segurança

### Medidas Implementadas

1. **Autenticação JWT**
   - Tokens com expiração configurável
   - Validação em todas as rotas protegidas

2. **Autorização por Perfil**
   - ADMIN: Acesso total
   - MEDICO: Gerencia própria agenda e consultas
   - PACIENTE: Visualiza e agenda próprias consultas

3. **Hash de Senhas**
   - Utilização de bcryptjs com salt rounds

4. **Rate Limiting**
   - Limite de 100 requisições por IP a cada 15 minutos

5. **Helmet**
   - Headers de segurança HTTP configurados

6. **CORS**
   - Controle de origens permitidas

7. **Validação de Dados**
   - Validação com Zod em todas as entradas

### Boas Práticas

- ✅ Nunca commitar o arquivo `.env`
- ✅ Usar senhas fortes para JWT_SECRET
- ✅ Implementar HTTPS em produção
- ✅ Manter dependências atualizadas
- ✅ Realizar backups regulares do banco de dados

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Inicia o servidor em modo watch

# Build
npm run build              # Compila TypeScript para JavaScript

# Produção
npm start                  # Inicia o servidor compilado

# Prisma
npm run prisma:migrate     # Executa migrations do Prisma
npm run prisma:seed        # Popula banco com dados iniciais
npx prisma studio          # Abre interface visual do banco
npx prisma generate        # Gera o Prisma Client
```

## 🧪 Testes

Para testar a API, você pode usar:

- **Postman** - [Collection disponível]
- **Insomnia** - Cliente REST
- **curl** - Linha de comando
- **Thunder Client** - Extensão do VS Code

### Exemplo de Teste com curl

```bash
# Health Check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","senha":"admin123"}'

# Listar Médicos (com autenticação)
curl http://localhost:3000/api/medicos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript para todo código novo
- Siga as convenções do ESLint/Prettier (se configurados)
- Documente funções complexas
- Escreva commits descritivos

## 📝 Licença

Este projeto está sob a licença ISC.

## 👥 Autores

- **Enrico Novellino e Gigio Moura Melo** - [GitHub](https://github.com/enriconovellino)

## 📞 Contato

Para dúvidas ou sugestões:
- Abra uma [issue](https://github.com/enriconovellino/ProjDevWebBack/issues)
- Entre em contato via e-mail

---

