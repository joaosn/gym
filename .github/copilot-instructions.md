# Copilot Instructions - Fitway Project

> **Atualizado**: 16 de outubro de 2025 | **Fases Concluídas**: 7/13

---

## 📚 DOCUMENTAÇÃO: Quando e Como Criar

### ⚠️ REGRA IMPORTANTE: Não Documentar Durante o Desenvolvimento

**❌ NÃO FAÇA**:
- Criar arquivos de documentação intermediários (RESUMO_X, TESTE_X, ANTES_DEPOIS_X)
- Documentar cada passo do processo
- Gerar múltiplos arquivos para a mesma fase
- Criar documentos de análise temporária
- **Commitar automaticamente sem confirmar**
- **Criar documentação sem perguntar antes**

**✅ FAÇA**:
- **Documente APENAS quando a fase estiver 100% COMPLETA**
- Crie **1 único arquivo** por fase: `docs/FASE_X.md`
- Teste tudo antes de documentar
- Inclua no documento da fase: Backend + Frontend + Como Testar + Lições Aprendidas
- **SEMPRE PERGUNTE ao usuário antes de commitar**
- **SEMPRE PERGUNTE ao usuário antes de criar documentação**

### Estrutura do Documento de Fase

Quando uma fase estiver completa, crie `docs/FASE_X.md` com:

```markdown
# ✅ FASE X: Nome da Feature

**Data**: DD/MM/AAAA  
**Status**: ✅ CONCLUÍDO

## 🎯 Objetivo
[O que foi implementado]

## ✅ Implementado

### Backend
- Models criados
- Controllers implementados
- Rotas registradas
- Seeders executados

### Frontend
- Pages criadas
- Services implementados
- Types definidos

## 🧪 Como Testar
[Passo a passo para testar]

## 📝 Lições Aprendidas
[Problemas encontrados, soluções aplicadas]
```

### Atualizar Após Documentar

Após criar `docs/FASE_X.md`:
1. Atualizar `docs/PLANO_DE_ACAO.md` (marcar fase como concluída)
2. **Commitar tudo junto**: código + documentação
3. Pronto! Não criar mais nenhum arquivo dessa fase

---

## 🔄 WORKFLOW DE COMMITS E DOCUMENTAÇÃO

### ⚠️ REGRA CRÍTICA: Sempre Perguntar Antes

**Antes de COMMITAR**:
1. ✅ Mostrar o que será commitado (`git status` ou resumo)
2. ✅ Mostrar a mensagem do commit proposta
3. ✅ **PERGUNTAR**: "Posso commitar essas mudanças?"
4. ✅ Aguardar confirmação do usuário
5. ❌ **NUNCA** commitar automaticamente

**Antes de DOCUMENTAR**:
1. ✅ Verificar se a fase está 100% completa e testada
2. ✅ **PERGUNTAR**: "A fase está completa? Posso criar a documentação?"
3. ✅ Aguardar confirmação do usuário
4. ❌ **NUNCA** criar documentação durante desenvolvimento

**Benefícios**:
- Evita commits duplicados ou desnecessários
- Permite ao usuário revisar antes de commitar
- Evita documentação prematura
- Dá controle ao usuário sobre quando commitar

**Exemplo de Pergunta**:
```
📦 Mudanças prontas para commit:
- api/app/Models/SessaoPersonal.php
- web/src/pages/admin/PersonalSessions.tsx
- web/src/services/personal-sessions.service.ts

📝 Mensagem do commit:
"feat: Implementa CRUD de Sessões Personal"

✅ Posso commitar essas mudanças?
```

---

## 🎯 REGRA DE OURO: EXPERIÊNCIA DO USUÁRIO EM PRIMEIRO LUGAR

> **Os detalhes fazem a diferença!** Sempre pense na experiência do usuário ao implementar qualquer funcionalidade.

### ✨ Princípios de UX/UI (SEMPRE APLICAR)

1. **Formatação Visual**
   - ✅ Sempre use `formatCurrency()` para valores monetários → "R$ 150,00"
   - ✅ Sempre use `formatDate()` para datas → "15/01/2024" ou "15/01/2024 às 10:30"
   - ✅ Sempre use `formatPhone()` para telefones → "(11) 98888-7777"
   - ✅ Sempre use `formatCPF()` para CPF → "123.456.789-00"
   - ⚠️ **NUNCA** exiba valores brutos (`150`, `2024-01-15T10:30:00`, `11988887777`)

2. **Feedback Visual**
   - ✅ Sempre exiba **loading states** durante operações assíncronas
   - ✅ Sempre mostre **toast notifications** após ações (sucesso/erro)
   - ✅ Use **badges** para status (`ativa`/`inativa`, `pendente`/`confirmada`)
   - ✅ Use **skeletons** ou **spinners** ao carregar dados
   - ✅ Desabilite botões durante submissão (`disabled={submitting}`)

3. **Validações e Erros**
   - ✅ Valide inputs **em tempo real** quando possível
   - ✅ Mostre mensagens de erro **claras e em português**
   - ✅ Use `isValidCPF()`, `isValidEmail()`, `isValidPhone()` antes de submit
   - ✅ Destaque campos com erro visualmente (borda vermelha)

