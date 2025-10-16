# 🎯 Plano de Ação: Fitway - Desenvolvimento Full Stack

**Última Atualização**: 15 de outubro de 2025

---

## 🎉 Status Atual do Projeto

### ✅ CONCLUÍDO
- ✅ **Fase 1: Autenticação** - Login/Register/Logout com Laravel Sanctum
- ✅ **Fase 2: Admin - Quadras (CRUD)** - Gestão completa de quadras
- ✅ **Fase 3: Admin - Planos (CRUD)** - Gestão completa de planos de assinatura
- ✅ **Fase 4: Admin - Usuários (CRUD)** - Gestão de alunos/personals/instrutores/admins
- ✅ **Utilitários de UX** - 23 funções de formatação e validação

### 🔄 EM PROGRESSO
- 🚀 **Fase 5: Admin - Personal Trainers (CRUD + Disponibilidade)** ← **PRÓXIMO PASSO**

### 📊 Stack Tecnológica
- **Backend**: Laravel 10 + PHP 8.4 + PostgreSQL 16
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Autenticação**: Laravel Sanctum (Bearer Token)
- **Infraestrutura**: Docker Compose (5 containers)

---

## �️ ROADMAP ATUALIZADO (Ordem Estratégica)

### ✅ Fase 1: Autenticação (CONCLUÍDA)
- **Status**: ✅ 100% Completo
- **Backend**: AuthController, LoginRequest, RegisterRequest, Sanctum
- **Frontend**: auth.service.ts conectado à API
- **Testado**: Login com admin/personal/aluno
- **Documentação**: `docs/FASE_1_CONCLUIDA.md`

### ✅ Fase 2: Admin - Quadras (CONCLUÍDA)
- **Status**: ✅ 100% Completo
- **Backend**: QuadraController (6 endpoints), CreateQuadraRequest, UpdateQuadraRequest
- **Frontend**: Courts.tsx com CRUD completo, formatCurrency() aplicado
- **Testado**: Criar, editar, listar, excluir, toggle status
- **Documentação**: `docs/FASE_2_CONCLUIDA.md`

### ✅ Fase 3: Admin - Planos (CONCLUÍDA)
- **Status**: ✅ 100% Completo
- **Backend**: PlanoController (6 endpoints), CreatePlanoRequest, UpdatePlanoRequest, PlanosSeeder (5 planos)
- **Frontend**: Plans.tsx com CRUD completo, formatCurrency() + formatDate() aplicados
- **Testado**: Criar, editar, listar, excluir, toggle status
- **Documentação**: `docs/FASE_3_CONCLUIDA.md`

---

### �🚀 Fase 4: Admin - Gestão de Usuários (EM ANDAMENTO)
**Objetivo**: Admin cadastrar e gerenciar alunos/personals

**Backend**:
- [ ] Model `Usuario` (já existe, verificar)
- [ ] `CreateUserRequest` - Validar criação (email único, CPF, telefone)
- [ ] `UpdateUserRequest` - Validar edição
- [ ] `UserController` (Admin namespace)
  - `index()` - Listar com filtros (papel, status, search, paginação)
  - `show($id)` - Ver detalhes
  - `store()` - Criar novo (aluno/personal/instrutor)
  - `update($id)` - Editar
  - `destroy($id)` - Excluir
  - `updateStatus($id)` - Ativar/Desativar
- [ ] Routes `/admin/users` + `/admin/users/{id}/status`

**Frontend**:
- [ ] Types: `UserFormData` (User já existe)
- [ ] Service: `users.service.ts` (métodos admin)
- [ ] Página: `web/src/pages/admin/Users.tsx`
  - Grid responsivo de usuários
  - Filtros (papel, status, busca)
  - Modal criar/editar
  - Toggle status
  - Confirmação de exclusão
  - **Formatação**: `formatCPF()`, `formatPhone()`, `formatDate()`

**Tempo Estimado**: 1-2 dias

---

### 📅 Fase 5: Personal Trainers (Instrutores + Sessões)
**Objetivo**: Gestão de instrutores e agendamento de sessões 1:1

**Backend**:
- [ ] Model `Instrutor` (relacionado com `usuarios` via `id_usuario`)
- [ ] Model `DisponibilidadeInstrutor` (horários semanais)
- [ ] Model `SessaoPersonal` (anti-overlap por instrutor)
- [ ] `InstrutorController` (CRUD instrutores)
- [ ] `DisponibilidadeController` (CRUD disponibilidade)
- [ ] `SessaoPersonalController` (CRUD sessões + validação overlap)
- [ ] Routes `/admin/instructors`, `/personal/availability`, `/sessions`

