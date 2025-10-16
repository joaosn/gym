# 🎯 Plano de Ação: Fitway - Desenvolvimento Full Stack

**Última Atualização**: 15 de outubro de 2025  
**Versão**: 2.0 (Revisado e Enxuto)

---

## 📊 Visão Geral do Projeto

**Fitway** é um sistema completo de gestão de academia/centro esportivo com foco em:
- 🏐 Quadras de beach tennis
- 👥 Aulas em grupo
- 💪 Personal trainers (sessões 1:1)
- 💳 Assinaturas e pagamentos

### Stack Tecnológica
- **Backend**: Laravel 10 + PHP 8.4 + PostgreSQL 16 (Docker)
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Autenticação**: Laravel Sanctum (Bearer Token)
- **Padrão**: Soft Delete (status='excluido')

---

## ✅ FASES CONCLUÍDAS (7 fases + 2 refatorações)

| # | Feature | Backend | Frontend | Doc |
|---|---------|---------|----------|-----|
| **1** | **Autenticação** | AuthController, Sanctum, Middleware | LoginPage, auth.service.ts | [📄](./FASE_1_CONCLUIDA.md) |
| **2** | **Admin - Quadras** | QuadraController, CRUD | Courts.tsx, courts.service.ts | [📄](./FASE_2_CONCLUIDA.md) |
| **3** | **Admin - Planos** | PlanoController, CRUD, Seeder | Plans.tsx, plans.service.ts | [📄](./FASE_3_CONCLUIDA.md) |
| **4** | **Admin - Usuários** | UserController, CRUD, Soft Delete | Users.tsx, users.service.ts | [📄](./FASE_4_CONCLUIDA.md) |
| **5** | **Admin - Instrutores** | InstrutorController, CRUD, Soft Delete | Instructors.tsx, instructors.service.ts | [📄](./FASE_5_CONCLUIDA.md) |
| **6** | **Soft Delete** | 3 controllers atualizados | Transparente (DELETE → 204) | [📄](./FASE_6_SOFT_DELETE.md) |
| **7** | **Disponibilidade Instrutor** | updateAvailability endpoint | Modal horários integrado | ✅ Já estava feito! |
| **-** | **Unificação Personal→Instrutor** | papel CHECK constraint | Rotas /instrutor/*, Types | [📄](./UNIFICACAO_PERSONAL_INSTRUTOR.md) |
| **-** | **DDL Atualizado** | CHECK constraints + changelog | - | [📄](./DDL_CHANGELOG.md) |

### 🎯 Achievements
- ✅ **9 documentos** de fase criados
- ✅ **5 CRUDs** completos (Quadras, Planos, Usuários, Instrutores + Auth)
- ✅ **Disponibilidade de Instrutores** funcionando (CRUD dentro do modal)
- ✅ **Soft Delete** padrão do sistema
- ✅ **3 papéis** unificados: admin, aluno, instrutor
- ✅ **23 utilitários UX** criados (formatCurrency, formatDate, etc)

---

## 🗺️ ROADMAP - PRÓXIMAS FASES (Ordem Lógica)

###  Fase 8: Sessões Personal 1:1 (PRÓXIMA)
**Objetivo**: Aluno agenda sessão com instrutor (anti-overlap).

**Por quê agora?**
- Disponibilidade já está pronta (Fase 7 ✅)
- Usa anti-overlap (TSTZRANGE) - conceito crítico
- Base para outras reservas

**Backend**:
- [ ] Model `SessaoPersonal`
- [ ] `SessaoPersonalController`
  - Aluno: `store()` criar sessão, `index()` listar minhas, `destroy()` cancelar
  - Instrutor: `index()` listar minhas sessões
  - Admin: `index()` listar todas
- [ ] Service: Validar anti-overlap (constraint GIST por instrutor)
- [ ] Validações:
  - Horário dentro da disponibilidade do instrutor
  - Não sobrepor com outras sessões do instrutor
  - Calcular preço (instrutor.valor_hora * duração)
- [ ] Routes:
  - GET/POST `/sessions` (aluno)
  - GET `/instrutor/sessions` (instrutor)
  - GET `/admin/sessions` (admin)

**Frontend**:
- [ ] Student: `PersonalTrainers.tsx` (buscar, agendar)
- [ ] Student: `MySessions.tsx` (listar, cancelar)
- [ ] Instrutor: `Schedule.tsx` (ver agenda, confirmar)
- [ ] Types: `PersonalSession`

**Tempo Estimado**: 3-4 dias

---

### 📅 Fase 9: Reservas de Quadras
**Objetivo**: Aluno reserva quadras (anti-overlap).

**Por quê agora?**
- Quadras CRUD já existe (Fase 2)
- Aplica anti-overlap (aprendido na Fase 8)

**Backend**:
- [ ] Model `ReservaQuadra`
- [ ] `ReservaQuadraController`
  - Aluno: `store()` criar, `index()` minhas reservas, `destroy()` cancelar
  - Admin: `index()` todas reservas
- [ ] Service: Validar anti-overlap (constraint GIST por quadra)
- [ ] Validações:
  - Quadra ativa
  - Não sobrepor com outras reservas
  - Calcular preço (quadra.preco_hora * duração)
  - Verificar limite de reservas do plano (se tiver assinatura)
- [ ] Routes:
  - GET/POST `/court-bookings` (aluno)
  - GET `/admin/court-bookings` (admin)

**Frontend**:
- [ ] Student: `Courts.tsx` (ver disponibilidade, reservar)
- [ ] Student: `MyBookings.tsx` (listar, cancelar)
- [ ] Admin: `CourtBookings.tsx` (listar todas)
- [ ] Types: `CourtBooking`

**Tempo Estimado**: 2-3 dias

---

### 📅 Fase 10: Aulas (Turmas em Grupo)
**Objetivo**: Admin cria aulas, aluno se inscreve.

**Por quê agora?**
- Mais complexa (recorrência semanal + ocorrências)
- Depende de Quadras (local das aulas)

**Backend**:
- [ ] Models: `Aula`, `HorarioAula`, `OcorrenciaAula`, `InscricaoAula`
- [ ] `AulaController` (CRUD aulas)
- [ ] `HorarioAulaController` (configurar horários semanais)
- [ ] `OcorrenciaController` (gerar ocorrências concretas no calendário)
- [ ] `InscricaoController` (aluno inscrever/cancelar)
- [ ] Service: Gerador de ocorrências (recorrência semanal)
- [ ] Validações:
  - Capacidade máxima
  - Anti-overlap de quadra (se usar quadra)
  - Anti-overlap de instrutor
- [ ] Routes:
  - GET/POST/PUT/DELETE `/admin/classes`
  - GET/POST `/class-enrollments` (aluno)

**Frontend**:
- [ ] Admin: `Classes.tsx` (CRUD aulas + horários)
- [ ] Admin: `ClassSchedule.tsx` (gerar ocorrências)
- [ ] Student: `AvailableClasses.tsx` (buscar, inscrever)
- [ ] Student: `MyClasses.tsx` (minhas inscrições)
- [ ] Types: `Class`, `ClassSchedule`, `ClassOccurrence`, `ClassEnrollment`

**Tempo Estimado**: 5-6 dias

---

### 📅 Fase 11: Assinaturas
**Objetivo**: Conectar aluno ao plano (assinatura mensal/trimestral/anual).

**Por quê agora?**
- Planos CRUD já existe (Fase 3)
- Necessário para limitar reservas (max_reservas_futuras)

**Backend**:
- [ ] Models: `Assinatura`, `EventoAssinatura`
- [ ] `AssinaturaController`
  - Aluno: `store()` assinar, `show()` ver minha, `destroy()` cancelar
  - Admin: `index()` listar todas, `update()` editar
- [ ] Validações:
  - Apenas 1 assinatura ativa por usuário
  - Calcular proximo_vencimento (data_inicio + ciclo_cobranca)
  - Registrar eventos (criada, renovada, cancelada)
- [ ] Routes:
  - GET/POST `/subscriptions/me` (aluno)
  - GET/PUT `/admin/subscriptions` (admin)

**Frontend**:
- [ ] Student: `Plans.tsx` (escolher plano, assinar)
- [ ] Student: `MyPlan.tsx` (ver assinatura, cancelar)
- [ ] Admin: `Subscriptions.tsx` (listar, gerenciar)
- [ ] Types: `Subscription`, `SubscriptionEvent`

**Tempo Estimado**: 2-3 dias

---

### 📅 Fase 12: Pagamentos (Básico)
**Objetivo**: Registrar pagamentos (simulação ou integração real).

**Por quê agora?**
- Monetização do sistema
- Conecta com Assinaturas, Reservas, Sessões

**Backend**:
- [ ] Models: `Pagamento`, `ItemPagamento`, `WebhookPagamento`
- [ ] `PagamentoController`
  - `store()` criar checkout (assinatura/reserva/sessão)
  - `webhook()` receber notificações do gateway
- [ ] Integrações (opcional):
  - Stripe, Mercado Pago, PagSeguro
- [ ] Routes:
  - POST `/payments/checkout`
  - POST `/payments/webhook` (público)

**Frontend**:
- [ ] `CheckoutPage.tsx` (simulação ou formulário real)
- [ ] Student: `PaymentHistory.tsx` (histórico)
- [ ] Types: `Payment`, `PaymentItem`

**Tempo Estimado**: 4-5 dias

---

### 📅 Fase 13: Refinamentos e Testes
**Objetivo**: Polimento, testes, deploy.

**Tarefas**:
- [ ] Testes de integração (PHPUnit)
- [ ] Validações de UX em todas páginas
- [ ] Paginação em listagens longas
- [ ] Filtros avançados
- [ ] Documentação final (README, API docs)
- [ ] Deploy (opcional)

**Tempo Estimado**: 3-4 dias

---

## 📅 Cronograma Estimado

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| **1-6** | **Concluídas** | **~10 dias** | ✅ **FEITO** |
| **7** | Disponibilidade Instrutor | 1-2 dias | 🎯 **PRÓXIMA** |
| **8** | Sessões Personal 1:1 | 3-4 dias | 🔴 Pendente |
| **9** | Reservas de Quadras | 2-3 dias | 🔴 Pendente |
| **10** | Aulas (Turmas) | 5-6 dias | 🔴 Pendente |
| **11** | Assinaturas | 2-3 dias | 🔴 Pendente |
| **12** | Pagamentos | 4-5 dias | 🔴 Pendente |
| **13** | Refinamentos | 3-4 dias | 🔴 Pendente |

**Total Estimado**: ~30-37 dias úteis (~6-7 semanas)  
**Já Completado**: ~10 dias (Fases 1-6)  
**Restante**: ~20-27 dias

---

## ✅ Checklist de Validação (Aplicar em Cada Fase)

### Backend
- [ ] Model criado com `protected $table`, `$fillable`, `CREATED_AT`, `UPDATED_AT`
- [ ] Controller com métodos RESTful (index, show, store, update, destroy)
- [ ] **Soft Delete**: `$model->update(['status' => 'excluido'])` no destroy()
- [ ] **Filtro**: `->where('status', '!=', 'excluido')` no index()
- [ ] Form Requests com validações e mensagens em português
- [ ] Rotas com middleware `auth:sanctum` e `role:admin/aluno/instrutor`
- [ ] Seeder com dados de teste
- [ ] Testar via `php artisan route:list` e Postman

### Frontend
- [ ] Types/Interfaces em `types/index.ts`
- [ ] Service methods em `services/*.service.ts`
- [ ] Página React conectada (useState/useQuery)
- [ ] **Formatação UX**: `formatCurrency()`, `formatDate()`, `formatPhone()`, `formatCPF()`
- [ ] Loading states (Skeleton, Spinner)
- [ ] Toast de sucesso/erro
- [ ] Modal criar/editar
- [ ] AlertDialog para confirmação de exclusão
- [ ] Filtros com `value="all"` (não "")
- [ ] Testado no navegador (http://localhost:5173)

### Documentação
- [ ] Criar `docs/FASE_X_CONCLUIDA.md` com:
  - Arquivos criados/modificados
  - Comandos executados
  - Endpoints testados
  - Como testar no browser

---

## 📚 Referências Importantes

### Documentação
- **DDL**: `api/database/ddl.sql` ← **FONTE DA VERDADE**
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Arquitetura**: `docs/arquitetura-dados-e-fluxos.md`
- **Docker**: `docs/containers-e-comandos.md`

### Comandos Essenciais

```powershell
# Subir ambiente
docker-compose up -d db api frontend-dev

# Ver logs
docker-compose logs -f api

# Artisan commands
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed --class=NomeSeeder
docker-compose exec api php artisan route:list
docker-compose exec api php artisan make:controller NomeController
docker-compose exec api php artisan make:model Nome

# Acessar PostgreSQL
docker-compose exec db psql -U fitway_user -d fitway_db

# Rebuild containers
docker-compose up -d --force-recreate api
```

### URLs
- API: http://localhost:8000
- Frontend Dev: http://localhost:5173
- Frontend Prod: http://localhost:3000
- pgAdmin: http://localhost:5050

---

## 🎯 Próximos Passos Imediatos

### 🚀 AGORA: Fase 7 - Disponibilidade Instrutor

**1. Backend** (1 dia):
```powershell
# Criar Model
docker-compose exec api php artisan make:model DisponibilidadeInstrutor

# Criar Controller
docker-compose exec api php artisan make:controller Instrutor/DisponibilidadeController --resource

# Criar Form Requests
docker-compose exec api php artisan make:request CreateDisponibilidadeRequest
docker-compose exec api php artisan make:request UpdateDisponibilidadeRequest

# Registrar rotas em api/routes/api.php
# Route::middleware(['auth:sanctum', 'role:instrutor'])->prefix('instrutor')->group(...)

# Criar Seeder (dados de teste)
docker-compose exec api php artisan make:seeder DisponibilidadeSeeder
docker-compose exec api php artisan db:seed --class=DisponibilidadeSeeder
```

**2. Frontend** (1 dia):
```bash
# Criar types em web/src/types/index.ts
# Criar service em web/src/services/availability.service.ts
# Criar página em web/src/pages/instrutor/Availability.tsx
# Testar em http://localhost:5173/instrutor/availability
```

**3. Documentação**:
```bash
# Criar docs/FASE_7_CONCLUIDA.md após testar tudo
```

---

**Criado em**: 15 de outubro de 2025  
**Última Revisão**: 15 de outubro de 2025  
**Versão**: 2.0 - Enxuto e Consistente
