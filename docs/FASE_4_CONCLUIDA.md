# ✅ Fase 4 Concluída - Admin: Gestão de Usuários (CRUD)

**Data de Conclusão**: 15 de janeiro de 2025  
**Tempo Estimado**: 3-4 horas  
**Tempo Real**: ~2 horas

---

## 📋 Resumo

Implementado sistema completo de **Gestão de Usuários** (CRUD) para administradores gerenciarem todos os tipos de usuários do sistema: alunos, personal trainers, instrutores e admins.

### Funcionalidades Implementadas

✅ **Backend (API)**:
- Listar usuários com filtros (papel, status, busca)
- Criar novo usuário
- Visualizar detalhes de um usuário
- Atualizar dados de usuário
- Excluir usuário (com proteção contra auto-exclusão)
- Toggle de status (ativar/desativar)

✅ **Frontend (React)**:
- Grid de cards com usuários
- Filtros dinâmicos (papel, status, busca)
- Modal de criação com validação
- Modal de edição (senha opcional)
- Toggle de status com feedback visual
- Confirmação antes de excluir
- Formatação de CPF, telefone e datas
- Loading states e toasts

---

## 🗂️ Arquivos Criados/Modificados

### Backend (Laravel)

#### 1. **api/app/Models/User.php** (ATUALIZADO)
```php
// Mapeamento para tabela `usuarios` do PostgreSQL
protected $table = 'usuarios';
protected $primaryKey = 'id_usuario';
const CREATED_AT = 'criado_em';
const UPDATED_AT = 'atualizado_em';

// Campos preenchíveis
protected $fillable = [
    'nome', 'email', 'senha_hash', 'telefone', 'documento',
    'data_nascimento', 'papel', 'status'
];

// Override para Sanctum usar senha_hash
public function getAuthPassword() {
    return $this->senha_hash;
}

// Scopes úteis
public function scopeAtivos($query) { ... }
public function scopePapel($query, string $papel) { ... }
```

**Por que?**: Model padrão do Laravel usava tabela `users`, mas o DDL define `usuarios` com colunas em português.

---

#### 2. **api/app/Http/Requests/CreateUserRequest.php** (NOVO)
```php
public function rules()
{
    return [
        'nome' => 'required|string|max:255',
        'email' => 'required|email|unique:usuarios,email',
        'senha' => 'required|string|min:6',
        'telefone' => 'nullable|string|max:20',
        'documento' => 'nullable|string|max:14',
        'data_nascimento' => 'nullable|date',
        'papel' => 'required|in:admin,aluno,personal,instrutor',
        'status' => 'nullable|in:ativo,inativo',
    ];
}
```

**Por que?**: Validar dados ao criar usuário, com mensagens de erro em português.

---

#### 3. **api/app/Http/Requests/UpdateUserRequest.php** (NOVO)
```php
public function rules()
{
    return [
        'nome' => 'sometimes|required|string|max:255',
        'email' => 'sometimes|required|email|unique:usuarios,email,' . $this->route('id') . ',id_usuario',
        'senha' => 'sometimes|nullable|string|min:6',
        'telefone' => 'sometimes|nullable|string|max:20',
        'documento' => 'sometimes|nullable|string|max:14',
        'data_nascimento' => 'sometimes|nullable|date',
        'papel' => 'sometimes|required|in:admin,aluno,personal,instrutor',
        'status' => 'sometimes|nullable|in:ativo,inativo',
    ];
}
```

**Por que?**: Permitir **atualizações parciais** (PATCH) com validação de email excluindo o próprio usuário.

---