**Frontend**:
- [ ] Admin: `Instructors.tsx` (listar, criar, editar instrutores)
- [ ] Personal: `Availability.tsx` (definir disponibilidade semanal)
- [ ] Student: `PersonalTrainers.tsx` (buscar, ver agenda, agendar)

**Tempo Estimado**: 3-4 dias

---

### 📅 Fase 6: Assinaturas (Planos → Alunos)
**Objetivo**: Conectar alunos aos planos e gerenciar assinaturas

**Backend**:
- [ ] Model `Assinatura` (relacionamento Usuario + Plano)
- [ ] Model `EventoAssinatura` (histórico: criada, renovada, cancelada)
- [ ] `AssinaturaController`
  - Admin: listar todas, criar, editar, cancelar
  - Aluno: ver minha assinatura, assinar plano, cancelar
- [ ] Lógica de negócio:
  - Calcular `proximo_vencimento` baseado em `ciclo_cobranca`
  - Permitir apenas 1 assinatura ativa por usuário
- [ ] Routes `/admin/subscriptions`, `/subscriptions/me`

**Frontend**:
- [ ] Admin: `Subscriptions.tsx` (listar, criar, editar)
- [ ] Student: `MyPlan.tsx` (ver plano atual, histórico, cancelar)

**Tempo Estimado**: 2-3 dias

---

### 📅 Fase 7: Aulas (Turmas em Grupo)
**Objetivo**: Gestão de aulas em grupo com horários recorrentes

**Backend**:
- [ ] Model `Aula` (nome, esporte, nível, capacidade, preço)
- [ ] Model `HorarioAula` (recorrência semanal: ex. Terça 18h)
- [ ] Model `OcorrenciaAula` (aulas concretas geradas no calendário)
- [ ] Model `InscricaoAula` (alunos inscritos em ocorrências)
- [ ] `AulaController` (CRUD aulas + horários)
- [ ] `OcorrenciaController` (gerar ocorrências, listar, cancelar)
- [ ] `InscricaoController` (inscrever, cancelar, validar capacidade)
- [ ] Service: Gerador de ocorrências (recorrência semanal)
- [ ] Routes `/admin/classes`, `/classes`, `/class-enrollments`

**Frontend**:
- [ ] Admin: `Classes.tsx` (CRUD aulas + configurar horários)
- [ ] Admin: `ClassSchedule.tsx` (gerar ocorrências, cancelar)
- [ ] Student: `AvailableClasses.tsx` (ver aulas, inscrever-se)

**Tempo Estimado**: 5-6 dias (mais complexo: recorrência + anti-overlap)

---

### 📅 Fase 8: Reservas de Quadras (Aluno)
**Objetivo**: Aluno reservar quadras com anti-overlap

**Backend**:
- [ ] Model `ReservaQuadra` (já tem no DDL)
- [ ] `ReservaQuadraController`
  - Aluno: criar, listar minhas, cancelar
  - Admin: listar todas, criar, cancelar
- [ ] Service: Validação anti-overlap (constraint GIST)
- [ ] Routes `/court-bookings`, `/admin/court-bookings`

**Frontend**:
- [ ] Student: `Courts.tsx` (buscar quadras, ver disponibilidade, reservar)
- [ ] Student: `MyBookings.tsx` (listar minhas reservas, cancelar)
- [ ] Admin: `CourtBookings.tsx` (listar todas as reservas)

**Tempo Estimado**: 3-4 dias

---

### 📅 Fase 9: Pagamentos (Básico)
**Objetivo**: Registrar pagamentos (checkout simulado ou real)

**Backend**:
- [ ] Model `Pagamento`
- [ ] Model `ItemPagamento` (referência a reserva/assinatura/aula)
- [ ] Model `WebhookPagamento` (registrar eventos externos)
- [ ] `PagamentoController` (criar checkout, webhook)
- [ ] Routes `/payments/checkout`, `/payments/webhook`

**Frontend**:
- [ ] `CheckoutPage.tsx` (simulação ou integração real)
- [ ] `PaymentHistory.tsx` (histórico de pagamentos)

**Tempo Estimado**: 4-5 dias

---

