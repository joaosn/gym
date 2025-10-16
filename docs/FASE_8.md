# ✅ FASE 8: Sessões Personal 1:1

**Data**: 16 de outubro de 2025  
**Status**: ✅ CONCLUÍDO

---

## 🎯 Objetivo

Implementar sistema completo de agendamento de sessões personal 1:1 entre instrutores e alunos, com validações robustas de conflito de horário (instrutor, aluno e quadra).

---

## ✅ Implementado

### Backend

#### 1. Models
- **`SessaoPersonal.php`**: Model principal com relacionamentos
  - Relacionamentos: `instrutor`, `usuario`, `quadra`
  - Scopes: `futuras()`, `passadas()`, `ativas()`
  - Soft delete via status (`status='cancelada'`)

- **`ReservaQuadra.php`**: Model para integração com reservas de quadra
  - Relacionamentos: `quadra`, `usuario`
  - Scopes: `ativas()`, `futuras()`, `passadas()`

#### 2. Controllers
- **`SessaoPersonalController.php`**: 8 endpoints RESTful
  - `GET /api/personal-sessions` - Listar (com filtros)
  - `GET /api/personal-sessions/{id}` - Buscar por ID
  - `POST /api/personal-sessions` - Criar nova sessão
  - `PUT /api/personal-sessions/{id}` - Atualizar
  - `DELETE /api/personal-sessions/{id}` - Cancelar (soft delete)
  - `PATCH /api/personal-sessions/{id}/confirm` - Confirmar sessão
  - `POST /api/personal-sessions/check-availability` - Verificar disponibilidade

#### 3. Services
- **`SessaoPersonalService.php`**: Lógica de negócio
  - **4 Validações de Conflito**:
    1. ✅ **Instrutor**: Anti-overlap (instrutor não pode ter 2 sessões simultâneas)
    2. ✅ **Disponibilidade Semanal**: Sessão dentro dos horários do instrutor
    3. ✅ **Quadra**: Verifica `reservas_quadra` + `sessoes_personal` (se quadra informada)
    4. ✅ **Aluno**: Aluno não pode ter 2 sessões simultâneas
  
  - **Cálculo de Preço**: `valor_hora × duração` (blocos de 30min)
  - **Métodos**:
    - `validarDisponibilidade()` - Valida todas as regras
    - `calcularPreco()` - Calcula preço da sessão
    - `criarSessao()` - Cria com validações
    - `atualizarSessao()` - Atualiza com validações

#### 4. Form Requests
- **`CreateSessaoPersonalRequest.php`**: Validação de criação
- **`UpdateSessaoPersonalRequest.php`**: Validação de atualização

#### 5. Rotas
Registradas em `api/routes/api.php`:
```php
Route::prefix('personal-sessions')->group(function () {
    Route::get('/', [SessaoPersonalController::class, 'index']);
    Route::get('/{id}', [SessaoPersonalController::class, 'show']);
    Route::post('/', [SessaoPersonalController::class, 'store']);
    Route::put('/{id}', [SessaoPersonalController::class, 'update']);
    Route::patch('/{id}', [SessaoPersonalController::class, 'update']);
    Route::delete('/{id}', [SessaoPersonalController::class, 'destroy']);
    Route::patch('/{id}/confirm', [SessaoPersonalController::class, 'confirm']);
    Route::post('/check-availability', [SessaoPersonalController::class, 'checkAvailability']);
});
```

#### 6. Seeder
- **`SessaoPersonalSeeder.php`**: 12 sessões de teste
  - 5 sessões passadas (concluida, no_show, cancelada)
  - 7 sessões futuras (pendente, confirmada)
  - Instrutor: Ana Paula Santos
  - Aluno: Aluno Maria Santos

---

### Frontend

#### 1. Types
Adicionado em `web/src/types/index.ts`:
```typescript
export interface PersonalSession {
  id_sessao_personal: string;
  id_instrutor: string;
  id_usuario: string;
  id_quadra?: string;
  inicio: string;
  fim: string;
  preco_total: number;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'concluida' | 'no_show';
  observacoes?: string;
  instrutor?: Instructor;
  usuario?: AdminUser;
  quadra?: Court;
  criado_em: string;
  atualizado_em: string;
}

export interface PersonalSessionFormData {
  id_instrutor: string;
  id_usuario: string;
  id_quadra?: string;
  inicio: string;
  fim: string;
  observacoes?: string;
}

export interface AvailabilityCheckRequest {
  id_instrutor: string;
  inicio: string;
  fim: string;
  id_quadra?: string; // Validar conflito de quadra
}

export interface AvailabilityCheckResponse {
  disponivel: boolean;
  motivo?: string;
  preco_total?: number;
}
```