#### 4. **api/app/Http/Controllers/Admin/UserController.php** (NOVO)
```php
class UserController extends Controller
{
    // GET /api/admin/users
    public function index(Request $request)
    {
        $query = User::query();
        
        // Filtros
        if ($request->has('papel')) {
            $query->where('papel', $request->papel);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('nome', 'ILIKE', "%{$request->search}%")
                  ->orWhere('email', 'ILIKE', "%{$request->search}%");
            });
        }
        
        $users = $query->orderBy('criado_em', 'desc')->get();
        return response()->json(['data' => $users]);
    }

    // POST /api/admin/users
    public function store(CreateUserRequest $request)
    {
        $data = $request->validated();
        $data['senha_hash'] = Hash::make($data['senha']);
        unset($data['senha']);
        
        $user = User::create($data);
        return response()->json(['data' => $user], 201);
    }

    // GET /api/admin/users/{id}
    public function show($id)
    {
        $user = User::where('id_usuario', $id)->firstOrFail();
        return response()->json(['data' => $user]);
    }

    // PUT/PATCH /api/admin/users/{id}
    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::where('id_usuario', $id)->firstOrFail();
        
        $data = $request->validated();
        if (isset($data['senha']) && !empty($data['senha'])) {
            $data['senha_hash'] = Hash::make($data['senha']);
            unset($data['senha']);
        } else {
            unset($data['senha']);
        }
        
        $user->update($data);
        return response()->json(['data' => $user]);
    }

    // DELETE /api/admin/users/{id}
    public function destroy($id)
    {
        $user = User::where('id_usuario', $id)->firstOrFail();
        
        // Proteção: não pode deletar a si mesmo
        if (auth()->id() === $user->id_usuario) {
            return response()->json([
                'message' => 'Você não pode excluir sua própria conta.'
            ], 403);
        }
        
        $user->delete();
        return response()->json(null, 204);
    }

    // PATCH /api/admin/users/{id}/status
    public function updateStatus($id)
    {
        $user = User::where('id_usuario', $id)->firstOrFail();
        $user->status = $user->status === 'ativo' ? 'inativo' : 'ativo';
        $user->save();
        
        return response()->json(['data' => $user]);
    }
}
```

**Por que?**: Lógica de negócio centralizada com filtros, validações e proteções.

---

#### 5. **api/routes/api.php** (ATUALIZADO)
```php
use App\Http\Controllers\Admin\UserController;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('users', UserController::class)->parameters(['users' => 'id']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
});
```

**Rotas Criadas**:
```
GET|HEAD    /api/admin/users           → users.index
POST        /api/admin/users           → users.store
GET|HEAD    /api/admin/users/{id}      → users.show
PUT|PATCH   /api/admin/users/{id}      → users.update
DELETE      /api/admin/users/{id}      → users.destroy
PATCH       /api/admin/users/{id}/status → updateStatus
```

**Por que?**: RESTful API com proteção de role (apenas `admin` pode acessar).

---

### Frontend (React + TypeScript)

#### 6. **web/src/types/index.ts** (ATUALIZADO)
```typescript
export interface User {
  id_usuario: string;
  nome: string;
  email: string;
  telefone?: string;
  documento?: string;
  data_nascimento?: string;
  papel: 'admin' | 'aluno' | 'personal' | 'instrutor';
  status: 'ativo' | 'inativo';
  criado_em: string;
  atualizado_em: string;
}

export interface UserFormData {
  nome: string;
  email: string;
  senha?: string;
  telefone?: string;
  documento?: string;
  data_nascimento?: string;
  papel: 'admin' | 'aluno' | 'personal' | 'instrutor';
  status?: 'ativo' | 'inativo';
}
```

**Por que?**: Type-safety para TypeScript, mapeando schema do backend.

---

#### 7. **web/src/services/users.service.ts** (NOVO)
```typescript
import { apiClient } from '@/lib/api-client';
import { User, UserFormData } from '@/types';

class UsersService {
  async listUsers(params?: { papel?: string; status?: string; search?: string }) {
    const response = await apiClient.get('/admin/users', { params });
    return response;
  }

  async getUser(id: string) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response;
  }

  async createUser(data: UserFormData) {
    const response = await apiClient.post('/admin/users', data);
    return response;
  }

  async updateUser(id: string, data: Partial<UserFormData>) {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response;
  }

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response;
  }

  async toggleStatus(id: string) {
    const response = await apiClient.patch(`/admin/users/${id}/status`);
    return response;
  }
}

export const usersService = new UsersService();
```

**Por que?**: Camada de serviço para abstrair chamadas HTTP, reutilizável em toda aplicação.

---

#### 8. **web/src/pages/admin/Users.tsx** (NOVO)
**Principais Features**:
- ✅ Grid responsivo de cards (3 colunas em desktop, 1 em mobile)
- ✅ Filtros: Papel (admin/aluno/personal/instrutor), Status (ativo/inativo), Busca (nome/email)
- ✅ Modal de criação com campos: nome, email, senha, telefone, CPF, data nascimento, papel, status
- ✅ Modal de edição (senha opcional)
- ✅ Botão toggle de status (ativo ↔ inativo) com cores diferentes
- ✅ Confirmação de exclusão (AlertDialog)
- ✅ Loading states (Loader2 spinner)
- ✅ Toast notifications (sucesso/erro)
- ✅ Formatação visual: `formatCPF()`, `formatPhone()`, `formatDate()`
- ✅ Badges coloridos por papel (admin=vermelho, personal=roxo, instrutor=azul, aluno=cinza)
- ✅ Validação: botão "Criar" desabilitado se faltar nome/email/senha

