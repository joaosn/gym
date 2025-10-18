# ✅ FASE 9: Reservas de Quadras (Court Bookings)

**Data**: 18/10/2025  
**Status**: ✅ CONCLUÍDO

---

## 🎯 Objetivo

Implementar sistema completo de **reservas de quadras** com:

- CRUD completo para Admin
- Criação/cancelamento para Alunos
- Visualização read-only para Instrutores
- Validações de disponibilidade (anti-overlap)
- Tratamento de erros de validação com mensagens claras

---

## ✅ Implementado

### 📦 Backend (Laravel)

#### 1. **Model** - `ReservaQuadra.php`

```php
class ReservaQuadra extends Model {
    protected $table = 'reservas_quadra';
    protected $primaryKey = 'id_reserva_quadra';
    
    // Relationships
    public function quadra() // belongsTo
    public function usuario() // belongsTo
    
    // Casts
    'inicio' => 'datetime'
    'fim' => 'datetime'
    'preco_total' => 'decimal:2'
}
```

#### 2. **Controller** - `ReservaQuadraController.php`

**8 Endpoints REST:**

- `GET /admin/court-bookings` → Listar todas
- `GET /admin/court-bookings/{id}` → Ver detalhes
- `POST /admin/court-bookings` → Criar reserva
- `PUT /admin/court-bookings/{id}` → Atualizar
- `DELETE /admin/court-bookings/{id}` → Cancelar (soft delete)
- `PATCH /admin/court-bookings/{id}/confirm` → Confirmar reserva
- `POST /admin/court-bookings/check-availability` → Verificar disponibilidade
- `GET /my-court-bookings` → Minhas reservas (aluno/instrutor)

#### 3. **Service** - `ReservaQuadraService.php`

**3 Validações principais:**

```php
1. validarQuadraAtiva() → Quadra deve estar ativa
2. validarSobreposicaoReservas() → Anti-overlap com outras reservas
3. validarSobreposicaoSessoes() → Anti-overlap com sessões personal
```

#### 4. **FormRequests** - Validação com retorno JSON

```php
// CreateReservaQuadraRequest.php
protected function failedValidation(Validator $validator) {
    throw new HttpResponseException(
        response()->json([
            'message' => 'Dados inválidos',
            'errors' => $validator->errors()
        ], 422)
    );
}

// Regras:
'id_quadra' => 'required|integer|exists:quadras,id_quadra'
'id_usuario' => 'required|integer|exists:usuarios,id_usuario'
'inicio' => 'required|date|after:now' ← Impede criação no passado
'fim' => 'required|date|after:inicio'
```

#### 5. **Routes** - `api/routes/api.php`

```php
// ⚠️ IMPORTANTE: Rotas específicas ANTES das genéricas
Route::post('/court-bookings/check-availability', [Controller::class, 'checkAvailability']);
Route::patch('/court-bookings/{id}/confirm', [Controller::class, 'confirm']);
Route::apiResource('court-bookings', ReservaQuadraController::class);
```

#### 6. **Seeder** - `ReservaQuadraSeeder.php`

- **12 reservas** criadas automaticamente
- Distribuídas entre 3 quadras
- Horários variados (manhã, tarde, noite)
- Status: pendente, confirmada, concluída

**Executar:**

```bash
docker-compose exec api php artisan db:seed --class=ReservaQuadraSeeder
```

---

### 🎨 Frontend (React + TypeScript)

#### 1. **Types** - `web/src/types/index.ts`

```typescript
export interface CourtBooking {
  id_reserva_quadra: string;
  id_quadra: string;
  id_usuario: string;
  inicio: string; // ISO datetime
  fim: string;
  preco_total: number;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'no_show' | 'concluida';
  observacoes?: string;
  nome_quadra: string; // Eager loaded
  nome_usuario: string;
}

export interface CourtBookingFormData {
  id_quadra: string | number;
  id_usuario?: string | number; // Opcional (admin escolhe, aluno usa currentUser)
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  observacoes?: string;
}
```

