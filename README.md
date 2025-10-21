# 🏋️ Fitway — Sistema de Gestão Esportiva

> **Sistema completo** de gestão de academia/centro esportivo com quadras de beach tennis, aulas em grupo, personal trainers e pagamentos integrados.

[![Laravel](https://img.shields.io/badge/Laravel-10-red?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com)

---

## 📚 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Quick Start](#-quick-start)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Como Testar](#-como-testar)
- [Desenvolvimento](#-desenvolvimento)
- [Documentação](#-documentação)

---

## 🎯 Visão Geral

**Fitway** é um sistema full-stack moderno para gestão de centros esportivos que oferece:

- 🏐 **Gestão de Quadras** - Reservas com anti-overlap automático
- 👥 **Aulas em Grupo** - Turmas com inscrições e geração de calendário
- 💪 **Personal Trainers** - Sessões 1:1 com disponibilidade semanal
- 💳 **Assinaturas** - Planos mensais/trimestrais/anuais
- 💰 **Pagamentos** - Integração com Mercado Pago (PIX + Cartão)
- 👤 **3 Perfis** - Admin, Aluno, Instrutor com permissões específicas

### Diferencial Técnico

- ✅ **10 validações anti-overlap** (quadra, instrutor, aluno, disponibilidade)
- ✅ **Soft Delete** em todo sistema (auditoria completa)
- ✅ **28 testes de integração** (PHPUnit + SQLite in-memory)
- ✅ **Type-safe** (TypeScript + Laravel strict types)
- ✅ **Real-time feedback** (toasts, loading states, error handling)
- ✅ **Responsive design** (TailwindCSS + shadcn/ui)

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: Laravel 10.x
- **Linguagem**: PHP 8.4
- **Database**: PostgreSQL 16
- **Autenticação**: Laravel Sanctum (Bearer Token)
- **API**: RESTful JSON
- **Testes**: PHPUnit 10.x

### Frontend
- **Framework**: React 18
- **Linguagem**: TypeScript 5
- **Build**: Vite 5
- **Styling**: TailwindCSS 3 + shadcn/ui
- **State**: React Query (TanStack)
- **Routing**: React Router v6

### DevOps
- **Containers**: Docker + Docker Compose
- **Servidor Web**: Nginx
- **Database GUI**: pgAdmin 4

---

## 🚀 Quick Start

### 1️⃣ Pré-requisitos

- **Docker Desktop** instalado e rodando
- **Git** (para clonar o repositório)
- Portas livres: `3000, 5050, 5173, 5432, 8000`

### 2️⃣ Clonar e Iniciar

```bash
# Clonar repositório
git clone https://github.com/joaosn/tccfitway.git
cd tccfitway

# Iniciar ambiente (Windows)
quick-start.bat

# OU iniciar ambiente (Linux/macOS)
chmod +x quick-start.sh
./quick-start.sh
```

**O que acontece automaticamente**:
1. ✅ Sobe 4 containers Docker (PostgreSQL, pgAdmin, API, Frontend)
2. ✅ Aplica DDL completo (43 tabelas)
3. ✅ Executa migrations e seeders (dados de teste)
4. ✅ Instala dependências do frontend
5. ✅ Ambiente pronto em ~2 minutos!

### 3️⃣ Acessar o Sistema

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| 🎨 **Frontend Dev** (HMR) | http://localhost:5173 | Ver abaixo |
| 🌐 **Frontend Prod** | http://localhost:3000 | Ver abaixo |
| 🔧 **API Backend** | http://localhost:8000 | - |
| 🗄️ **pgAdmin** | http://localhost:5050 | `admin@fitway.com` / `admin123` |

### 4️⃣ Usuários de Teste

Após rodar seeders, você pode fazer login com:

| Email | Senha | Papel |
|-------|-------|-------|
| `admin@fitway.com` | `senha123` | **Admin** (acesso total) |
| `joao.silva@example.com` | `senha123` | **Aluno** (pode reservar, inscrever) |
| `personal1@fitway.com` | `senha123` | **Instrutor** (gerencia agenda) |

---

## ✨ Funcionalidades

### Para Administradores

#### Cadastros
- ✅ **Quadras**: CRUD completo com status (ativa/manutenção/inativa)
- ✅ **Planos**: Criar planos com ciclo de cobrança (mensal/trimestral/anual)
- ✅ **Usuários**: Gerenciar alunos e instrutores (CRUD + soft delete)
- ✅ **Instrutores**: CRUD com especialidades e valor/hora

#### Agendamentos
- ✅ **Sessões Personal**: Criar sessões 1:1 para qualquer aluno
- ✅ **Aulas em Grupo**: 
  - Criar aulas (nome, capacidade, preço)
  - Definir horários semanais
  - Gerar ocorrências automáticas (próximos 30 dias)
  - Inscrever alunos (individual ou em lote)
- ✅ **Reservas de Quadras**: Visualizar e gerenciar todas as reservas

#### Financeiro
- ✅ **Assinaturas**: Criar e cancelar assinaturas para usuários
- ✅ **Pagamentos**: 
  - Criar cobranças manuais
  - Vincular com reservas/aulas/sessões
  - Visualizar histórico de pagamentos
  - Receber webhooks do Mercado Pago

### Para Alunos

- ✅ **Reservar Quadras**: Escolher quadra, data e horário (anti-overlap)
- ✅ **Agendar Personal**: Escolher instrutor e horário disponível
- ✅ **Inscrever em Aulas**: Ver aulas disponíveis e se inscrever
- ✅ **Gerenciar Assinatura**: Ver plano ativo e cancelar se necessário
- ✅ **Pagamentos**: 
  - Ver cobranças pendentes
  - Pagar via Mercado Pago (PIX ou Cartão)
  - Visualizar histórico de pagamentos

### Para Instrutores

- ✅ **Disponibilidade**: Configurar horários disponíveis por dia da semana
- ✅ **Agenda**: Visualizar sessões personal agendadas
- ✅ **Turmas**: Ver aulas que ministra

---

## 📂 Estrutura do Projeto

```
tccFitway/
├── api/                          # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/     # Controllers REST
│   │   ├── Models/               # Eloquent Models
│   │   ├── Services/             # Lógica de negócio
│   │   └── Http/Requests/        # Form Requests (validação)
│   ├── database/
│   │   ├── ddl.sql              # ⭐ DDL completo (fonte da verdade)
│   │   ├── migrations/           # Laravel migrations
│   │   └── seeders/              # Dados de teste
│   ├── routes/api.php           # ⭐ Rotas da API
│   └── tests/Feature/           # Testes de integração
│
├── web/                          # Frontend React
│   ├── src/
│   │   ├── pages/               # Páginas React
│   │   │   ├── admin/           # Área administrativa
│   │   │   ├── student/         # Área do aluno
│   │   │   └── personal/        # Área do instrutor
│   │   ├── services/            # API clients (axios)
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── types/               # TypeScript interfaces
│   │   └── lib/
│   │       ├── api-client.ts    # Cliente HTTP centralizado
│   │       └── utils.ts         # ⭐ 23 utilitários UX
│   └── public/
│
├── docs/                         # Documentação
│   ├── FASE_1.md a FASE_13.md   # Documentação de cada fase
│   ├── PLANO_DE_ACAO.md         # Roadmap completo
│   ├── guia-mercado-pago.md     # Setup Mercado Pago
│   └── API.md                   # Documentação da API
│
├── docker-compose.yml            # ⭐ Orquestração de containers
├── quick-start.bat              # Script Windows
└── quick-start.sh               # Script Linux/macOS
```

---

## 🔌 API Endpoints

### Autenticação

```http
POST   /api/auth/register       # Criar conta
POST   /api/auth/login          # Login (retorna token)
POST   /api/auth/logout         # Logout
GET    /api/auth/me             # Dados do usuário logado
```

### Quadras (Admin)

```http
GET    /api/admin/courts              # Listar quadras
POST   /api/admin/courts              # Criar quadra
GET    /api/admin/courts/{id}         # Ver quadra
PUT    /api/admin/courts/{id}         # Atualizar quadra
DELETE /api/admin/courts/{id}         # Deletar (soft delete)
```

### Reservas de Quadras

```http
GET    /api/court-bookings                    # Listar reservas
POST   /api/court-bookings                    # Criar reserva
GET    /api/court-bookings/{id}               # Ver reserva
PATCH  /api/court-bookings/{id}/confirm       # Confirmar (admin)
PATCH  /api/court-bookings/{id}/cancel        # Cancelar
POST   /api/court-bookings/check-availability # Verificar disponibilidade
```

### Aulas em Grupo

```http
GET    /api/admin/classes           # Listar aulas
POST   /api/admin/classes           # Criar aula
PUT    /api/admin/classes/{id}      # Atualizar aula
DELETE /api/admin/classes/{id}      # Deletar aula

POST   /api/admin/class-schedules   # Criar horário semanal
POST   /api/admin/class-occurrences/generate   # Gerar calendário
POST   /api/classes/{id}/enroll     # Aluno se inscrever
DELETE /api/enrollments/{id}        # Cancelar inscrição
```

### Sessões Personal 1:1

```http
GET    /api/personal-sessions                    # Listar sessões
POST   /api/personal-sessions                    # Criar sessão
PATCH  /api/personal-sessions/{id}/confirm       # Confirmar (instrutor)
DELETE /api/personal-sessions/{id}               # Cancelar
POST   /api/personal-sessions/check-availability # Verificar disponibilidade
GET    /api/personal-sessions/my-sessions        # Sessões do instrutor
```

### Pagamentos

```http
GET    /api/payments/pending         # Minhas cobranças pendentes
GET    /api/payments/history         # Meu histórico
POST   /api/admin/payments/charges   # Admin cria cobrança manual
POST   /api/payments/{id}/checkout   # Criar checkout Mercado Pago
POST   /api/payments/{id}/simulate   # Simular pagamento (DEV)
POST   /api/webhooks/mercadopago     # Receber notificação MP
```

### Assinaturas

```http
GET    /api/subscriptions/active                # Minha assinatura ativa
POST   /api/admin/subscriptions                 # Admin criar assinatura
PATCH  /api/admin/subscriptions/{id}/cancel     # Admin cancelar
```

📖 **Documentação completa da API**: Veja [docs/API.md](./docs/API.md)

---

## 🧪 Como Testar

### Testes Backend (PHPUnit)

```bash
# Executar TODOS os testes
docker-compose exec api php artisan test

# Executar suite específica
docker-compose exec api php artisan test --testsuite=Feature

# Executar teste específico
docker-compose exec api php artisan test --filter=PaymentsApiTest
```

**Cobertura Atual**: 28 testes (7 passando, 21 documentados em FASE_13.md)

### Testes Manuais

1. **Login**: http://localhost:5173/login
2. **Criar Reserva**: Dashboard Aluno → Quadras → Reservar
3. **Pagar**: Dashboard Aluno → Pagamentos → Ver cobranças → Pagar

---

## 💻 Desenvolvimento

### Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f api
docker-compose logs -f frontend-dev

# Acessar shell do container
docker-compose exec api sh
docker-compose exec frontend-dev sh

# Executar Artisan commands
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed
docker-compose exec api php artisan route:list
docker-compose exec api php artisan make:controller NomeController

# Rebuild containers
docker-compose up -d --force-recreate api
docker-compose up -d --force-recreate frontend-dev

# Derrubar tudo (mantém volumes)
docker-compose down

# Derrubar e apagar dados
docker-compose down -v
```

### Variáveis de Ambiente

**Backend** (`api/.env.docker`):
```env
DB_HOST=db
DB_DATABASE=fitway_db
DB_USERNAME=fitway_user
DB_PASSWORD=fitway_password

MP_ACCESS_TOKEN=seu_token_aqui
MP_PUBLIC_KEY=sua_chave_publica_aqui
MP_WEBHOOK_SECRET=seu_secret_aqui
```

**Frontend** (`web/.env.docker`):
```env
VITE_API_URL=http://localhost:8000
```

### Adicionar Nova Feature

1. **Backend**:
   ```bash
   docker-compose exec api php artisan make:model NomeModel
   docker-compose exec api php artisan make:controller NomeController --resource
   docker-compose exec api php artisan make:request CreateNomeRequest
   # Registrar rota em api/routes/api.php
   ```

2. **Frontend**:
   - Criar types em `web/src/types/index.ts`
   - Criar service em `web/src/services/nome.service.ts`
   - Criar página em `web/src/pages/admin/Nome.tsx`

3. **Documentação**:
   - Criar `docs/FASE_X.md` após testar

---

## 📖 Documentação

- 📄 **[PLANO_DE_ACAO.md](./docs/PLANO_DE_ACAO.md)** - Roadmap completo das 13 fases
- 📄 **[FASE_1.md a FASE_13.md](./docs/)** - Documentação detalhada de cada fase
- 📄 **[guia-mercado-pago.md](./docs/guia-mercado-pago.md)** - Setup Mercado Pago
- 📄 **[API.md](./docs/API.md)** - Documentação completa da API
- 📄 **[copilot-instructions.md](./.github/copilot-instructions.md)** - Padrões de código

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC) e está disponível para fins educacionais.

---

## 👨‍💻 Autor

**João Silva Neto**  
🔗 GitHub: [@joaosn](https://github.com/joaosn)

---

## 🙏 Agradecimentos

- Laravel Community
- React Community
- shadcn/ui
- Mercado Pago Developers

---

**⭐ Se este projeto te ajudou, considere dar uma estrela!**
