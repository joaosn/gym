# 📊 Resumo Executivo - Implementação Fitway

## 🎯 Objetivo
Substituir todos os mocks do frontend por funcionalidades reais conectadas à API Laravel com PostgreSQL.

---

## 📋 Estado Atual

### ✅ Já Implementado
- ✅ Infraestrutura Docker (DB, API, Frontend Dev/Prod)
- ✅ DDL completo do banco (PostgreSQL com constraints anti-overlap)
- ✅ Frontend React com TypeScript + TailwindCSS + shadcn/ui
- ✅ Cliente HTTP configurado (`api-client.ts`)
- ✅ Roteamento com ProtectedRoute (validação de roles)
- ✅ Services parcialmente implementados (chamam API, mas API não existe)

### ❌ Pendente (Mocks)
- ❌ Autenticação (login/register mockado)
- ❌ Todas as páginas de aluno (dashboard, quadras, aulas, personal, planos, perfil)
- ❌ Todas as páginas de personal (agenda, disponibilidade, turmas)
- ❌ Todas as páginas de admin (CRUD de tudo)
- ❌ Reserva pública de quadras

---

## 🚀 Plano de Execução (Faseado)

### 🔴 Fase 1: Autenticação (PRIORIDADE MÁXIMA) - 2-3 dias
**Backend**:
- Model `Usuario` (Laravel)
- `AuthController` com login/register/logout/me
- Form Requests (validação)
- Rotas públicas `/auth/*` e protegidas (Sanctum)
- Seeder com 3 usuários teste (admin, personal, aluno)

**Frontend**:
- Remover mock de `auth.service.ts`
- Conectar à API real
- Testar login/logout com 3 perfis

**Entregável**: Sistema de autenticação funcional end-to-end.

---

### 🟠 Fase 2: Admin - Quadras - 2 dias
**Backend**:
- Model `Quadra`
- `Admin\QuadraController` (CRUD completo)
- Middleware `CheckRole` (validar papel admin)
- Rotas `/admin/courts`

**Frontend**:
- Conectar `AdminCourts.tsx` à API
- Conectar `AddCourt.tsx` e `EditCourt.tsx`
- Usar React Query (useQuery, useMutation)

**Entregável**: Admin consegue criar/editar/listar/deletar quadras.

---

### 🟡 Fase 3: Admin - Planos - 1-2 dias
**Backend**:
- Model `Plano`
- `Admin\PlanoController` (CRUD)
- Rotas `/admin/plans`

**Frontend**:
- Conectar `AdminPlans.tsx`
- Conectar `AddPlan.tsx` e `EditPlan.tsx`

**Entregável**: Admin gerencia planos de assinatura.

---

### 🔵 Fase 4: Aluno - Reservas de Quadras - 3 dias
**Backend**:
- Model `ReservaQuadra`
- `ReservaQuadraService` (anti-overlap, cálculo de preço)
- `ReservaQuadraController` (criar/cancelar/listar)
- Endpoint de disponibilidade `/courts/{id}/availability`

**Frontend**:
- Conectar `StudentCourts.tsx` (listar quadras + disponibilidade)
- Implementar fluxo de reserva
- Conectar `PublicReservePage.tsx` (reserva sem login)

**Entregável**: Aluno consegue reservar quadras com validação de conflitos.

---

### 🟢 Fase 5: Aluno - Planos/Assinaturas - 2 dias
**Backend**:
- Model `Assinatura` + `EventoAssinatura`
- `AssinaturaController` (assinar/cancelar)
- Endpoint `/subscriptions/me` (plano atual)

**Frontend**:
- Conectar `StudentPlans.tsx`
- Implementar fluxo de assinatura

**Entregável**: Aluno visualiza e gerencia sua assinatura.

---

### 🟣 Fase 6: Admin - Aulas (Turmas) - 3 dias
**Backend**:
- Models `Aula`, `HorarioAula`, `OcorrenciaAula`
- `Admin\AulaController` (CRUD)
- Service para gerar ocorrências (agenda semanal)

**Frontend**:
- Conectar `AdminClasses.tsx`
- Conectar `AddClass.tsx` e `EditClass.tsx`

**Entregável**: Admin gerencia aulas em grupo.

---

### 🔴 Fase 7: Aluno - Aulas - 2 dias
**Backend**:
- Model `InscricaoAula`
- `InscricaoAulaController` (inscrever/cancelar)
- Validar capacidade máxima

**Frontend**:
- Conectar `StudentClasses.tsx`
- Implementar inscrição/cancelamento

**Entregável**: Aluno se inscreve em aulas disponíveis.

---

### 🟠 Fase 8: Admin - Personal Trainers - 2 dias
**Backend**:
- Model `Instrutor`
- `Admin\InstrutorController` (CRUD)

**Frontend**:
- Conectar `AdminPersonals.tsx`
- Conectar `AddPersonal.tsx` e `EditPersonal.tsx`