4. **Navegação e Fluxo**
   - ✅ Confirme ações destrutivas com **AlertDialog** (deletar, cancelar)
   - ✅ Permita **cancelar** operações em andamento
   - ✅ Use **breadcrumbs** em páginas internas
   - ✅ Mantenha usuário informado do **progresso** (steps, progress bars)

5. **Responsividade e Acessibilidade**
   - ✅ Teste em **mobile/tablet/desktop** (use TailwindCSS breakpoints)
   - ✅ Use **labels** adequados em inputs
   - ✅ Mantenha **hierarquia visual** clara (headings, espaçamento)
   - ✅ Use **cores consistentes** com o design system (fitway-green, white/10, etc)

6. **Performance e Otimização**
   - ✅ Use `debounce()` em campos de busca (500ms)
   - ✅ Implemente **paginação** em listas longas
   - ✅ Cache dados quando apropriado (React Query)
   - ✅ Lazy load componentes pesados

---

## 📚 Utilitários Disponíveis (`web/src/lib/utils.ts`)

### Formatação de Valores
```typescript
formatCurrency(150) // "R$ 150,00"
formatCurrency(150.5, false) // "150,50"
parseCurrency("R$ 1.500,00") // 1500
```

### Formatação de Data/Hora
```typescript
formatDate("2024-01-15T10:30:00") // "15/01/2024"
formatDate("2024-01-15T10:30:00", true) // "15/01/2024 às 10:30"
formatTime("14:30:00") // "14:30"
formatRelativeTime("2024-01-15T10:00:00") // "há 2 horas"
```

### Validações
```typescript
isValidCPF("123.456.789-09") // true/false
isValidEmail("user@example.com") // true/false
isValidPhone("11988887777") // true/false
```

### Formatação de Strings
```typescript
formatCPF("12345678900") // "123.456.789-00"
formatPhone("11988887777") // "(11) 98888-7777"
capitalize("joão silva") // "João Silva"
truncate("Lorem ipsum...", 10) // "Lorem ipsu..."
slugify("Quadra Beach Tennis 1") // "quadra-beach-tennis-1"
```

### Helpers Gerais
```typescript
debounce((term) => search(term), 500) // Debounce search
copyToClipboard("texto") // Copiar para clipboard
downloadFile(blob, "filename.csv") // Download de arquivo
```

---

## 📋 Visão Geral do Projeto

**Fitway** é um sistema completo de gestão de academia/centro esportivo com foco em quadras de beach tennis, aulas em grupo, instrutores e assinaturas.

### Stack Tecnológica
- **Backend**: Laravel 10 + PHP 8.4 + PostgreSQL 16 (Docker)
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Autenticação**: Laravel Sanctum (Bearer Token)
- **Infraestrutura**: Docker Compose (4 serviços)
- **Padrão**: Soft Delete (status='excluido')

### Fases Concluídas (7/13)
1. ✅ **Autenticação** - Login/Register/Logout (Sanctum)
2. ✅ **Admin - Quadras** - CRUD completo
3. ✅ **Admin - Planos** - CRUD completo
4. ✅ **Admin - Usuários** - CRUD + Soft Delete
5. ✅ **Admin - Instrutores** - CRUD + Soft Delete + Unificação Personal→Instrutor
6. ✅ **Soft Delete Unificado** - Padrão aplicado em todo sistema
7. ✅ **Disponibilidade Instrutor** - CRUD de horários semanais

### Próxima Fase
🎯 **Fase 8**: Sessões Personal 1:1 (agendamento com anti-overlap)

### Portas e URLs
- API (Laravel): `http://localhost:8000`
- Frontend Dev (Vite HMR): `http://localhost:5173`
- Frontend Prod (Nginx): `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

---

## 🗂️ Estrutura do Projeto

```
tccFitway/
├── api/                    # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Services/       # (a criar) Lógica de negócio
│   │   └── Repositories/   # (a criar) Acesso a dados
│   ├── database/
│   │   ├── ddl.sql         # ⚠️ DDL COMPLETO (fonte da verdade)
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php         # Rotas da API
│   └── .env.docker         # Config ambiente Docker
├── web/                    # Frontend React
│   ├── src/
│   │   ├── services/       # Chamadas API (auth, courts, plans)
│   │   ├── pages/          # Componentes de páginas
│   │   │   ├── admin/      # Área administrativa (ORGANIZADA!)
│   │   │   │   ├── dashboard/          # Dashboard principal
│   │   │   │   ├── cadastros/          # Módulo de Cadastros
│   │   │   │   │   ├── courts/         # Quadras
│   │   │   │   │   ├── plans/          # Planos (Plans, AddPlan, EditPlan)
│   │   │   │   │   ├── users/          # Usuários
│   │   │   │   │   └── instructors/    # Instrutores
│   │   │   │   ├── agendamentos/       # Módulo de Agendamentos
│   │   │   │   │   ├── personal-sessions/  # Sessões Personal 1:1
│   │   │   │   │   └── classes/            # Aulas (Classes, AddClass, EditClass)
│   │   │   │   └── payments/           # Pagamentos
│   │   │   ├── personal/   # Área do personal trainer
│   │   │   └── student/    # Área do aluno
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── types/          # TypeScript interfaces
│   │   └── lib/
│   │       └── api-client.ts # Cliente HTTP centralizado
│   └── .env.docker         # VITE_API_URL=http://localhost:8000
└── docs/
    ├── containers-e-comandos.md
    └── arquitetura-dados-e-fluxos.md