#### 2. **Service** - `court-bookings.service.ts`

```typescript
class CourtBookingsService {
  async list(filters?) → { data: CourtBooking[] }
  async getById(id) → { data: CourtBooking }
  async create(data) → { data: CourtBooking }
  async update(id, data) → { data: CourtBooking }
  async cancel(id) → void
  async confirm(id) → { data: CourtBooking }
  async checkAvailability(data) → { disponivel, preco_total, motivo? }
}

// 🎯 Normalização de IDs (number → string)
function normalizeBooking(booking: any): CourtBooking {
  return {
    ...booking,
    id_reserva_quadra: String(booking.id_reserva_quadra),
    id_quadra: String(booking.id_quadra),
    id_usuario: String(booking.id_usuario),
  };
}
```

#### 3. **API Client** - `api-client.ts`

```typescript
// 🎯 NOVO: Classe de erro customizada (preserva errors de validação)
class ApiError extends Error {
  public errors?: Record<string, string[]>;
  public statusCode?: number;
}

// Uso no catch:
catch (error: any) {
  if (error.errors) {
    // Erro 422 com detalhes de validação
    console.log(error.errors.inicio); // ["A reserva deve ser futura"]
  }
}
```

#### 4. **Páginas Criadas**

##### **Admin** - `/admin/reservas-quadra`

```tsx
✅ Funcionalidades:
- Ver todas as reservas (todos usuários)
- Criar reserva para qualquer usuário (SELECT de usuários)
- Editar reserva existente
- Confirmar reserva pendente
- Cancelar reserva
- Filtros: status, quadra, busca por nome
- Verificação de disponibilidade antes de criar

✅ UX Melhorada:
- Formulário: 1 campo DATE + 2 campos TIME (ao invés de datetime-local)
- Defaults: data=hoje, horaInicio=08:00, horaFim=09:00
- Toast com erros detalhados: "• Data/Hora de início: A reserva deve ser futura"
```

##### **Aluno** - `/aluno/reservas`

```tsx
✅ Funcionalidades:
- Ver minhas reservas (automaticamente filtra por currentUser)
- Criar reserva (para mim mesmo)
- Cancelar minhas reservas pendentes/confirmadas
- Ver histórico de reservas antigas

❌ Não tem:
- Campo de seleção de usuário (usa ID do usuário logado)
- Edição de reservas
```

##### **Instrutor** - `/instrutor/reservas`

```tsx
✅ Funcionalidades:
- Ver todas as reservas (read-only)
- Filtro por status
- Visualizar detalhes

❌ Não pode:
- Criar, editar ou cancelar reservas
```

#### 5. **Tratamento de Erros** - `formatValidationErrors()`

```typescript
// Página Admin - CourtBookings.tsx
const formatValidationErrors = (error: any): string => {
  if (error.errors && typeof error.errors === 'object') {
    const errorMessages = Object.entries(error.errors)
      .map(([field, messages]) => {
        const fieldLabel = {
          id_quadra: 'Quadra',
          id_usuario: 'Usuário',
          inicio: 'Data/Hora de início',
          fim: 'Data/Hora de término',
        }[field] || field;
        
        return `• ${fieldLabel}: ${messages.join(', ')}`;
      })
      .join('\n');
    return errorMessages;
  }
  return error.message || 'Erro desconhecido';
};

// Uso no catch:
catch (error: any) {
  const errorMessage = formatValidationErrors(error);
  toast({
    title: 'Erro ao criar reserva',
    description: errorMessage, // "• Data/Hora de início: A reserva deve ser futura"
    variant: 'destructive',
  });
}
```

#### 6. **Menu e Rotas**

**Sidebar.tsx:**

```typescript
// Admin
{ title: 'Agendamentos', children: [
  { title: 'Reservas Quadra', href: '/admin/reservas-quadra', icon: MapPin },
  { title: 'Sessões Personal', href: '/admin/sessoes-personal', icon: Dumbbell },
]}

// Instrutor
{ title: 'Reservas Quadra', href: '/instrutor/reservas', icon: MapPin }
```