**Entregável**: Admin gerencia cadastro de personals.

---

### 🟡 Fase 9: Personal - Disponibilidade - 2 dias
**Backend**:
- Model `DisponibilidadeInstrutor`
- `Personal\DisponibilidadeController` (CRUD)

**Frontend**:
- Conectar `PersonalSlots.tsx`

**Entregável**: Personal define horários disponíveis.

---

### 🔵 Fase 10: Aluno - Sessões Personal - 3 dias
**Backend**:
- Model `SessaoPersonal`
- `SessaoPersonalService` (anti-overlap)
- `SessaoPersonalController` (agendar/cancelar)

**Frontend**:
- Conectar `StudentPersonal.tsx`
- Implementar agendamento

**Entregável**: Aluno agenda sessões 1:1 com personal.

---

### 🟢 Fase 11: Pagamentos (MVP) - 4 dias
**Backend**:
- Model `Pagamento` + `ItemPagamento`
- `PagamentoController` (checkout simulado)
- Webhook básico (estrutura)

**Frontend**:
- Página de checkout
- Confirmação de pagamento

**Entregável**: Fluxo básico de pagamento (sem gateway real).

---

### 🟣 Fase 12: Refinamentos - 3 dias
- Testes end-to-end
- Correção de bugs
- Melhorias de UX
- Documentação final

---

## ⏱️ Cronograma Estimado

| Fase | Dias | Acumulado |
|------|------|-----------|
| 1. Autenticação | 2-3 | 3 |
| 2. Admin Quadras | 2 | 5 |
| 3. Admin Planos | 1-2 | 7 |
| 4. Aluno Reservas | 3 | 10 |
| 5. Aluno Assinaturas | 2 | 12 |
| 6. Admin Aulas | 3 | 15 |
| 7. Aluno Aulas | 2 | 17 |
| 8. Admin Personals | 2 | 19 |
| 9. Personal Disponibilidade | 2 | 21 |
| 10. Aluno Sessões Personal | 3 | 24 |
| 11. Pagamentos MVP | 4 | 28 |
| 12. Refinamentos | 3 | 31 |

**Total**: ~31 dias úteis (~6-7 semanas)

---

## 🎯 Marcos de Validação

### Marco 1 (Semana 1) ✅
- [ ] Autenticação funcionando (login de 3 perfis)
- [ ] Admin cria/edita quadras

### Marco 2 (Semana 2-3) ✅
- [ ] Admin cria/edita planos
- [ ] Aluno reserva quadra
- [ ] Aluno assina plano

### Marco 3 (Semana 4-5) ✅
- [ ] Admin cria/edita aulas
- [ ] Aluno se inscreve em aula
- [ ] Admin cadastra personals

### Marco 4 (Semana 6-7) ✅
- [ ] Personal define disponibilidade
- [ ] Aluno agenda sessão personal
- [ ] Pagamento básico funciona

---

## 🛠️ Stack & Ferramentas

### Backend
- Laravel 10 + PHP 8.4
- PostgreSQL 16 (Docker)
- Laravel Sanctum (autenticação)
- Form Requests (validação)
- Services (lógica de negócio)

### Frontend
- React 18 + TypeScript
- Vite (HMR)
- TailwindCSS + shadcn/ui
- React Query (server state)
- React Router (navegação)

### DevOps
- Docker Compose
- Nginx (API e Frontend Prod)
- pgAdmin (gestão DB)
- Vite Dev Server (HMR)

---

## 📦 Comandos Rápidos

```powershell
# Subir ambiente completo
docker-compose up -d db api frontend-dev

# Migrations + Seeders
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed

# Ver logs
docker-compose logs -f api
docker-compose logs -f frontend-dev

# Acessar containers
docker-compose exec api sh
docker-compose exec db psql -U fitway_user -d fitway_db
```

**URLs**:
- API: http://localhost:8000
- Frontend Dev: http://localhost:5173
- pgAdmin: http://localhost:5050

---

## 📚 Documentos de Referência

1. **Copilot Instructions**: `.github/copilot-instructions.md` (guia completo do projeto)
2. **Plano de Ação Detalhado**: `docs/PLANO_DE_ACAO.md` (este documento expandido)
3. **Arquitetura**: `docs/arquitetura-dados-e-fluxos.md`
4. **Docker**: `docs/containers-e-comandos.md`
5. **DDL**: `api/database/ddl.sql` (fonte da verdade)

---

## ✅ Próximo Passo Imediato

**COMEÇAR FASE 1 AGORA**:

1. Criar Model `Usuario` no Laravel
2. Criar `AuthController` com login/register/logout/me
3. Configurar Sanctum + CORS
4. Criar seeder de usuários teste
5. Remover mock de `auth.service.ts`
6. Testar login no navegador

**Tempo estimado**: 1 dia de foco total.

---

**Criado**: 15 de outubro de 2025  
**Autor**: Equipe Fitway + Copilot
