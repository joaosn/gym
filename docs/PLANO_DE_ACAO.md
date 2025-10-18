# 🎯 Plano de Ação: Fitway - Desenvolvimento Full Stack

**Última Atualização**: 18 de outubro de 2025  
**Versão**: 2.2 (Fase 9 Concluída + Integração Fase 8)

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

## ✅ FASES CONCLUÍDAS (9 fases + 2 refatorações)

| # | Feature | Backend | Frontend | Doc |
|---|---------|---------|----------|-----|
| **1** | **Autenticação** | AuthController, Sanctum, Middleware | LoginPage, auth.service.ts | [📄](./FASE_1.md) |
| **2** | **Admin - Quadras** | QuadraController, CRUD | Courts.tsx, courts.service.ts | [📄](./FASE_2.md) |
| **3** | **Admin - Planos** | PlanoController, CRUD, Seeder | Plans.tsx, plans.service.ts | [📄](./FASE_3.md) |
| **4** | **Admin - Usuários** | UserController, CRUD, Soft Delete | Users.tsx, users.service.ts | [📄](./FASE_4.md) |
| **5** | **Admin - Instrutores** | InstrutorController, CRUD, Soft Delete | Instructors.tsx, instructors.service.ts | [📄](./FASE_5.md) |
| **6** | **Soft Delete** | 3 controllers atualizados | Transparente (DELETE → 204) | [📄](./FASE_6.md) |
| **7** | **Disponibilidade Instrutor** | updateAvailability endpoint | Modal horários integrado | [📄](./FASE_7.md) |
| **8** | **Sessões Personal 1:1** | SessaoPersonalController, 4 validações | PersonalSessions.tsx, CRUD completo | [📄](./FASE_8.md) |
| **8.1** | **Integração Sessão→Quadra** | Auto-criação de ReservaQuadra, FK id_sessao_personal, Bug fix dia_semana | Transparente (backend) | [📄](./FASE_8.md#integração-sessão-personal-auto-cria-reserva-de-quadra) |
| **9** | **Reservas de Quadras** | ReservaQuadraController, 8 endpoints, 3 validações | CourtBookings.tsx (3 páginas), ApiError pattern | [📄](./FASE_9.md) |

### 🎯 Achievements
- ✅ **12 documentos** de fase criados
- ✅ **7 CRUDs** completos (Quadras, Planos, Usuários, Instrutores, Sessões Personal, Reservas + Auth)
- ✅ **7 Validações Anti-Overlap**: Instrutor (2), Disponibilidade Semanal (1), Quadra vs Reservas (1), Quadra vs Sessões (1), Aluno (2)
- ✅ **Integração Sessão↔Quadra**: Auto-criação de reservas quando sessão usa quadra
- ✅ **ApiError Pattern**: Preserva erros de validação do backend (422)
- ✅ **formatValidationErrors()**: Helper i18n para exibição de erros
- ✅ **Disponibilidade de Instrutores** funcionando (CRUD dentro do modal)
- ✅ **Soft Delete** padrão do sistema
- ✅ **3 papéis** unificados: admin, aluno, instrutor
- ✅ **23 utilitários UX** criados (formatCurrency, formatDate, etc)
- ✅ **Estrutura Organizada**: Páginas admin por contexto (cadastros/agendamentos/payments)
- ✅ **failedValidation() Pattern**: Todos FormRequests retornam JSON 422 em vez de redirect 302
- ✅ **DB Transactions**: Service usa transações para garantir atomicidade (sessão + reserva)

---

## 🗺️ ROADMAP - PRÓXIMAS FASES (Ordem Lógica)

### ✅ Fase 8: Sessões Personal 1:1 (CONCLUÍDA)
**Objetivo**: Aluno agenda sessão com instrutor (anti-overlap).

**Backend**:
- ✅ Model `SessaoPersonal` + `ReservaQuadra`
- ✅ `SessaoPersonalController` (8 endpoints)
- ✅ Service com **4 validações de conflito**:
  - Instrutor (anti-overlap)
  - Disponibilidade semanal do instrutor
  - Quadra (reservas + outras sessões)
  - Aluno (anti-overlap)
- ✅ Form Requests (validação)
- ✅ Seeder com 12 registros

**Frontend**:
- ✅ Admin: `PersonalSessions.tsx` (CRUD completo)
- ✅ Filtros: status, período, instrutor
- ✅ Service: `personal-sessions.service.ts`
- ✅ Fix bug Radix UI Select
- ✅ Layout com padding

**Refactor**:
- ✅ Estrutura organizada por contexto (cadastros/agendamentos/payments)
- ✅ Barrel exports (index.ts)
- ✅ README.md criado

**Tempo Real**: 1 dia (16/10/2025)  
**Doc**: [📄 FASE_8.md](./FASE_8.md)

---

### ✅ Fase 9: Reservas de Quadras (CONCLUÍDA)
**Objetivo**: Aluno reserva quadras (anti-overlap).

**Implementado**:
- ✅ Backend (8 REST endpoints):
  - Model `ReservaQuadra` com relacionamentos
  - `ReservaQuadraController`: index, show, store, update, destroy, confirm, checkAvailability, myBookings
  - `ReservaQuadraService`: 3 validações (quadra ativa, anti-overlap reservas, anti-overlap sessões)
  - FormRequests com `failedValidation()` override (CreateReservaQuadraRequest, UpdateReservaQuadraRequest)
  - Routes registradas (específicas antes de apiResource)
  - Seeder com 12 reservas de exemplo

- ✅ Frontend (3 páginas role-based):
  - Admin: CRUD completo com seleção de usuário
  - Student: Criar/cancelar apenas para si mesmo
  - Personal: Visualização read-only
  - `ApiError` class para preservar erros de validação
  - `formatValidationErrors()` helper para i18n
  - UX: 1 campo data + 2 campos hora (em vez de datetime-local)
  - Normalização de IDs (number → string) para shadcn/ui Select

- ✅ Bugs corrigidos (5):
  - CORS/302 redirect → JSON 422 com failedValidation()
  - Edit modal não pré-selecionava → normalização de IDs
  - Route ordering → específicas antes de genéricas
  - Erros de validação não exibiam → ApiError class
  - Admin sem campo usuario → adicionado Select

**TODO Crítico (integração com Fase 8)**:
- ✅ Sessões Personal com quadra devem auto-criar ReservaQuadra (CONCLUÍDO!)
- ✅ Adicionar FK `id_sessao_personal` em `reservas_quadra` (MIGRATION EXECUTADA!)
- ✅ Atualizar `SessaoPersonalController`: store(), update(), destroy() (SINCRONIZADO!)
- ✅ Validar disponibilidade da quadra antes de criar sessão (SERVICE ATUALIZADO!)
- ✅ Cascade delete: sessão deletada = reserva deletada (FK CASCADE!)
- ✅ Bug fix: mapeamento `dia_semana` (Carbon 0-6 → ISO 1-7)
- ✅ 5 testes de integração passando (criar, remover quadra, re-adicionar, atualizar, cancelar)

**Doc**: [📄 FASE_8.md](./FASE_8.md#integração-sessão-personal-auto-cria-reserva-de-quadra)

**Tempo Real**: 3 dias (17-19/10/2025)  
**Doc**: [📄 FASE_9.md](./FASE_9.md)

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