#### 2. Service
- **`personal-sessions.service.ts`**: Métodos para API
  - `list()` - Listar com filtros (instrutor, aluno, status, período)
  - `getById()` - Buscar por ID
  - `create()` - Criar nova sessão
  - `update()` - Atualizar sessão
  - `cancel()` - Cancelar sessão
  - `confirm()` - Confirmar sessão
  - `checkAvailability()` - Verificar disponibilidade (instrutor + quadra)

#### 3. Página Admin
- **`PersonalSessions.tsx`**: CRUD completo
  - **Listagem**: Grid de cards com informações da sessão
  - **Filtros**: 
    - Busca por nome (instrutor/aluno)
    - Status (pendente, confirmada, cancelada, concluida, no_show)
    - Período (futuras, passadas)
    - Instrutor
  - **Ações**:
    - ✅ Criar nova sessão (com check de disponibilidade)
    - ✅ Editar (quadra, observações, status)
    - ✅ Confirmar (muda status para confirmada)
    - ✅ Cancelar (com confirmação)
    - 👁️ Ver detalhes
  - **Validações**:
    - Horário de término > horário de início
    - Verifica disponibilidade antes de criar
    - Mostra mensagens de erro claras

#### 4. Menu
Adicionado em `Sidebar.tsx` → Agendamentos → Sessões Personal

---

## 🐛 Bugs Corrigidos

### 1. Select com `value=""` (Radix UI)
**Problema**: Radix UI não permite `<SelectItem value="">`, causa erro.

**Solução**: Usar `value="none"` e converter:
```tsx
<Select
  value={formData.id_quadra || 'none'}
  onValueChange={(value) => setFormData({ 
    ...formData, 
    id_quadra: value === 'none' ? '' : value 
  })}
>
  <SelectItem value="none">Nenhuma</SelectItem>
```

### 2. Layout "Colado"
**Problema**: Conteúdo das páginas colado nas bordas.

**Solução**: Adicionado `p-6` no `<main>` do Layout.tsx:
```tsx
<main className="flex-1 overflow-auto p-6">
```

### 3. Tipos do Service
**Problema**: Type mismatch entre service e component.

**Solução**: Service retorna objeto paginate completo:
```typescript
return await apiClient.get<{
  data: PersonalSession[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}>(url);
```

---

## 🎨 Refatoração: Estrutura de Pastas

### Problema
Páginas admin estavam todas soltas na raiz, dificultando manutenção.

### Solução
Organizadas por contexto em subpastas:

```
pages/admin/
  ├── dashboard/              # Dashboard principal
  ├── cadastros/              # CRUD
  │   ├── courts/
  │   ├── plans/
  │   ├── users/
  │   └── instructors/
  ├── agendamentos/           # Agendamentos
  │   ├── personal-sessions/  # ← NOVA!
  │   └── classes/
  ├── payments/               # Pagamentos
  ├── _unused/                # Backup de arquivos antigos
  └── README.md               # Documentação
```

### Benefícios
- ✅ Escalabilidade: Fácil adicionar componentes específicos
- ✅ Manutenibilidade: Código relacionado fica junto
- ✅ Organização: Estrutura clara por contexto
- ✅ Barrel Exports: Imports limpos via `index.ts`
- ✅ Limpeza: Arquivos não utilizados separados

---

## 🧪 Como Testar

### 1. Backend (via API)

#### Executar Seeder
```bash
docker-compose exec api php artisan db:seed --class=SessaoPersonalSeeder
```

#### Verificar Dados no Banco
```sql
-- Via psql
docker-compose exec db psql -U fitway_user -d fitway_db

-- Listar sessões
SELECT sp.id_sessao_personal, i.nome as instrutor, u.nome as aluno, 
       sp.inicio, sp.fim, sp.status, sp.preco_total
FROM sessoes_personal sp
LEFT JOIN instrutores i ON sp.id_instrutor = i.id_instrutor
LEFT JOIN usuarios u ON sp.id_usuario = u.id_usuario
ORDER BY sp.inicio DESC;
```