### 📅 Fase 10: Refinamentos e Testes
- [ ] Testes de integração (PHPUnit)
- [ ] Validações de UX em todas as páginas
- [ ] Documentação final
- [ ] Deploy (opcional)

**Tempo Estimado**: 3-4 dias

---

### Objetivo
Substituir o mock de autenticação por integração real com Laravel Sanctum.

### Backend: Criar Endpoints de Autenticação

#### 1.1. Model Usuario
**Arquivo**: `api/app/Models/Usuario.php`

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome',
        'email',
        'senha_hash',
        'telefone',
        'documento',
        'data_nascimento',
        'papel',
        'status',
    ];

    protected $hidden = [
        'senha_hash',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    // Override para Sanctum usar o campo correto
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }
}
```

**Comando**:
```powershell
docker-compose exec api php artisan make:model Usuario
# Editar manualmente conforme acima
```

---

#### 1.2. Form Requests
**Arquivo**: `api/app/Http/Requests/LoginRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'O email é obrigatório',
            'email.email' => 'Email inválido',
            'password.required' => 'A senha é obrigatória',
            'password.min' => 'A senha deve ter no mínimo 6 caracteres',
        ];
    }
}
```

**Arquivo**: `api/app/Http/Requests/RegisterRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
        ];
    }
}
```

**Comandos**:
```powershell
docker-compose exec api php artisan make:request LoginRequest
docker-compose exec api php artisan make:request RegisterRequest
# Editar manualmente conforme acima
```

---

#### 1.3. AuthController
**Arquivo**: `api/app/Http/Controllers/AuthController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $usuario = Usuario::where('email', $request->email)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->senha_hash)) {
            return response()->json([
                'message' => 'Email ou senha incorretos',
            ], 401);
        }

        if ($usuario->status !== 'ativo') {
            return response()->json([
                'message' => 'Usuário inativo. Entre em contato com o suporte.',
            ], 403);
        }

        // Revogar tokens anteriores (opcional, para single-session)
        // $usuario->tokens()->delete();

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
                'name' => $usuario->nome,
                'email' => $usuario->email,
                'phone' => $usuario->telefone,
                'role' => $usuario->papel,
                'createdAt' => $usuario->criado_em->toISOString(),
            ],
            'access_token' => $token,
        ], 200);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $usuario = Usuario::create([
            'nome' => $request->name,
            'email' => $request->email,
            'senha_hash' => Hash::make($request->password),
            'telefone' => $request->phone,
            'papel' => 'aluno', // Novos usuários sempre como aluno
            'status' => 'ativo',
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
                'name' => $usuario->nome,
                'email' => $usuario->email,
                'phone' => $usuario->telefone,
                'role' => $usuario->papel,
                'createdAt' => $usuario->criado_em->toISOString(),
            ],
            'access_token' => $token,
        ], 201);
    }

    public function me(): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        return response()->json([
            'user' => [
                'id' => (string) $usuario->id_usuario,
                'name' => $usuario->nome,
                'email' => $usuario->email,
                'phone' => $usuario->telefone,
                'role' => $usuario->papel,
                'createdAt' => $usuario->criado_em->toISOString(),
            ],
        ], 200);
    }

    public function logout(): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = Auth::user();
        $usuario->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ], 200);
    }
}
```

**Comando**:
```powershell
docker-compose exec api php artisan make:controller AuthController
# Editar manualmente conforme acima
```

---

#### 1.4. Rotas de Autenticação
**Arquivo**: `api/routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Rotas públicas de autenticação
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Rotas autenticadas (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Health check (público)
Route::get('/healthz', function () {
    return response()->json(['status' => 'ok'], 200);
});
```

---

#### 1.5. Configurar Sanctum
**Arquivo**: `api/config/sanctum.php`

Verificar se `stateful` está configurado:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173,localhost:3000,127.0.0.1,127.0.0.1:8000,::1')),
```

**Arquivo**: `api/.env.docker`

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Arquivo**: `api/config/cors.php`

```php
'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
'supports_credentials' => true,
```

---

#### 1.6. Criar Usuários de Teste (Seeder)
**Arquivo**: `api/database/seeders/UsuariosSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UsuariosSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            [
                'nome' => 'Admin Fitway',
                'email' => 'admin@fitway.com',
                'senha_hash' => Hash::make('admin123'),
                'telefone' => '11999999999',
                'papel' => 'admin',
                'status' => 'ativo',
            ],
            [
                'nome' => 'Personal João',
                'email' => 'personal@fitway.com',
                'senha_hash' => Hash::make('personal123'),
                'telefone' => '11988888888',
                'papel' => 'personal',
                'status' => 'ativo',
            ],
            [
                'nome' => 'Aluno Maria',
                'email' => 'aluno@fitway.com',
                'senha_hash' => Hash::make('aluno123'),
                'telefone' => '11977777777',
                'papel' => 'aluno',
                'status' => 'ativo',
            ],
        ];

        foreach ($usuarios as $usuario) {
            Usuario::create($usuario);
        }
    }
}
```

**Comandos**:
```powershell
docker-compose exec api php artisan make:seeder UsuariosSeeder
# Editar manualmente conforme acima

# Rodar seeder
docker-compose exec api php artisan db:seed --class=UsuariosSeeder
```

---

### Frontend: Remover Mock de auth.service.ts

#### 1.7. Atualizar auth.service.ts
**Arquivo**: `web/src/services/auth.service.ts`

```typescript
import { User } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    localStorage.setItem('user_data', JSON.stringify(response.user));
    return response.user;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getUserFromStorage(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

export const authService = new AuthService();
```

---

#### 1.8. Atualizar RegisterPage.tsx
**Arquivo**: `web/src/pages/RegisterPage.tsx`

Adicionar campo `password_confirmation`:

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: ''
});