**Componentes Utilizados**:
- `Card`, `Badge`, `Button`, `Input`, `Label`, `Select`
- `Dialog` (modals), `AlertDialog` (confirmação)
- `useToast` (feedback), `useState`, `useEffect`
- Ícones: `User`, `Mail`, `Phone`, `Calendar`, `Shield`, `Edit`, `Trash2`, `CheckCircle`, `XCircle`

**Por que?**: Seguir pattern estabelecido em `Plans.tsx` e `Courts.tsx` (Fases 2-3).

---

#### 9. **web/src/App.tsx** (ATUALIZADO)
```typescript
import AdminUsers from "./pages/admin/Users";

// Rotas
<Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="usuarios" element={<AdminUsers />} />
  {/* ... */}
</Route>
```

**Por que?**: Adicionar rota `/admin/usuarios` protegida.

---

#### 10. **web/src/components/Sidebar.tsx** (ATUALIZADO)
```typescript
case 'admin':
  return [
    { title: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { title: 'Planos', href: '/admin/planos', icon: Target },
    { title: 'Usuários', href: '/admin/usuarios', icon: Users }, // ✨ NOVO
    { title: 'Aulas', href: '/admin/aulas', icon: BookOpen },
    { title: 'Personal Trainers', href: '/admin/personais', icon: User },
    { title: 'Pagamentos', href: '/admin/pagamentos', icon: CreditCard },
  ];
```

**Por que?**: Menu de navegação para acessar a tela de usuários.

---

## 🧪 Como Testar

### 1. Verificar Containers Rodando
```powershell
docker-compose ps
# api: Up (porta 8000)
# frontend-dev: Up (porta 5173)
# db: Up (porta 5432)
```

### 2. Verificar Rotas da API
```powershell
docker-compose exec api php artisan route:list --path=admin/users
```

**Saída Esperada**:
```
GET|HEAD    api/admin/users           users.index
POST        api/admin/users           users.store
GET|HEAD    api/admin/users/{id}      users.show
PUT|PATCH   api/admin/users/{id}      users.update
DELETE      api/admin/users/{id}      users.destroy
PATCH       api/admin/users/{id}/status updateStatus
```

### 3. Verificar Dados de Teste no Banco
```powershell
docker-compose exec -T db psql -U fitway_user -d fitway_db -c "SELECT id_usuario, nome, email, papel, status FROM usuarios ORDER BY id_usuario;"
```

**Saída Esperada**:
```
 id_usuario |        nome          |         email         |   papel   | status
------------+----------------------+-----------------------+-----------+--------
          1 | Admin Fitway         | admin@fitway.com      | admin     | ativo
          2 | Personal João Silva  | personal@fitway.com   | personal  | ativo
          3 | Aluno Maria Santos   | aluno@fitway.com      | aluno     | ativo
          4 | Instrutor Carlos     | instrutor@fitway.com  | instrutor | ativo
          5 | Teste Aluno Inativo  | inativo@fitway.com    | aluno     | inativo
(5 rows)
```

### 4. Testar no Navegador

1. **Abrir Frontend**: http://localhost:5173
2. **Login**: `admin@fitway.com` / `admin123`
3. **Navegar**: Sidebar → "Usuários"
4. **URL**: http://localhost:5173/admin/usuarios

### 5. Testes de CRUD

#### ✅ CREATE (Criar Usuário)
1. Clicar em "Novo Usuário"
2. Preencher:
   - Nome: `Teste João Santos`
   - Email: `teste@fitway.com`
   - Senha: `senha123`
   - Telefone: `11988887777`
   - CPF: `12345678900`
   - Data Nascimento: `1990-05-15`
   - Papel: `Aluno`
   - Status: `Ativo`
3. Clicar "Criar Usuário"
4. **Resultado esperado**: Toast verde "Usuário criado com sucesso!", card aparece na lista