#### Testar Endpoints (Postman/Insomnia)
```bash
# 1. Listar sessões
GET http://localhost:8000/api/personal-sessions
Authorization: Bearer {token}

# 2. Verificar disponibilidade
POST http://localhost:8000/api/personal-sessions/check-availability
Authorization: Bearer {token}
Body:
{
  "id_instrutor": "1",
  "inicio": "2025-10-20T10:00:00",
  "fim": "2025-10-20T11:00:00",
  "id_quadra": "1"
}

# 3. Criar sessão
POST http://localhost:8000/api/personal-sessions
Authorization: Bearer {token}
Body:
{
  "id_instrutor": "1",
  "id_usuario": "2",
  "inicio": "2025-10-20T10:00:00",
  "fim": "2025-10-20T11:00:00",
  "id_quadra": "1",
  "observacoes": "Treino de forehand"
}
```

### 2. Frontend (via Navegador)

#### Acessar Página
1. Login como admin: `http://localhost:5173/login`
   - Email: `admin@fitway.com`
   - Senha: `admin123`

2. Navegar para: **Agendamentos → Sessões Personal**
   - URL: `http://localhost:5173/admin/sessoes-personal`

#### Testar CRUD
1. **Listar**: Deve mostrar as 12 sessões seedadas
2. **Filtrar**: 
   - Status: "Pendente" → 4 sessões
   - Período: "Futuras" → 7 sessões
3. **Criar**: 
   - Clicar em "Nova Sessão"
   - Preencher: Instrutor, Aluno, Horários
   - Adicionar quadra (opcional)
   - Sistema verifica disponibilidade automaticamente
4. **Confirmar**: 
   - Clicar no ✓ em uma sessão pendente
   - Status muda para "Confirmada"
5. **Editar**:
   - Clicar no ✏️
   - Alterar quadra ou observações
   - Salvar
6. **Cancelar**:
   - Clicar no ❌
   - Confirmar cancelamento
   - Status muda para "Cancelada"

#### Testar Validações
1. **Conflito de Instrutor**:
   - Tentar criar 2 sessões com mesmo instrutor no mesmo horário
   - Deve mostrar: "O instrutor já possui outra sessão agendada neste horário"

2. **Conflito de Quadra**:
   - Tentar criar 2 sessões com mesma quadra no mesmo horário
   - Deve mostrar: "A quadra já está reservada neste horário"

3. **Conflito de Aluno**:
   - Tentar criar 2 sessões com mesmo aluno no mesmo horário
   - Deve mostrar: "O aluno já possui outra sessão agendada neste horário"

4. **Disponibilidade Semanal**:
   - Tentar criar sessão fora do horário do instrutor
   - Deve mostrar: "O horário solicitado está fora da disponibilidade do instrutor"

#### Debug (DevTools Console)
Abrir F12 → Console, deve mostrar:
```
🔑 Token: Presente ✅
📊 Sessions Data: {data: [...], current_page: 1, total: 12}
👨‍🏫 Instructors Data: {data: [...]}
🎓 Students Data: {data: [...]}
🏟️ Courts Data: {data: [...]}
```

---

## 📝 Lições Aprendidas

### 1. Validações em Cascata
Implementar validações de negócio no Service, não no Controller:
- Permite reutilização
- Facilita testes
- Mantém Controller limpo

### 2. Anti-Overlap Multi-Tabela
Para validar conflito de quadra, verificar:
- `reservas_quadra` (reservas diretas)
- `sessoes_personal` (outras sessões usando a quadra)

### 3. Radix UI Select Requirements
`<SelectItem value="">` é proibido. Usar string única como `"none"` ou `"null"`.

### 4. Barrel Exports
Criar `index.ts` em cada pasta facilita imports:
```typescript
// index.ts
export { default } from './Component';

// Import simplificado
import Component from './path/to/folder';
```

### 5. Organização por Contexto
Estrutura de pastas por módulo (cadastros, agendamentos) facilita:
- Encontrar código relacionado
- Adicionar novos componentes específicos
- Manter projeto escalável

---

## 🚀 Próximos Passos

### Melhorias Futuras
1. **Notificações**: Email/SMS para confirmação de sessão
2. **Pagamentos**: Integração com gateway (Stripe/PagSeguro)
3. **Recorrência**: Agendar sessões recorrentes (semanais)
4. **Relatórios**: Dashboard de sessões por instrutor
5. **Avaliações**: Aluno avaliar instrutor após sessão

### Fase 9 (Próxima)
**Reservas de Quadra** - Sistema público de reserva de quadras por horário.

---

**Concluído em**: 16 de outubro de 2025  
**Tempo estimado**: ~8 horas (backend + frontend + validações + refactor)