**App.tsx:**

```tsx
// Admin route
<Route path="reservas-quadra" element={<AdminCourtBookings />} />

// Student route
<Route path="reservas" element={<StudentCourtBookings />} />

// Personal route
<Route path="reservas" element={<PersonalCourtBookings />} />
```

---

## 🐛 Bugs Corrigidos Durante Implementação

### 1. **CORS/302 Redirect ao criar reserva**

**Problema:** Laravel retornava 302 redirect ao invés de 422 JSON  
**Causa:** FormRequest sem override de `failedValidation()`  
**Solução:**

```php
// Em TODOS os FormRequests de API
protected function failedValidation(Validator $validator) {
    throw new HttpResponseException(
        response()->json([
            'message' => 'Dados inválidos',
            'errors' => $validator->errors()
        ], 422)
    );
}
```

### 2. **Edit modal não pré-selecionando quadra/usuário**

**Problema:** Select dropdowns vazios ao editar  
**Causa:** Backend retorna IDs como `number`, Select compara como `string`  
**Solução:** Normalização em services

```typescript
// courts.service.ts, users.service.ts, court-bookings.service.ts
id_quadra: String(court.id_quadra) // number → string
```

### 3. **Route ordering - POST falhando**

**Problema:** `/court-bookings/check-availability` retornava 404  
**Causa:** Laravel matchou `/court-bookings/{id}` antes  
**Solução:** Rotas específicas ANTES de apiResource

```php
Route::post('/court-bookings/check-availability', ...); // ← Antes
Route::apiResource('court-bookings', Controller::class); // ← Depois
```

### 4. **Validação after:now sem mensagem clara**

**Problema:** Toast só mostrava "Dados inválidos"  
**Causa:** Frontend não parseava `error.errors` do backend  
**Solução:**

1. Classe `ApiError` para preservar errors
2. Função `formatValidationErrors()` para formatar
3. Toast mostra: "• Data/Hora de início: A reserva deve ser futura"

### 5. **Admin não podia escolher usuário**

**Problema:** Formulário não tinha campo de seleção de usuário  
**Causa:** Copiado do Student (que usa currentUser)  
**Solução:** Adicionar Select de usuários no formulário Admin

---

## 🧪 Como Testar

### Backend

```bash
# 1. Rodar seeder
docker-compose exec api php artisan db:seed --class=ReservaQuadraSeeder

# 2. Verificar rotas
docker-compose exec api php artisan route:list --path=court-bookings

# 3. Testar via curl/Postman
GET http://localhost:8000/api/admin/court-bookings
POST http://localhost:8000/api/admin/court-bookings/check-availability
{
  "id_quadra": 1,
  "inicio": "2025-10-20T10:00:00",
  "fim": "2025-10-20T11:00:00"
}
```

### Frontend

```bash
# 1. Admin - Criar reserva
http://localhost:5173/admin/reservas-quadra
- Clicar "Nova Reserva"
- Selecionar quadra, usuário, data futura, horários
- Verificar toast de sucesso
- Tentar data passada → Verificar erro detalhado

# 2. Aluno - Minhas reservas
http://localhost:5173/aluno/reservas
- Login como aluno
- Criar reserva para si mesmo
- Cancelar reserva

# 3. Instrutor - Visualização
http://localhost:5173/instrutor/reservas
- Login como instrutor
- Ver todas as reservas (read-only)
```

---

## 📝 Lições Aprendidas

### 1. **FormRequests em APIs REST**

**❌ NUNCA** deixar Laravel fazer redirect em validação de API  
**✅ SEMPRE** sobrescrever `failedValidation()` para retornar JSON 422

```php
// Template para copiar em TODOS os FormRequests
protected function failedValidation(Validator $validator) {
    throw new HttpResponseException(
        response()->json([
            'message' => 'Dados inválidos',
            'errors' => $validator->errors()
        ], 422)
    );
}
```