#### ✅ READ (Listar Usuários)
1. Ver lista de cards com os 5 usuários iniciais + novo
2. Verificar badges:
   - Admin: vermelho
   - Personal: roxo
   - Instrutor: azul
   - Aluno: cinza
3. Verificar formatação:
   - CPF: `123.456.789-00`
   - Telefone: `(11) 98888-7777`
   - Data: `15/05/1990`

#### ✅ FILTROS
1. **Filtro por Papel**: Selecionar "Aluno" → Ver apenas alunos
2. **Filtro por Status**: Selecionar "Inativo" → Ver apenas `Teste Aluno Inativo`
3. **Busca**: Digitar "maria" → Ver apenas `Aluno Maria Santos`
4. **Resetar**: Selecionar "Todos" em ambos filtros

#### ✅ UPDATE (Editar Usuário)
1. Clicar em "Editar" no card de `Teste João Santos`
2. Alterar:
   - Nome: `João Santos Silva`
   - Telefone: `11999998888`
   - **Deixar senha vazia** (não alterar)
3. Clicar "Salvar Alterações"
4. **Resultado esperado**: Toast verde, dados atualizados no card

#### ✅ TOGGLE STATUS
1. Card de `Teste João Santos` → Clicar no botão de status (ícone de check/x)
2. **Resultado esperado**: 
   - Badge muda de "Ativo" (verde) para "Inativo" (cinza)
   - Toast: "Status alterado com sucesso!"
3. Clicar novamente → Volta para "Ativo"

#### ✅ DELETE (Excluir Usuário)
1. Card de `Teste João Santos` → Clicar em ícone de lixeira (🗑️)
2. **Resultado esperado**: AlertDialog com confirmação
3. Clicar "Excluir"
4. **Resultado esperado**: Toast verde, card desaparece da lista

#### ❌ PROTEÇÕES
1. Tentar excluir **sua própria conta** (admin@fitway.com)
2. **Resultado esperado**: Toast vermelho "Você não pode excluir sua própria conta."

---

## 📊 Validação da Fase 4 (Checklist)

### Backend
- [x] Model User atualizado com mapeamento correto (`usuarios`, `id_usuario`, `criado_em`)
- [x] CreateUserRequest com validações (nome, email unique, senha min:6)
- [x] UpdateUserRequest com validações parciais ('sometimes')
- [x] UserController com 6 métodos (index, show, store, update, destroy, updateStatus)
- [x] Rotas registradas em `/api/admin/users` com middleware `role:admin`
- [x] Proteção contra auto-exclusão no método `destroy()`
- [x] Filtros funcionando (papel, status, search via ILIKE)
- [x] Hash de senha usando `Hash::make()`
- [x] Senha opcional ao editar (não envia se vazia)

### Frontend
- [x] Interface `User` e `UserFormData` em types/index.ts
- [x] Service `users.service.ts` com 6 métodos
- [x] Página `Users.tsx` criada
- [x] Grid responsivo (3 cols desktop, 1 mobile)
- [x] Filtros: Papel, Status, Busca (com debounce implícito via botão)
- [x] Modal de criação com todos campos
- [x] Modal de edição (senha opcional)
- [x] Toggle de status com feedback visual
- [x] Confirmação antes de deletar (AlertDialog)
- [x] Loading states (spinner ao carregar/submeter)
- [x] Toast notifications (sucesso/erro)
- [x] Formatação: `formatCPF()`, `formatPhone()`, `formatDate()`
- [x] Badges coloridos por papel (admin/personal/instrutor/aluno)
- [x] Validação: botões desabilitados quando necessário
- [x] Rota `/admin/usuarios` adicionada em App.tsx
- [x] Link "Usuários" no Sidebar (admin)

### UX/UI
- [x] Valores formatados corretamente (CPF, telefone, datas)
- [x] Badges de status (ativo=verde, inativo=cinza)
- [x] Badges de papel com cores distintas
- [x] Ícones descritivos (User, Mail, Phone, Calendar)
- [x] Mensagens de erro em português
- [x] Confirmação antes de ações destrutivas
- [x] Feedback imediato (toasts)
- [x] Loading states durante operações assíncronas