// ... no JSX, adicionar campo de confirmação após o campo senha
```

---

### Testes da Fase 1

```powershell
# 1. Subir ambiente
docker-compose up -d db api frontend-dev

# 2. Rodar migrations
docker-compose exec api php artisan migrate

# 3. Rodar seeder
docker-compose exec api php artisan db:seed --class=UsuariosSeeder

# 4. Testar endpoints manualmente
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitway.com","password":"admin123"}'

# 5. Abrir frontend
http://localhost:5173/login
```

**Credenciais de Teste**:
- Admin: `admin@fitway.com` / `admin123`
- Personal: `personal@fitway.com` / `personal123`
- Aluno: `aluno@fitway.com` / `aluno123`

---

## 🏢 Fase 2: Área Administrativa - Quadras

### Backend: CRUD de Quadras

#### 2.1. Model Quadra
**Arquivo**: `api/app/Models/Quadra.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quadra extends Model
{
    protected $table = 'quadras';
    protected $primaryKey = 'id_quadra';
    
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome',
        'localizacao',
        'esporte',
        'preco_hora',
        'caracteristicas_json',
        'status',
    ];

    protected $casts = [
        'caracteristicas_json' => 'array',
        'preco_hora' => 'decimal:2',
        'criado_em' => 'datetime',
        'atualizado_em' => 'datetime',
    ];

    public function reservas()
    {
        return $this->hasMany(ReservaQuadra::class, 'id_quadra', 'id_quadra');
    }

    public function bloqueios()
    {
        return $this->hasMany(BloqueioQuadra::class, 'id_quadra', 'id_quadra');
    }
}
```

---

#### 2.2. QuadraController (Admin)
**Arquivo**: `api/app/Http/Controllers/Admin/QuadraController.php`

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quadra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuadraController extends Controller
{
    public function index(): JsonResponse
    {
        $quadras = Quadra::orderBy('nome')->get()->map(function ($quadra) {
            return [
                'id' => (string) $quadra->id_quadra,
                'name' => $quadra->nome,
                'location' => $quadra->localizacao,
                'sport' => $quadra->esporte,
                'pricePerHour' => (float) $quadra->preco_hora,
                'features' => $quadra->caracteristicas_json ?? [],
                'isActive' => $quadra->status === 'ativa',
            ];
        });

        return response()->json(['data' => $quadras], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'sport' => 'required|string|max:100',
            'pricePerHour' => 'required|numeric|min:0',
            'features' => 'nullable|array',
            'isActive' => 'boolean',
        ]);

        $quadra = Quadra::create([
            'nome' => $validated['name'],
            'localizacao' => $validated['location'],
            'esporte' => $validated['sport'],
            'preco_hora' => $validated['pricePerHour'],
            'caracteristicas_json' => $validated['features'] ?? [],
            'status' => ($validated['isActive'] ?? true) ? 'ativa' : 'inativa',
        ]);

        return response()->json([
            'data' => [
                'id' => (string) $quadra->id_quadra,
                'name' => $quadra->nome,
                'location' => $quadra->localizacao,
                'sport' => $quadra->esporte,
                'pricePerHour' => (float) $quadra->preco_hora,
                'features' => $quadra->caracteristicas_json,
                'isActive' => $quadra->status === 'ativa',
            ]
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $quadra = Quadra::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'sport' => 'sometimes|string|max:100',
            'pricePerHour' => 'sometimes|numeric|min:0',
            'features' => 'sometimes|array',
            'isActive' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) $quadra->nome = $validated['name'];
        if (isset($validated['location'])) $quadra->localizacao = $validated['location'];
        if (isset($validated['sport'])) $quadra->esporte = $validated['sport'];
        if (isset($validated['pricePerHour'])) $quadra->preco_hora = $validated['pricePerHour'];
        if (isset($validated['features'])) $quadra->caracteristicas_json = $validated['features'];
        if (isset($validated['isActive'])) $quadra->status = $validated['isActive'] ? 'ativa' : 'inativa';

        $quadra->save();

        return response()->json([
            'data' => [
                'id' => (string) $quadra->id_quadra,
                'name' => $quadra->nome,
                'location' => $quadra->localizacao,
                'sport' => $quadra->esporte,
                'pricePerHour' => (float) $quadra->preco_hora,
                'features' => $quadra->caracteristicas_json,
                'isActive' => $quadra->status === 'ativa',
            ]
        ], 200);
    }

    public function destroy($id): JsonResponse
    {
        $quadra = Quadra::findOrFail($id);
        
        // Verificar se tem reservas futuras
        $hasActiveReservations = $quadra->reservas()
            ->where('inicio', '>=', now())
            ->where('status', '!=', 'cancelada')
            ->exists();

        if ($hasActiveReservations) {
            return response()->json([
                'message' => 'Não é possível excluir quadra com reservas ativas',
            ], 422);
        }

        $quadra->delete();

        return response()->json(null, 204);
    }
}
```