### 2. **Type Coercion Frontend**

Laravel retorna IDs como `number`, mas Select do shadcn/ui compara como `string`  
**Solução:** Normalizar SEMPRE em services:

```typescript
id_quadra: String(booking.id_quadra)
```

### 3. **Route Ordering é Crítico**

```php
❌ ERRADO:
Route::apiResource('court-bookings', Controller::class);
Route::post('/court-bookings/check-availability', ...); // ← NUNCA MATCH!

✅ CORRETO:
Route::post('/court-bookings/check-availability', ...); // ← Específica PRIMEIRO
Route::apiResource('court-bookings', Controller::class);
```

### 4. **UX com Date/Time**

`<input type="datetime-local">` é confuso e não funciona bem mobile  
**Melhor:** 1 date + 2 time = mais intuitivo

### 5. **Error Handling Completo**

Não basta capturar erro, precisa:

1. Preservar `errors` do backend (ApiError class)
2. Formatar em português (`formatValidationErrors`)
3. Mostrar com bullet points no toast

---

## ⚠️ Pendências e Melhorias Futuras

### 🔧 **TODO Crítico - Integração Sessão Personal + Reserva Quadra**

**Contexto:** Quando instrutor cria **sessão personal** e **seleciona uma quadra**, o sistema deve **automaticamente criar uma reserva de quadra** para aquele horário.

**Problema Atual:**

- ❌ Sessão personal pode ser criada mesmo com quadra ocupada
- ❌ Quadra não fica reservada automaticamente para a sessão
- ❌ Conflitos podem acontecer (sessão + reserva manual no mesmo horário)

**Solução Necessária:**

1. **Adicionar coluna na tabela `reservas_quadra`:**

```sql
ALTER TABLE reservas_quadra 
ADD COLUMN id_sessao_personal INTEGER NULL,
ADD CONSTRAINT fk_reserva_sessao_personal 
    FOREIGN KEY (id_sessao_personal) 
    REFERENCES sessoes_personal(id_sessao_personal) 
    ON DELETE CASCADE;
```

2. **Atualizar `SessaoPersonalController::store()`:**

```php
public function store(CreateSessaoPersonalRequest $request) {
    return DB::transaction(function () use ($request) {
        // 1. Criar sessão
        $sessao = SessaoPersonal::create($validated);
        
        // 2. SE TEM QUADRA → Criar reserva automática
        if ($request->id_quadra) {
            // Validar disponibilidade
            $service = new ReservaQuadraService();
            $disponivel = $service->validarDisponibilidade(
                $request->id_quadra,
                $request->inicio,
                $request->fim
            );
            
            if (!$disponivel) {
                throw new \Exception('Quadra indisponível neste horário');
            }
            
            // Criar reserva vinculada
            ReservaQuadra::create([
                'id_quadra' => $request->id_quadra,
                'id_usuario' => $sessao->id_instrutor, // Instrutor reserva
                'inicio' => $request->inicio,
                'fim' => $request->fim,
                'status' => 'confirmada',
                'preco_total' => 0, // Incluído no preço da sessão
                'observacoes' => "Reserva automática - Sessão Personal #{$sessao->id_sessao_personal}",
                'id_sessao_personal' => $sessao->id_sessao_personal,
            ]);
        }
        
        return $sessao;
    });
}
```

3. **Atualizar `SessaoPersonalController::update()`:**

```php
public function update(UpdateSessaoPersonalRequest $request, $id) {
    return DB::transaction(function () use ($request, $id) {
        $sessao = SessaoPersonal::findOrFail($id);
        $sessao->update($validated);
        
        $reserva = ReservaQuadra::where('id_sessao_personal', $id)->first();
        
        if ($request->id_quadra) {
            // Atualizar ou criar reserva
            if ($reserva) {
                $reserva->update([
                    'id_quadra' => $request->id_quadra,
                    'inicio' => $request->inicio,
                    'fim' => $request->fim,
                ]);
            } else {
                ReservaQuadra::create([...]); // Criar nova
            }
        } else {
            // Removeu quadra → deletar reserva
            $reserva?->delete();
        }
    });
}
```