### Testes
- [x] API: 6 rotas verificadas via `route:list`
- [x] DB: 5 usuários de teste confirmados
- [x] Navegador: Login funcionando
- [x] Navegador: Criação de usuário OK
- [x] Navegador: Edição de usuário OK
- [x] Navegador: Toggle de status OK
- [x] Navegador: Exclusão de usuário OK
- [x] Navegador: Proteção contra auto-exclusão OK
- [x] Navegador: Filtros funcionando OK
- [x] Navegador: Formatações visuais OK
- [x] Mobile: Responsividade testada (DevTools)

---

## 🎯 Diferenças da Fase 4 vs. Fases 2-3

| Aspecto | Fases 2-3 (Planos/Quadras) | Fase 4 (Usuários) |
|---------|---------------------------|-------------------|
| **Model** | Criado do zero | Model existente (User), apenas atualizado |
| **Seeder** | Criado e executado | Já tinha dados de teste da autenticação |
| **Rotas** | apiResource simples | apiResource + endpoint custom `/status` |
| **Validação** | Create/Update Request | Idem, mas senha **opcional** ao editar |
| **Controller** | 5 métodos (index, show, store, update, destroy) | 6 métodos (+ `updateStatus()`) |
| **Frontend** | Service + Page | Idem |
| **Formatação** | `formatCurrency()`, `formatDate()` | `formatCPF()`, `formatPhone()`, `formatDate()` |
| **Proteções** | Nenhuma especial | Impede deletar a si mesmo |
| **Badges** | Status (ativa/inativa) | Status + Papel (4 tipos, 5 cores) |

---

## 📈 Próximos Passos

**Roadmap Atualizado** (ordem estratégica):

1. ✅ **Fase 1**: Autenticação (Login/Register/Logout) - CONCLUÍDO
2. ✅ **Fase 2**: Admin - Quadras CRUD - CONCLUÍDO
3. ✅ **Fase 3**: Admin - Planos CRUD - CONCLUÍDO
4. ✅ **Fase 4**: Admin - Gestão de Usuários - **CONCLUÍDO** ✨
5. 🔜 **Fase 5**: Admin - Personal Trainers (CRUD + Disponibilidade)
6. 🔜 **Fase 6**: Aluno - Assinaturas (Assinar/Cancelar Plano)
7. 🔜 **Fase 7**: Admin - Aulas (CRUD Turmas + Gerar Ocorrências)
8. 🔜 **Fase 8**: Aluno - Reservas de Quadras (com Anti-Overlap)
9. 🔜 **Fase 9**: Pagamentos (Gateway + Webhooks)
10. 🔜 **Fase 10**: Refinamentos (Relatórios, Dashboard real, etc)

**Próxima Fase**: **Fase 5 - Personal Trainers** (Gestão de instrutores com disponibilidade e agendamentos 1:1)

---

## 💡 Aprendizados

1. **Model Mapping é Crítico**: Laravel espera `users`, `id`, `created_at`, mas o DDL define `usuarios`, `id_usuario`, `criado_em`. Sempre mapear corretamente!
2. **Senha Opcional ao Editar**: Não enviar campo `senha` se estiver vazio (DELETE antes de update).
3. **Auto-Exclusão**: Importante prevenir que admin delete sua própria conta (gera lock-out).
4. **TypeScript Ajuda**: Interfaces impedem erros de digitação em campos (ex: `pape` vs `papel`).
5. **Formatação Visual é Essencial**: `formatCPF()` e `formatPhone()` fazem ENORME diferença na UX.
6. **Pattern é Poderoso**: Seguir pattern de Fases 2-3 acelerou MUITO o desenvolvimento.
7. **Toast > Alert**: Toasts são menos intrusivos e mais modernos que `window.alert()`.
8. **Toggle de Status**: Feature simples mas muito útil (evita editar só para ativar/desativar).

---

## 📚 Referências

- **Backend**: `api/database/ddl.sql` → tabela `usuarios`
- **Padrão CRUD**: Fases 2-3 (Plans.tsx, Courts.tsx)
- **Formatadores**: `web/src/lib/utils.ts` → `formatCPF()`, `formatPhone()`, `formatDate()`
- **Validações**: Laravel Form Requests → [Docs Laravel 10](https://laravel.com/docs/10.x/validation#form-request-validation)
- **Sanctum**: `api/app/Models/User.php` → `getAuthPassword()` override

---

**Fase 4 Concluída com Sucesso! 🎉**  
Sistema agora tem **Gestão de Usuários** completa, pronto para próximas features que dependem de diferentes papéis (Personal, Assinaturas, Aulas).
