# 🗺️ Mapa Visual do Projeto Fitway

## 📊 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVEGADOR DO USUÁRIO                        │
│                    http://localhost:5173                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │ Authorization: Bearer {token}
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      FRONTEND (React)                            │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐  │
│  │   Pages    │  │  Services  │  │   api-client.ts          │  │
│  │            │◄─┤            │◄─┤  (HTTP Client)           │  │
│  │ LoginPage  │  │ auth       │  │  - GET/POST/PATCH/DELETE │  │
│  │ AdminPages │  │ courts     │  │  - Auto headers          │  │
│  │ StudentPgs │  │ plans      │  │  - Error handling        │  │
│  └────────────┘  └────────────┘  └──────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ VITE_API_URL=http://localhost:8000
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                  API LARAVEL (Backend)                           │
│                   http://localhost:8000                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      ROUTES (api.php)                     │  │
│  │  /auth/* (public)  /admin/* (admin)  /* (authenticated)  │  │
│  └───────┬──────────────────────┬───────────────┬────────────┘  │
│          │                      │               │               │
│  ┌───────▼──────┐  ┌────────────▼─────┐  ┌─────▼──────────┐   │
│  │ Controllers  │  │   Middleware      │  │   Services     │   │
│  │              │  │                   │  │                │   │
│  │ Auth         │  │ auth:sanctum      │  │ Reserva        │   │
│  │ Quadra       │  │ role:admin        │  │ Assinatura     │   │
│  │ Plano        │  │ CheckRole         │  │ Overlap        │   │
│  └───────┬──────┘  └───────────────────┘  └─────┬──────────┘   │
│          │                                       │               │
│  ┌───────▼───────────────────────────────────────▼──────────┐  │
│  │                    MODELS (Eloquent)                      │  │
│  │  Usuario  Quadra  ReservaQuadra  Plano  Assinatura       │  │
│  │  Instrutor  Aula  SessaoPersonal  Pagamento              │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ PDO/PostgreSQL Driver
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                  POSTGRESQL 16 (Docker)                          │
│                    localhost:5432                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    TABELAS (DDL)                          │  │
│  │  usuarios, quadras, reservas_quadra, planos, assinaturas │  │
│  │  instrutores, aulas, sessoes_personal, pagamentos        │  │
│  │                                                           │  │
│  │  CONSTRAINTS:                                             │  │
│  │  - EXCLUDE USING gist (anti-overlap em reservas)         │  │
│  │  - Foreign Keys (CASCADE/SET NULL)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação (Sanctum)

```
┌──────────────┐                                    ┌──────────────┐
│   Frontend   │                                    │   Backend    │
│ (LoginPage)  │                                    │ (AuthCtrl)   │
└──────┬───────┘                                    └──────┬───────┘
       │                                                   │
       │ 1. POST /api/auth/login                          │
       │    { email, password }                           │
       ├─────────────────────────────────────────────────►│
       │                                                   │
       │                              2. Valida credenciais│
       │                                 (Hash::check)     │
       │                                                   │
       │                              3. Cria token Sanctum│
       │                                 $user->createToken()
       │                                                   │
       │ 4. Retorna user + access_token                   │
       │◄─────────────────────────────────────────────────┤
       │    { user: {...}, access_token: "..." }          │
       │                                                   │
       │ 5. Salva no localStorage                         │
       │    localStorage.setItem('access_token', ...)     │
       │    localStorage.setItem('user_data', ...)        │
       │                                                   │
       │ 6. Redireciona baseado no role                   │
       │    - aluno → /aluno/dashboard                    │
       │    - personal → /personal/dashboard              │
       │    - admin → /admin/dashboard                    │
       │                                                   │
       │ 7. Próximas chamadas com header                  │
       │    Authorization: Bearer {token}                 │
       ├─────────────────────────────────────────────────►│
       │                                                   │
       │                      8. Middleware auth:sanctum   │
       │                         valida token              │
       │                         Auth::user() disponível   │
```

---

## 🏗️ Estrutura de Pastas

```
tccFitway/
│
├── api/                           # Backend Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── QuadraController.php
│   │   │   │       ├── PlanoController.php
│   │   │   │       └── ...
│   │   │   ├── Requests/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   └── Middleware/
│   │   │       └── CheckRole.php
│   │   ├── Models/
│   │   │   ├── Usuario.php
│   │   │   ├── Quadra.php
│   │   │   ├── ReservaQuadra.php
│   │   │   └── ...
│   │   └── Services/              # A CRIAR
│   │       ├── ReservaQuadraService.php
│   │       └── AssinaturaService.php
│   ├── database/
│   │   ├── ddl.sql                # ⭐ FONTE DA VERDADE
│   │   ├── migrations/
│   │   └── seeders/
│   │       └── UsuariosSeeder.php
│   ├── routes/
│   │   └── api.php                # Todas as rotas
│   └── .env.docker
│
├── web/                           # Frontend React
│   ├── src/
│   │   ├── services/
│   │   │   ├── auth.service.ts    # ⚠️ REMOVER MOCK
│   │   │   ├── courts.service.ts
│   │   │   └── plans.service.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Courts.tsx
│   │   │   │   ├── AddCourt.tsx
│   │   │   │   └── ...
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Courts.tsx
│   │   │   │   └── ...
│   │   │   └── personal/
│   │   │       ├── Dashboard.tsx
│   │   │       └── ...
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   └── api-client.ts      # HTTP Client
│   │   └── types/
│   │       └── index.ts
│   └── .env.docker                # VITE_API_URL
│
├── docs/
│   ├── copilot-instructions.md    # Guia completo
│   ├── PLANO_DE_ACAO.md          # Plano detalhado
│   ├── RESUMO_EXECUTIVO.md       # Este documento
│   ├── MAPA_VISUAL.md            # Você está aqui!
│   ├── arquitetura-dados-e-fluxos.md
│   └── containers-e-comandos.md
│
└── docker-compose.yml             # 4 serviços
```

---

## 🎭 Perfis de Usuário e Permissões

```
┌────────────────────────────────────────────────────────────────┐
│                         ADMIN                                   │
│  papel: 'admin'                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ CRUD COMPLETO:                                            │  │
│  │ • Quadras           • Bloqueios                           │  │
│  │ • Planos            • Aulas                               │  │
│  │ • Personals         • Alunos                              │  │
│  │ • Pagamentos (view) • Relatórios                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      PERSONAL / INSTRUTOR                       │
│  papel: 'personal' ou 'instrutor'                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ GERENCIAR:                                                │  │
│  │ • Disponibilidade (horários livres)                       │  │
│  │ • Sessões agendadas (visualizar/confirmar)                │  │
│  │ • Turmas (visualizar/presença)                            │  │
│  │ • Perfil próprio                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                          ALUNO                                  │
│  papel: 'aluno'                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PODE:                                                     │  │
│  │ • Reservar quadras                                        │  │
│  │ • Assinar/cancelar planos                                 │  │
│  │ • Inscrever-se em aulas                                   │  │
│  │ • Agendar sessões com personal                            │  │
│  │ • Visualizar histórico/pagamentos                         │  │
│  │ • Editar perfil próprio                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Reserva de Quadra (Anti-Overlap)

```
ALUNO
  │
  │ 1. Seleciona quadra
  │    GET /api/courts
  ▼
┌─────────────────────┐
│   Lista Quadras     │
│ [Quadra A] [B] [C]  │
└─────────┬───────────┘
          │
          │ 2. Seleciona data
          │    GET /api/courts/{id}/availability?date=2025-10-20
          ▼
┌─────────────────────┐
│  Disponibilidade    │
│ ✅ 08:00-09:00      │
│ ✅ 09:00-10:00      │
│ ❌ 10:00-11:00      │ ← Já reservado
│ ✅ 11:00-12:00      │
└─────────┬───────────┘
          │
          │ 3. Confirma horário
          │    POST /api/court-bookings
          │    { courtId, date, startTime, endTime }
          ▼
┌──────────────────────────────────────────────┐
│              BACKEND                         │
│  ReservaQuadraService                        │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Validar disponibilidade             │ │
│  │    - Quadra está ativa?                │ │
│  │    - Não está bloqueada?               │ │
│  │    - Horário dentro da operação?       │ │
│  │                                         │ │
│  │ 2. Verificar anti-overlap (DB)         │ │
│  │    SELECT * FROM reservas_quadra       │ │
│  │    WHERE id_quadra = ?                 │ │
│  │    AND periodo && tstzrange(?, ?)      │ │ ← Constraint GIST
│  │                                         │ │
│  │ 3. Calcular preço                      │ │
│  │    preco_hora * duração_em_horas       │ │
│  │                                         │ │
│  │ 4. Criar registro                      │ │
│  │    INSERT INTO reservas_quadra         │ │
│  │    status = 'pendente'                 │ │
│  └────────────────────────────────────────┘ │
└───────────────────┬──────────────────────────┘
                    │
                    │ ✅ Reserva criada
                    │ 201 Created
                    │ { id, courtId, startTime, ... }
                    ▼
                  ALUNO
                    │
                    │ 4. Confirma visualmente
                    │    Toast: "Reserva criada!"
                    │    Redireciona para lista de reservas
```

---

## 📊 Tabelas Principais do Banco

```sql
usuarios
├── id_usuario (PK)
├── nome
├── email (UNIQUE)
├── senha_hash
├── papel ('admin'|'aluno'|'personal'|'instrutor')
└── status ('ativo'|'inativo')

planos
├── id_plano (PK)
├── nome
├── preco
├── ciclo_cobranca ('mensal'|'trimestral'|'anual')
└── max_reservas_futuras

assinaturas
├── id_assinatura (PK)
├── id_usuario (FK → usuarios)
├── id_plano (FK → planos)
├── data_inicio
├── data_fim
└── status ('ativa'|'cancelada'|'expirada')

quadras
├── id_quadra (PK)
├── nome
├── localizacao
├── esporte
├── preco_hora
└── status ('ativa'|'inativa')

reservas_quadra
├── id_reserva_quadra (PK)
├── id_quadra (FK → quadras)
├── id_usuario (FK → usuarios)
├── inicio (TIMESTAMPTZ)
├── fim (TIMESTAMPTZ)
├── periodo (TSTZRANGE) ← GENERATED COLUMN
├── preco_total
└── status ('pendente'|'confirmada'|'cancelada')
    CONSTRAINT: EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&)
                ↑ Anti-overlap automático!

instrutores
├── id_instrutor (PK)
├── id_usuario (FK → usuarios, nullable)
├── nome
├── email
├── cref
└── valor_hora

sessoes_personal
├── id_sessao_personal (PK)
├── id_instrutor (FK → instrutores)
├── id_usuario (FK → usuarios)
├── inicio
├── fim
├── periodo (TSTZRANGE)
└── status
    CONSTRAINT: EXCLUDE USING gist (id_instrutor WITH =, periodo WITH &&)
                ↑ Personal não pode ter 2 sessões ao mesmo tempo

aulas
├── id_aula (PK)
├── nome
├── esporte
├── nivel
├── duracao_min
├── capacidade_max
└── preco_unitario

ocorrencias_aula
├── id_ocorrencia_aula (PK)
├── id_aula (FK → aulas)
├── id_instrutor (FK → instrutores)
├── id_quadra (FK → quadras)
├── inicio
├── fim
└── status
    CONSTRAINT: EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&)
                ↑ Quadra não pode ter 2 aulas ao mesmo tempo

inscricoes_aula
├── id_inscricao_aula (PK)
├── id_ocorrencia_aula (FK → ocorrencias_aula)
├── id_aula (FK → aulas)
├── id_usuario (FK → usuarios)
└── status ('inscrito'|'cancelado'|'presente')
    UNIQUE (id_ocorrencia_aula, id_usuario)
    ↑ Aluno não pode se inscrever 2x na mesma aula

pagamentos
├── id_pagamento (PK)
├── id_usuario (FK → usuarios)
├── valor_total
├── status ('pendente'|'pago'|'falhou')
└── provedor ('mercadopago'|'stripe'|...)

itens_pagamento
├── id_item_pagamento (PK)
├── id_pagamento (FK → pagamentos)
├── referencia_tipo ('assinatura'|'reserva_quadra'|...)
├── referencia_id (ID do item)
└── valor
```

---

## 🎯 Endpoints por Perfil

### 🔓 Público (Sem autenticação)
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/public/courts
GET    /api/public/courts/{id}/availability
POST   /api/public/court-bookings  (reserva de convidado)
```

### 🔐 Autenticado (Qualquer usuário logado)
```
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/courts
GET    /api/courts/{id}/availability
```

### 👤 ALUNO
```
POST   /api/court-bookings          (reservar quadra)
GET    /api/court-bookings/me       (minhas reservas)
DELETE /api/court-bookings/{id}     (cancelar)

GET    /api/plans                   (listar planos)
POST   /api/subscriptions           (assinar)
GET    /api/subscriptions/me        (minha assinatura)
DELETE /api/subscriptions/me        (cancelar)

GET    /api/classes                 (listar aulas)
POST   /api/classes/{id}/enroll     (inscrever-se)
DELETE /api/classes/{id}/enroll     (cancelar inscrição)

GET    /api/personals               (listar personals)
GET    /api/personals/{id}/availability
POST   /api/personals/{id}/sessions (agendar sessão)
DELETE /api/personals/sessions/{id} (cancelar)

GET    /api/profile                 (meu perfil)
PATCH  /api/profile                 (atualizar)
```

### 💪 PERSONAL
```
GET    /api/personal/sessions       (minhas sessões)
PATCH  /api/personal/sessions/{id}  (confirmar/cancelar)

GET    /api/personal/availability   (minha disponibilidade)
POST   /api/personal/availability   (criar slot)
DELETE /api/personal/availability/{id}

GET    /api/personal/classes        (minhas turmas)
```

### 👨‍💼 ADMIN
```
GET    /api/admin/courts
POST   /api/admin/courts
PATCH  /api/admin/courts/{id}
DELETE /api/admin/courts/{id}

GET    /api/admin/plans
POST   /api/admin/plans
PATCH  /api/admin/plans/{id}
DELETE /api/admin/plans/{id}

GET    /api/admin/classes
POST   /api/admin/classes
PATCH  /api/admin/classes/{id}
DELETE /api/admin/classes/{id}

GET    /api/admin/personals
POST   /api/admin/personals
PATCH  /api/admin/personals/{id}
DELETE /api/admin/personals/{id}

GET    /api/admin/students
POST   /api/admin/students
PATCH  /api/admin/students/{id}
DELETE /api/admin/students/{id}

GET    /api/admin/payments          (visão geral)
GET    /api/admin/court-bookings    (todas reservas)
GET    /api/admin/subscriptions     (todas assinaturas)
```

---

## 🚀 Como Começar AGORA

### 1️⃣ Subir o ambiente
```powershell
cd C:\laragon\www\tccFitway
docker-compose up -d db api frontend-dev
```

### 2️⃣ Verificar se tudo subiu
```powershell
docker-compose ps
# Todos devem estar "Up"
```

### 3️⃣ Rodar migrations
```powershell
docker-compose exec api php artisan migrate
```

### 4️⃣ Abrir URLs
- Frontend Dev: http://localhost:5173
- API: http://localhost:8000/api/healthz
- pgAdmin: http://localhost:5050 (admin@fitway.com / admin123)

### 5️⃣ Começar Fase 1: Autenticação
Seguir o **PLANO_DE_ACAO.md** → Fase 1

---

## 📞 Suporte

**Documentos**:
- `.github/copilot-instructions.md` - Guia completo
- `docs/PLANO_DE_ACAO.md` - Código e passo a passo
- `docs/RESUMO_EXECUTIVO.md` - Visão geral
- `docs/MAPA_VISUAL.md` - Este arquivo

**Comandos úteis**:
- `docker-compose logs -f api` - Ver logs da API
- `docker-compose exec api php artisan route:list` - Listar rotas
- `docker-compose exec db psql -U fitway_user -d fitway_db` - Acessar DB

---

**Criado**: 15 de outubro de 2025  
**Versão**: 1.0