---

#### 2.3. Middleware CheckRole
**Arquivo**: `api/app/Http/Middleware/CheckRole.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        if (!in_array($request->user()->papel, $roles)) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return $next($request);
    }
}
```

**Registrar em**: `api/app/Http/Kernel.php`

```php
protected $middlewareAliases = [
    // ... outros middlewares
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

---

#### 2.4. Rotas Admin (Quadras)
**Arquivo**: `api/routes/api.php`

```php
// Rotas admin (apenas admin)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('courts', Admin\QuadraController::class);
});
```

---

### Frontend: Conectar Páginas Admin de Quadras

#### 2.5. Atualizar Courts Service (Admin)
**Arquivo**: `web/src/services/courts.service.ts`

Já existe, mas adicionar tipos corretos:

```typescript
async getAdminCourts(): Promise<Court[]> {
  const response = await apiClient.get<{ data: Court[] }>('/admin/courts');
  return response.data;
}

async createAdminCourt(court: Omit<Court, 'id'>): Promise<Court> {
  const response = await apiClient.post<{ data: Court }>('/admin/courts', court);
  return response.data;
}

async updateAdminCourt(courtId: string, court: Partial<Court>): Promise<Court> {
  const response = await apiClient.patch<{ data: Court }>(`/admin/courts/${courtId}`, court);
  return response.data;
}

async deleteAdminCourt(courtId: string): Promise<void> {
  await apiClient.delete(`/admin/courts/${courtId}`);
}
```

---

#### 2.6. Atualizar AdminCourts.tsx
**Arquivo**: `web/src/pages/admin/Courts.tsx`

Substituir dados mockados por chamadas reais:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courtsService } from '@/services/courts.service';

const AdminCourts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar quadras
  const { data: courts, isLoading } = useQuery({
    queryKey: ['admin-courts'],
    queryFn: () => courtsService.getAdminCourts(),
  });

  // Deletar quadra
  const deleteMutation = useMutation({
    mutationFn: (id: string) => courtsService.deleteAdminCourt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courts'] });
      toast({ title: 'Quadra excluída com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir quadra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta quadra?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    // ... resto do JSX usando {courts?.map(...)}
  );
};
```

---

---

## 📅 Cronograma Estimado (Atualizado)