```

---

## 🎯 Regras de Nomenclatura e Padrões

### Backend (Laravel)

#### Tabelas do Banco (PostgreSQL)
- **Snake_case em pt-BR**: `usuarios`, `reservas_quadra`, `sessoes_personal`
- **IDs explícitos**: `id_usuario`, `id_quadra`, `id_instrutor`
- **Constraints**: Anti-overlap via `EXCLUDE USING gist` com `tstzrange`
- **Campos padrão**: `criado_em`, `atualizado_em` (TIMESTAMPTZ)

#### Models (Laravel)
- **StudlyCase**: `Usuario`, `ReservaQuadra`, `SessaoPersonal`
- Mapear nomes de tabelas: `protected $table = 'reservas_quadra';`
- Desabilitar timestamps padrão se usar `criado_em/atualizado_em`:
  ```php
  const CREATED_AT = 'criado_em';
  const UPDATED_AT = 'atualizado_em';
  ```

#### Controllers
- **Sufixo Controller**: `UsuarioController`, `ReservaQuadraController`
- **Resource Controllers**: usar `php artisan make:controller NomeController --resource`
- **Validação**: usar Form Requests (`php artisan make:request CreateReservaRequest`)

#### Services (Camada de Negócio)
- **Sufixo Service**: `ReservaQuadraService`, `AssinaturaService`
- **Responsabilidade**: Validações de negócio, anti-overlap, cálculos

#### Rotas (api.php)
- **Padrão RESTful**: `/api/courts`, `/api/court-bookings`
- **Prefixos por contexto**:
  - `/api/auth/*` → autenticação pública
  - `/api/public/*` → endpoints sem auth (reservas públicas)
  - `/api/*` → endpoints autenticados (aluno/personal)
  - `/api/admin/*` → endpoints admin only

### Frontend (React + TypeScript)

#### Componentes
- **PascalCase**: `LoginPage`, `CourtCard`, `ProtectedRoute`
- **Nomenclatura em inglês**: manter consistência com ecosystem React

#### Services
- **Sufixo .service.ts**: `auth.service.ts`, `courts.service.ts`
- **Classe singleton**: `export const authService = new AuthService();`

#### Types/Interfaces
- **PascalCase**: `User`, `Court`, `CourtBooking`
- **Mapeamento DB → Frontend**:
  - `id_usuario` → `id` (string)
  - `nome` → `name`
  - `papel` → `role` ('aluno' | 'personal' | 'admin')
  - `criado_em` → `createdAt` (ISO string)

---

## 🔑 Modelo de Dados Principal (DDL)

### Entidades Core

#### 1. **usuarios**
```sql
id_usuario, nome, email, senha_hash, telefone, documento,
data_nascimento, papel, status, criado_em, atualizado_em
```
- `papel`: 'admin' | 'aluno' | 'personal' | 'instrutor'
- `status`: 'ativo' | 'inativo'

#### 2. **planos** e **assinaturas**
```sql
planos: id_plano, nome, preco, ciclo_cobranca, max_reservas_futuras, beneficios_json
assinaturas: id_assinatura, id_usuario, id_plano, data_inicio, data_fim, status, proximo_vencimento
eventos_assinatura: id_evento_assinatura, id_assinatura, tipo, payload_json
```

#### 3. **quadras** e **reservas_quadra** (Anti-Overlap)
```sql
quadras: id_quadra, nome, localizacao, esporte, preco_hora, caracteristicas_json
bloqueios_quadra: id_bloqueio_quadra, id_quadra, inicio, fim, motivo
reservas_quadra: id_reserva_quadra, id_quadra, id_usuario, inicio, fim, periodo, preco_total, status
```
- **Constraint**: `EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&)`
- `periodo`: TSTZRANGE gerado automaticamente de `inicio` e `fim`

#### 4. **aulas** (Turmas) e **inscricoes_aula**
```sql
aulas: id_aula, nome, esporte, nivel, duracao_min, capacidade_max, preco_unitario
horarios_aula: id_horario_aula, id_aula, id_instrutor, id_quadra, dia_semana, hora_inicio
ocorrencias_aula: id_ocorrencia_aula, id_aula, id_instrutor, id_quadra, inicio, fim, periodo, status
inscricoes_aula: id_inscricao_aula, id_ocorrencia_aula, id_aula, id_usuario, status
```

#### 5. **instrutores** e **sessoes_personal** (1:1)
```sql
instrutores: id_instrutor, id_usuario, nome, email, telefone, cref, valor_hora, especialidades_json
disponibilidade_instrutor: id_disponibilidade, id_instrutor, dia_semana, hora_inicio, hora_fim
sessoes_personal: id_sessao_personal, id_instrutor, id_usuario, inicio, fim, periodo, preco_total, status
```
- **Constraint**: `EXCLUDE USING gist (id_instrutor WITH =, periodo WITH &&)`

#### 6. **pagamentos** e **webhooks**
```sql
pagamentos: id_pagamento, id_usuario, valor_total, moeda, status, provedor, id_transacao_ext
itens_pagamento: id_item_pagamento, id_pagamento, referencia_tipo, referencia_id, valor
webhooks_pagamento: id_webhook, provedor, tipo_evento, id_evento_externo, payload_json
```

### Relacionamentos Principais
- `usuarios` 1:N `reservas_quadra`, `inscricoes_aula`, `sessoes_personal`, `assinaturas`, `pagamentos`
- `quadras` 1:N `reservas_quadra`, `bloqueios_quadra`, `ocorrencias_aula`
- `instrutores` 1:N `horarios_aula`, `ocorrencias_aula`, `sessoes_personal`, `disponibilidade_instrutor`
- `aulas` 1:N `horarios_aula`, `ocorrencias_aula`, `inscricoes_aula`
- `planos` 1:N `assinaturas`

---

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação (Laravel Sanctum)

1. **Login**: `POST /api/auth/login`
   - Body: `{ email, password }`
   - Retorno: `{ user: {...}, access_token: "..." }`
   - Frontend salva token em `localStorage.setItem('access_token', token)`

2. **Logout**: `POST /api/auth/logout`
   - Header: `Authorization: Bearer {token}`
   - Frontend remove token e redireciona para `/login`

3. **Current User**: `GET /api/auth/me`
   - Header: `Authorization: Bearer {token}`
   - Retorno: dados do usuário logado

### Middleware e Guards
- **Sanctum Middleware**: `auth:sanctum` em todas rotas autenticadas
- **Role-based**: criar middleware `CheckRole` para validar `papel`
- **Frontend**: `ProtectedRoute` component já valida roles

### Mapeamento de Roles
- **Backend** (`papel`): 'admin', 'aluno', 'personal', 'instrutor'
- **Frontend** (`role`): 'admin', 'aluno', 'personal'

---

## �️ Soft Delete (Exclusão Lógica)

### ⚠️ REGRA IMPORTANTE: Sempre usar Soft Delete

**Nunca delete permanentemente!** Use sempre exclusão lógica para:
- Preservar dados históricos e auditoria
- Permitir recuperação de registros "excluídos"
- Manter integridade referencial (foreign keys)
- Rastrear mudanças ao longo do tempo

### Padrão de Implementação

**1. Backend - Controller**
```php
// index() - Filtrar registros excluídos
public function index(Request $request) {
    $query = Model::query();
    $query->where('status', '!=', 'excluido'); // ← Adicionar este filtro
    // ... resto da lógica
}

// destroy() - Marcar como excluído (NÃO usar delete())
public function destroy($id) {
    $model = Model::findOrFail($id);
    $model->update(['status' => 'excluido']); // ← Usar update, não delete
    return response()->json(null, 204);
}
```

**2. Database - CHECK Constraint**
```sql
-- Adicionar 'excluido' como opção válida
ALTER TABLE nome_tabela DROP CONSTRAINT IF EXISTS nome_tabela_status_check;
ALTER TABLE nome_tabela ADD CONSTRAINT nome_tabela_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));
```

**3. Frontend - Transparente**
- DELETE endpoints continuam funcionando normalmente
- Frontend não precisa saber da mudança (recebe 204)
- Registros "excluídos" não aparecem nas listagens

### Tabelas com Soft Delete Implementado
- ✅ `planos` (status: 'ativo' | 'inativo' | 'excluido')
- ✅ `usuarios` (status: 'ativo' | 'inativo' | 'excluido')
- ✅ `instrutores` (status: 'ativo' | 'inativo' | 'excluido')

### Recuperação de Registros (Opcional)
```php
// Criar endpoint PATCH /admin/model/{id}/restore
public function restore($id) {
    $model = Model::where('id', $id)
                  ->where('status', 'excluido')
                  ->firstOrFail();
    $model->update(['status' => 'ativo']);
    return response()->json(['data' => $model], 200);
}
```

---

## �📡 Contrato API ↔ Frontend

### Headers Padrão
```typescript
// Frontend (api-client.ts) já envia:
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}' // se autenticado
}
```

### Respostas de Erro (Padronização)
```json
{
  "message": "Mensagem amigável do erro",
  "code": "VALIDATION_ERROR",
  "details": { ... } // opcional
}
```

### Status HTTP
- `200 OK`: sucesso
- `201 Created`: recurso criado
- `204 No Content`: sucesso sem retorno (ex: DELETE com soft delete)
- `400 Bad Request`: validação falhou
- `401 Unauthorized`: não autenticado ou token inválido
- `403 Forbidden`: autenticado mas sem permissão
- `404 Not Found`: recurso não existe
- `409 Conflict`: conflito de horário (anti-overlap)
- `422 Unprocessable Entity`: validação de negócio falhou
- `500 Internal Server Error`: erro do servidor

---

## 🚀 Comandos Docker Essenciais

### Subir o Ambiente
```powershell
# Subir tudo (DB, API, Frontend Dev)
docker-compose up -d db api frontend-dev

# Ver logs da API
docker-compose logs -f api

# Ver logs do Frontend Dev (Vite)
docker-compose logs -f frontend-dev
```

### Executar Comandos no Container da API
```powershell
# Artisan
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed
docker-compose exec api php artisan route:list
docker-compose exec api php artisan make:controller NomeController

# Composer
docker-compose exec api composer install
docker-compose exec api composer require pacote/nome

# Shell
docker-compose exec api sh
```

### Acessar PostgreSQL
```powershell
# Via psql
docker-compose exec db psql -U fitway_user -d fitway_db

# Via pgAdmin
# http://localhost:5050
# Login: admin@fitway.com / admin123
# Servidor já pré-configurado!
```

### Rebuild e Restart
```powershell
# Recriar API após mudanças no .env.docker
docker-compose up -d --no-deps --force-recreate api

# Rebuild do frontend dev após mudanças no vite.config.ts
docker-compose up -d --no-deps --force-recreate frontend-dev

# Derrubar tudo (mantém volumes)
docker-compose down

# CUIDADO: Derrubar e apagar dados do DB
docker-compose down -v
```

---

## 🎨 Frontend - Estrutura e Navegação

### Estrutura do Menu (Sidebar)

O menu lateral (`web/src/components/Sidebar.tsx`) possui suporte a **submenus com collapse**. A estrutura atual é:

**Admin**:
```
📊 Dashboard                    → /admin/dashboard
📋 Cadastros (collapse)
  ├─ Quadras                    → /admin/quadras
  ├─ Planos                     → /admin/planos
  ├─ Usuários                   → /admin/usuarios
  └─ Instrutores                → /admin/instrutores
📅 Agendamentos (collapse)
  ├─ Sessões Personal           → /admin/sessoes-personal
  └─ Aulas (Turmas)             → /admin/aulas
💰 Pagamentos                   → /admin/pagamentos
```

**Instrutor**:
```
📊 Dashboard                    → /instrutor/dashboard
📅 Agenda                       → /instrutor/agenda
🕐 Horários                     → /instrutor/slots
📚 Turmas                       → /instrutor/turmas
```

**Aluno**:
```
📊 Dashboard                    → /aluno/dashboard
🎯 Planos                       → /aluno/planos
🏟️ Quadras                      → /aluno/quadras
📚 Aulas                        → /aluno/aulas
👤 Personal                     → /aluno/personal
⚙️ Perfil                       → /aluno/perfil
```

### ⚠️ Organização de Arquivos (IMPORTANTE!)

**REGRA**: Páginas admin devem estar organizadas por contexto em subpastas:

```
pages/admin/
  ├── dashboard/           # Dashboard principal
  ├── cadastros/           # Módulo de Cadastros (CRUD)
  │   ├── courts/
  │   ├── plans/
  │   ├── users/
  │   └── instructors/
  ├── agendamentos/        # Módulo de Agendamentos
  │   ├── personal-sessions/
  │   └── classes/
  └── payments/            # Pagamentos
```

**Ao criar nova página**:
1. ✅ Crie dentro da subpasta apropriada (cadastros, agendamentos, etc)
2. ✅ Crie arquivo `index.ts` para barrel export
3. ✅ Atualize imports no `App.tsx`
4. ✅ Adicione rota no `App.tsx`
5. ✅ Adicione item no menu (`Sidebar.tsx`)

**Exemplo completo**:
```bash
# 1. Criar estrutura
pages/admin/cadastros/nova-entidade/
  ├── NovaEntidade.tsx
  └── index.ts

# 2. index.ts (barrel export)
export { default } from './NovaEntidade';

# 3. App.tsx (import simplificado)
import NovaEntidade from './pages/admin/cadastros/nova-entidade';

# 4. App.tsx (rota)
<Route path="nova-entidade" element={<NovaEntidade />} />

# 5. Sidebar.tsx (menu)
{ title: 'Nova Entidade', href: '/admin/nova-entidade', icon: Icon }
```

### Como Adicionar Nova Tela no Menu

Ao criar uma nova página, **SEMPRE** adicione no menu apropriado:

1. **Editar**: `web/src/components/Sidebar.tsx`
2. **Localizar**: função `getNavItems()` → case do role apropriado
3. **Adicionar**:
   - Se for CRUD (Cadastro): adicionar em `children` do grupo "Cadastros"
   - Se for Agendamento: adicionar em `children` do grupo "Agendamentos"
   - Se for standalone: adicionar na raiz (fora de grupos)

**Exemplo - Adicionar "Reservas de Quadra" em Agendamentos**:
```typescript
{ 
  title: 'Agendamentos', 
  href: '#', 
  icon: Calendar,
  children: [
    { title: 'Sessões Personal', href: '/admin/sessoes-personal', icon: Dumbbell },
    { title: 'Aulas (Turmas)', href: '/admin/aulas', icon: BookOpen },
    { title: 'Reservas Quadra', href: '/admin/reservas', icon: MapPin }, // ← NOVO
  ]
},
```

### Services Implementados
1. **auth.service.ts** ✅ Conectado à API real
2. **courts.service.ts** ✅ Conectado à API

### Services Implementados
1. **auth.service.ts** ⚠️ **MOCK** - precisa conectar à API real
2. **courts.service.ts** ✅ Já chama API (mas API não existe ainda)
3. **plans.service.ts** ✅ Já chama API (mas API não existe ainda)

### Páginas com Dados Mock
- `student/Dashboard.tsx` - Mock de estatísticas
- `student/Plans.tsx` - Mock de plano atual
- `student/Courts.tsx` - Mock de disponibilidade
- `student/Classes.tsx` - Mock de aulas
- `student/Personal.tsx` - Mock de personals
- `student/Profile.tsx` - Mock de dados do usuário
- `personal/Schedule.tsx` - Mock de agenda
- `personal/Slots.tsx` - Mock de disponibilidade
- `PublicReservePage.tsx` - Mock de quadras e disponibilidade

### API Client
- **Arquivo**: `web/src/lib/api-client.ts`
- **Base URL**: `VITE_API_URL` (default: `http://localhost:8000/api`)
- **Já implementa**:
  - Headers de autenticação automáticos
  - Redirect para `/login` em 401
  - Tratamento de erros HTTP

---

## 📝 Convenções de Código

### Backend (Laravel)

#### Validação
```php
// Usar Form Requests
class CreateReservaRequest extends FormRequest {
    public function rules() {
        return [
            'id_quadra' => 'required|exists:quadras,id_quadra',
            'inicio' => 'required|date',
            'fim' => 'required|date|after:inicio',
        ];
    }
}
```

#### Retornos JSON
```php
// Sucesso (200/201)
return response()->json(['data' => $resource], 200);

// Erro de validação (422)
return response()->json([
    'message' => 'Dados inválidos',
    'errors' => $validator->errors()
], 422);

// Erro de conflito (409)
return response()->json([
    'message' => 'Horário já reservado',
    'code' => 'OVERLAP_ERROR'
], 409);
```

#### Service Pattern
```php
// app/Services/ReservaQuadraService.php
class ReservaQuadraService {
    public function criarReserva(array $dados): ReservaQuadra {
        // 1. Validar disponibilidade (anti-overlap)
        // 2. Calcular preço
        // 3. Criar registro
        // 4. Retornar modelo
    }
}

// No Controller
public function store(CreateReservaRequest $request, ReservaQuadraService $service) {
    $reserva = $service->criarReserva($request->validated());
    return response()->json(['data' => $reserva], 201);
}
```

### Frontend (React + TypeScript)

#### Chamadas API
```typescript
// Usar try/catch e toast para feedback
try {
  const reserva = await courtsService.createBooking(data);
  toast({ title: 'Reserva criada com sucesso!' });
} catch (error) {
  toast({
    title: 'Erro ao criar reserva',
    description: error.message,
    variant: 'destructive'
  });
}
```

#### State Management
- **React Query** para dados do servidor (usar `useQuery`, `useMutation`)
- **useState** para estado local de UI
- Não usar Redux/Zustand por enquanto (simplicidade)

---

## 🧪 Testes (Plano Futuro)

### Backend
```bash
# PHPUnit
docker-compose exec api php artisan test

# Feature Tests
tests/Feature/ReservaQuadraTest.php
- test_aluno_pode_criar_reserva()
- test_nao_permite_sobreposicao_horario()
- test_calcula_preco_corretamente()
```

### Frontend
```bash
# Vitest (a configurar)
npm run test
```

---

## 🐛 Troubleshooting Comum

### API retorna 500
1. Verificar logs: `docker-compose logs -f api`
2. Verificar `.env.docker` (DB_HOST=db, DB_DATABASE=fitway_db)
3. Rodar migrations: `docker-compose exec api php artisan migrate`

### CORS Error no Frontend
1. Verificar `api/.env.docker`:
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
   ```
2. Recriar container da API: `docker-compose up -d --force-recreate api`

### Frontend não conecta na API
1. Verificar `web/.env.docker`: `VITE_API_URL=http://localhost:8000`
2. API deve estar rodando: `docker-compose ps api`
3. Testar health: `curl http://localhost:8000/api/healthz`

### Mudanças no código não refletem
- **Frontend Dev**: HMR deve funcionar automaticamente (polling ativado)
- **API**: bind mount ativo, mas talvez precise `php artisan config:clear`
- **Frontend Prod**: precisa rebuild: `docker-compose build frontend && docker-compose up -d frontend`

---

## 📚 Referências Importantes

### Documentação
- **Laravel 10**: https://laravel.com/docs/10.x
- **Sanctum**: https://laravel.com/docs/10.x/sanctum
- **PostgreSQL GIST**: https://www.postgresql.org/docs/16/gist.html
- **React Router**: https://reactrouter.com
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com

### Arquivos de Referência do Projeto
- **DDL completo**: `api/database/ddl.sql` ← FONTE DA VERDADE
- **Arquitetura**: `docs/arquitetura-dados-e-fluxos.md`
- **Docker**: `docs/containers-e-comandos.md`
- **Rotas API**: `api/routes/api.php`
- **Types Frontend**: `web/src/types/index.ts`

---

## ✅ CHECKLIST COMPLETO - Implementação de Features

⚠️ **REGRA DE OURO**: Sempre implemente **BACKEND + FRONTEND** juntos e deixe **PRONTO PARA TESTAR** no navegador!

### 🔧 Backend (API Endpoint)
- [ ] **DDL**: Verificar se tabela/colunas existem em `api/database/ddl.sql`
- [ ] **Migration**: Criar se precisar de nova coluna (`php artisan make:migration`)
- [ ] **Model**: Criar/atualizar com `protected $table`, `$fillable`, timestamps corretos
- [ ] **Form Requests**: Criar validações (`CreateXRequest`, `UpdateXRequest`)
- [ ] **Controller**: Implementar endpoints RESTful (index, show, store, update, destroy)
  - [ ] **SOFT DELETE**: Usar `$model->update(['status' => 'excluido'])` no `destroy()`
  - [ ] **FILTRO**: Adicionar `->where('status', '!=', 'excluido')` no `index()`
- [ ] **Service** (opcional): Lógica de negócio complexa (anti-overlap, cálculos)
- [ ] **Routes**: Adicionar em `api/routes/api.php` com middleware correto
- [ ] **Database**: Atualizar CHECK constraint para incluir 'excluido'
  ```sql
  ALTER TABLE nome_tabela DROP CONSTRAINT IF EXISTS nome_tabela_status_check;
  ALTER TABLE nome_tabela ADD CONSTRAINT nome_tabela_status_check 
      CHECK (status IN ('ativo', 'inativo', 'excluido'));
  ```
- [ ] **Seeder**: Criar dados de teste (`php artisan make:seeder XSeeder`)
- [ ] **Executar Seeder**: `docker-compose exec api php artisan db:seed --class=XSeeder`
- [ ] **Testar API**: Verificar rotas com `php artisan route:list` ou Postman

### 🎨 Frontend (UI + Service)
- [ ] **Types**: Adicionar interfaces em `web/src/types/index.ts`
- [ ] **Service**: Criar métodos em `web/src/services/x.service.ts`
  - [ ] Aplicar `normalizeCourt()` pattern para converter strings da API
  - [ ] Adicionar tratamento de erros
- [ ] **Page Component**: Criar/atualizar página em `web/src/pages/admin/X.tsx`
  - [ ] **Imports**: Incluir `formatCurrency`, `formatDate`, etc de `@/lib/utils`
  - [ ] **Estado**: useState para loading, modals, formData, filters
  - [ ] **Loading State**: Skeleton/Spinner enquanto carrega dados
  - [ ] **CRUD Handlers**: handleCreate, handleEdit, handleDelete
  - [ ] **Validações**: Usar isValidCPF, isValidEmail antes de submit
  - [ ] **Formatação Visual**: Usar formatCurrency, formatDate, formatPhone
  - [ ] **Feedback**: Toast de sucesso/erro após cada ação
  - [ ] **Confirmações**: AlertDialog para ações destrutivas
  - [ ] **Filtros**: Select com value="all" (não "") para "Todos"
  - [ ] **Busca**: Debounced search input (500ms)
  - [ ] **Responsividade**: Grid com breakpoints md/lg
- [ ] **Routing**: Adicionar rota em `web/src/App.tsx` (se nova página)
- [ ] **Navigation**: ⚠️ **OBRIGATÓRIO** - Adicionar item no menu (`web/src/components/Sidebar.tsx`)
  - [ ] Identificar categoria correta (Cadastros, Agendamentos, ou raiz)
  - [ ] Adicionar no array de `children` do grupo correspondente
  - [ ] Usar ícone apropriado do lucide-react
  - [ ] Exemplo:
    ```typescript
    { title: 'Nova Feature', href: '/admin/nova-feature', icon: IconName }
    ```

### 🧪 Testes e Validação
- [ ] **Browser Test**: Abrir `http://localhost:5173/admin/x` e testar CRUD completo
- [ ] **Create**: Criar novo registro com sucesso
- [ ] **Read**: Listar registros com paginação/filtros
- [ ] **Update**: Editar registro existente
- [ ] **Delete**: Excluir com confirmação
- [ ] **Validações**: Testar envio de dados inválidos
- [ ] **Loading States**: Verificar spinners/skeletons
- [ ] **Toasts**: Confirmar mensagens de sucesso/erro
- [ ] **Mobile**: Testar em viewport pequeno (DevTools)
- [ ] **Erros API**: Simular erro (desligar API) e verificar tratamento

### 📝 Documentação
- [ ] **Criar doc de fase**: `docs/FASE_X_CONCLUIDA.md` com:
  - [ ] Arquivos criados (backend + frontend)
  - [ ] Endpoints implementados
  - [ ] Comandos para testar
  - [ ] Screenshots (opcional)
- [ ] **Atualizar README.md**: Se adicionar novos comandos/features
- [ ] **Atualizar copilot-instructions.md**: Se criar novos padrões/utilitários

### ✨ Detalhes de UX (SEMPRE VERIFICAR!)
- [ ] Valores monetários com `formatCurrency()` → "R$ 150,00"
- [ ] Datas com `formatDate()` → "15/01/2024"
- [ ] Horários com `formatTime()` → "14:30"
- [ ] Telefones com `formatPhone()` → "(11) 98888-7777"
- [ ] CPF com `formatCPF()` → "123.456.789-00"
- [ ] Status com badges coloridos (verde/vermelho/amarelo)
- [ ] Botões desabilitados durante submissão
- [ ] Confirmação antes de deletar
- [ ] Mensagens de erro claras em português
- [ ] Placeholders úteis em inputs
- [ ] Labels descritivos em formulários

---

## 📚 Referências Importantes
- [ ] Criar Controller (resource) com methods RESTful
- [ ] Registrar rota em `routes/api.php`
- [ ] Criar Seeder com dados de exemplo
- [ ] **Executar seeder** via `docker-compose exec -T api php artisan db:seed --class=NomeSeeder --force`
- [ ] **Verificar rotas** via `php artisan route:list --path=...`
- [ ] Testar com Postman/Insomnia (opcional)

### Frontend (OBRIGATÓRIO - sempre fazer junto!)
- [ ] Atualizar/criar interface em `types/index.ts`
- [ ] Criar/atualizar service method em `services/*.service.ts`
- [ ] **Conectar página React à API real** (sem mocks!)
- [ ] Implementar CRUD completo (listar, criar, editar, excluir)
- [ ] Adicionar toast para feedback de sucesso/erro
- [ ] Adicionar loading states (spinner)
- [ ] Adicionar modals/dialogs para criar/editar
- [ ] Adicionar confirmação para delete
- [ ] **Testar fluxo completo no navegador** (http://localhost:5173)
- [ ] Verificar responsividade mobile

### Validação Final
- [ ] Backend: rotas listadas, seeder executado, dados no banco
- [ ] Frontend: página carrega sem erros no console
- [ ] CRUD: criar, editar, listar, excluir funcionam
- [ ] UX: toasts aparecem, loading states funcionam
- [ ] **Documentar** em `docs/FASE_X_CONCLUIDA.md`

---

## 🎯 Próximos Passos (Roadmap Atual)

### Fase 1: Autenticação ✅ PRIORIDADE
1. ✅ Backend: Endpoints `/auth/login`, `/auth/logout`, `/auth/me`
2. ✅ Backend: Middleware Sanctum + CheckRole
3. ✅ Frontend: Remover mock de `auth.service.ts`
4. ✅ Testar login com 3 tipos de usuário

### Fase 2: Quadras (Reservas)
1. Backend: CRUD Quadras (admin)
2. Backend: Disponibilidade + Anti-overlap
3. Backend: Criar/Cancelar Reserva (aluno)
4. Frontend: Conectar páginas de quadras e reservas

### Fase 3: Aulas (Turmas)
1. Backend: CRUD Aulas (admin)
2. Backend: Gerar Ocorrências (agenda)
3. Backend: Inscrição/Cancelamento
4. Frontend: Conectar páginas de aulas

### Fase 4: Personal (1:1)
1. Backend: CRUD Instrutores (admin)
2. Backend: Disponibilidade + Agendamento
3. Frontend: Conectar páginas de personal

### Fase 5: Planos/Assinaturas
1. Backend: CRUD Planos (admin)
2. Backend: Assinar/Cancelar
3. Backend: Webhooks de pagamento
4. Frontend: Conectar páginas de planos

---

## 💡 Dicas para o Copilot

1. **Sempre consulte o DDL** (`api/database/ddl.sql`) para nomes corretos de tabelas e colunas
2. **Mapeie nomes**: DB usa pt-BR/snake_case, Laravel usa pt-BR/StudlyCase, Frontend usa en/camelCase
3. **Anti-overlap é crítico**: verificar constraints GIST ao criar reservas/sessões/ocorrências
4. **CORS/Sanctum**: lembre de configurar `.env.docker` para `localhost:5173`
5. **Retornos consistentes**: use `response()->json(['data' => ...])` no backend
6. **Feedback visual**: sempre adicionar toast no frontend para sucesso/erro
7. **Docker primeiro**: rodar comandos dentro dos containers, não no host
8. **Nunca hardcodar**: usar variáveis de ambiente (`VITE_API_URL`, `DB_HOST`, etc)

---

## 🤝 Como Contribuir (Para Futuros Devs)

1. Rodar `docker-compose up -d db api frontend-dev`
2. Ler este arquivo completo antes de codificar
3. Consultar `docs/arquitetura-dados-e-fluxos.md` para entender os fluxos
4. Seguir os padrões de nomenclatura definidos aqui
5. Testar localmente antes de commitar
6. Atualizar este documento se adicionar novas convenções

---

**Última Atualização**: 15 de outubro de 2025  
**Mantenedor**: Equipe Fitway