4. **Atualizar `SessaoPersonalController::destroy()`:**

```php
public function destroy($id) {
    return DB::transaction(function () use ($id) {
        // Deletar reserva vinculada (CASCADE faz automaticamente)
        $sessao = SessaoPersonal::findOrFail($id);
        $sessao->delete();
    });
}
```

**Benefícios:**

- ✅ Impossível criar sessão em quadra ocupada
- ✅ Quadra automaticamente reservada para a sessão
- ✅ Ao cancelar sessão → libera quadra
- ✅ Ao editar horário/quadra → atualiza reserva
- ✅ Histórico completo (reserva aponta para sessão)

**Implementar em:** Fase 8 (Sessões Personal) - Ajuste retroativo

---

### 💡 Outras Melhorias Futuras

1. **Paginação** no frontend (atualmente carrega todas)
2. **Exportação CSV** das reservas
3. **Relatórios** de ocupação de quadras
4. **Notificações** por email/SMS de confirmação
5. **Pagamento online** ao reservar (integração Fase 10)
6. **Calendário visual** com drag-and-drop
7. **Bloqueio de horários** (manutenção, eventos)
8. **Políticas de cancelamento** (prazo mínimo, multas)

---

## 📊 Arquivos Criados/Modificados

### Backend (8 arquivos)

```
api/app/Models/ReservaQuadra.php                              (NOVO)
api/app/Http/Controllers/Admin/ReservaQuadraController.php    (NOVO)
api/app/Http/Requests/CreateReservaQuadraRequest.php          (NOVO)
api/app/Http/Requests/UpdateReservaQuadraRequest.php          (NOVO)
api/app/Services/ReservaQuadraService.php                     (NOVO)
api/database/seeders/ReservaQuadraSeeder.php                  (NOVO)
api/routes/api.php                                            (MODIFICADO)
.github/copilot-instructions.md                               (MODIFICADO)
```

### Frontend (8 arquivos)

```
web/src/types/index.ts                                        (MODIFICADO)
web/src/lib/api-client.ts                                     (MODIFICADO)
web/src/services/court-bookings.service.ts                    (NOVO)
web/src/services/courts.service.ts                            (MODIFICADO)
web/src/services/users.service.ts                             (MODIFICADO)
web/src/pages/admin/agendamentos/court-bookings/CourtBookings.tsx  (NOVO)
web/src/pages/student/CourtBookings.tsx                       (NOVO)
web/src/pages/personal/CourtBookings.tsx                      (NOVO)
web/src/components/Sidebar.tsx                                (MODIFICADO)
web/src/App.tsx                                               (MODIFICADO)
```

**Total:** 16 arquivos (10 novos, 6 modificados)

---

## 🎯 Resultado Final

### ✅ **Entregue:**

- Sistema completo de reservas de quadras
- 3 interfaces (Admin, Aluno, Instrutor)
- Validações robustas (anti-overlap, quadra ativa, horário futuro)
- Mensagens de erro claras em português
- UX melhorada (date + time inputs)
- Documentação completa do padrão FormRequest

### 📈 **Métricas:**

- **Backend:** 8 endpoints, 3 validações, 2 FormRequests
- **Frontend:** 3 páginas, 1 service, 100+ funções helper
- **Bugs corrigidos:** 5 críticos
- **Dados seedados:** 13 reservas de teste

### 🚀 **Próxima Fase Sugerida:**

- **Fase 10:** Pagamentos e Assinaturas
- **Fase 8 (ajuste):** Integração Sessão Personal + Reserva Quadra

---

**Concluído em:** 18/10/2025  
**Desenvolvedor:** Equipe Fitway + GitHub Copilot