| Fase | Tarefa | Tempo Estimado | Status |
|------|--------|----------------|--------|
| **1** | **Autenticação** | **2-3 dias** | ✅ **CONCLUÍDO** |
| **2** | **Admin - Quadras** | **2 dias** | ✅ **CONCLUÍDO** |
| **3** | **Admin - Planos** | **1-2 dias** | ✅ **CONCLUÍDO** |
| **4** | **Admin - Gestão de Usuários** | **1-2 dias** | � **EM ANDAMENTO** |
| **5** | **Personal Trainers** | **3-4 dias** | 🔴 Pendente |
| **6** | **Assinaturas** | **2-3 dias** | 🔴 Pendente |
| **7** | **Aulas (Turmas)** | **5-6 dias** | 🔴 Pendente |
| **8** | **Reservas de Quadras (Aluno)** | **3-4 dias** | 🔴 Pendente |
| **9** | **Pagamentos (Básico)** | **4-5 dias** | 🔴 Pendente |
| **10** | **Refinamentos e Testes** | **3-4 dias** | 🔴 Pendente |

**Total Estimado**: ~28-37 dias úteis (~5-7 semanas)  
**Já Completado**: ~5-7 dias (Fases 1-3)  
**Restante**: ~23-30 dias

---

## ✅ Checklist de Validação (Aplicado a Cada Fase)

### Backend
- [ ] Model criado com tabela/campos corretos (verificar DDL)
- [ ] Form Requests com validações (required, unique, min, max)
- [ ] Controller com métodos RESTful (index, show, store, update, destroy)
- [ ] Rotas registradas com middleware correto (auth:sanctum, role:admin)
- [ ] Seeder criado e executado (dados de teste)
- [ ] Testado via `route:list` e Postman/Insomnia
- [ ] Erros retornam JSON padronizado

### Frontend
- [ ] Types/Interfaces criadas (mapear campos DB → camelCase)
- [ ] Service methods implementados (GET, POST, PUT, DELETE)
- [ ] Página conectada via useState/useEffect ou React Query
- [ ] Toast de sucesso/erro funcionando
- [ ] Loading states implementados (Loader2, Skeleton)
- [ ] Modais de criar/editar funcionais
- [ ] AlertDialog de confirmação para exclusão
- [ ] Filtros funcionais (Select com value="all")
- [ ] **Formatação UX**: formatCurrency(), formatDate(), formatPhone(), formatCPF()
- [ ] Testado no navegador (http://localhost:5173)

### Documentação
- [ ] Criar `docs/FASE_X_CONCLUIDA.md` com:
  - Arquivos criados/modificados
  - Comandos executados
  - Endpoints testados
  - Screenshots (opcional)

---

## 🎯 Próximos Passos Imediatos

### 🚀 AGORA: Fase 4 - Admin: Gestão de Usuários

**Objetivo**: Permitir que admin cadastre, edite e gerencie alunos/personals/instrutores.

**Por que essa ordem?**
1. ✅ Alunos são a base para todas as outras features (reservas, assinaturas, aulas)
2. ✅ Mais simples que Personal/Assinaturas/Aulas (CRUD básico)
3. ✅ Model `Usuario` já existe (usado pela autenticação)
4. ✅ Permite testar com usuários reais (não só seedados)

**Próximas etapas**:
1. Criar `CreateUserRequest` e `UpdateUserRequest`
2. Criar `UserController` no namespace `Admin`
3. Registrar rotas `/admin/users`
4. Criar `users.service.ts` no frontend
5. Criar página `Users.tsx` com CRUD completo
6. Aplicar formatações: `formatCPF()`, `formatPhone()`, `formatDate()`
7. Testar no navegador
8. Criar `docs/FASE_4_CONCLUIDA.md`

---

## 📝 Notas Importantes

- **SEMPRE verificar DDL** (`api/database/ddl.sql`) antes de criar Models
- **Usar seeders** para criar dados de teste (não manualmente no DB)
- **Docker primeiro**: todos comandos dentro dos containers
- **Commits frequentes**: commitar após cada fase concluída
- **CORS**: se der erro, verificar `.env.docker` da API
- **Formatação UX**: SEMPRE usar `formatCurrency()`, `formatDate()`, `formatPhone()`, etc
- **Select com "Todos"**: usar `value="all"`, não `value=""`
- **Benefícios em textarea**: Split por `\n`, trim, filter vazios

---

**Criado em**: 15 de outubro de 2025  
**Última Atualização**: 15 de outubro de 2025 (Fase 3 concluída, iniciando Fase 4)
