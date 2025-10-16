# ✅ FASE 2 CONCLUÍDA - ADMIN: QUADRAS (CRUD)

**Data**: 16 de outubro de 2025  
**Status**: ✅ **COMPLETO**  
**Tempo estimado**: 2 dias  
**Tempo real**: ~1 hora

---

## 📋 Resumo da Implementação

### Backend (Laravel)

#### ✅ Arquivos Criados/Modificados:

1. **Model**: `api/app/Models/Quadra.php`
   - Mapeamento da tabela `quadras` (PostgreSQL)
   - Relacionamentos: `reservas()`, `bloqueios()`
   - Scopes: `scopeDisponiveis()`, `scopePorEsporte()`
   - Casts: `caracteristicas_json` como array, `preco_hora` como decimal
   - Timestamps: `criado_em`, `atualizado_em`

2. **Form Requests**:
   - `api/app/Http/Requests/CreateQuadraRequest.php`
   - `api/app/Http/Requests/UpdateQuadraRequest.php`
   - Validação: nome único, esporte enum, preço >= 0, status (ativa|inativa)
   - Autorização: apenas `papel = 'admin'`

3. **Controller**: `api/app/Http/Controllers/Admin/QuadraController.php`
   - `index()`: Listagem paginada com filtros (esporte, status, busca)
   - `show()`: Exibir quadra por ID
   - `store()`: Criar nova quadra
   - `update()`: Atualizar quadra existente
   - `destroy()`: Excluir quadra
   - `updateStatus()`: Atualizar apenas status (ativa/inativa)

4. **Rotas**: `api/routes/api.php`
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::middleware('role:admin')->prefix('admin')->group(function () {
           Route::apiResource('courts', QuadraController::class);
           Route::patch('/courts/{id}/status', [QuadraController::class, 'updateStatus']);
       });
   });
   ```

5. **Seeder**: `api/database/seeders/QuadrasSeeder.php`
   - 7 quadras de exemplo (6 ativas, 1 inativa)
   - Esportes: beach_tennis (4x), tenis, futsal
   - Preços: R$ 75,00 a R$ 150,00/hora
   - Características: cobertura, iluminação, vestiário, etc.

---

### Frontend (React + TypeScript)

#### ✅ Arquivos Criados/Modificados:

1. **Types**: `web/src/types/index.ts`
   ```typescript
   export interface Court {
     id_quadra: string;
     nome: string;
     localizacao: string;
     esporte: string;
     preco_hora: number;
     caracteristicas_json: Record<string, any>;
     status: 'ativa' | 'inativa';
     criado_em: string;
     atualizado_em: string;
   }

   export interface CourtFormData {
     nome: string;
     localizacao?: string;
     esporte: string;
     preco_hora: number;
     caracteristicas_json?: Record<string, any>;
     status?: 'ativa' | 'inativa';
   }
   ```

2. **Service**: `web/src/services/courts.service.ts`
   - `getAdminCourts()`: Listagem paginada com filtros
   - `getAdminCourt(id)`: Obter uma quadra
   - `createCourt(data)`: Criar nova quadra
   - `updateCourt(id, data)`: Atualizar quadra
   - `deleteCourt(id)`: Excluir quadra
   - `updateCourtStatus(id, status)`: Atualizar status
   - Interface `PaginatedResponse<T>` para paginação

3. **API Client**: `web/src/lib/api-client.ts`
   - Adicionado método `put()` (faltava para operações de atualização completa)

---

## 🧪 Testes Realizados

### ✅ Backend

1. **Seeder executado com sucesso**:
   ```
   ✅ Quadra criada: Quadra Beach Tennis 1
   ✅ Quadra criada: Quadra Beach Tennis 2
   ✅ Quadra criada: Quadra Beach Tennis 3
   ✅ Quadra criada: Quadra de Tênis
   ✅ Quadra criada: Quadra Poliesportiva
   ✅ Quadra criada: Quadra Beach Tennis VIP
   ✅ Quadra criada: Quadra de Manutenção
   ```

2. **Rotas registradas**:
   ```
   GET|HEAD   api/admin/courts
   POST       api/admin/courts
   GET|HEAD   api/admin/courts/{id}
   PUT|PATCH  api/admin/courts/{id}
   DELETE     api/admin/courts/{id}
   PATCH      api/admin/courts/{id}/status
   ```

### 🔜 Frontend (Pendente)

- **Página Admin**: `web/src/pages/admin/Courts.tsx` (ainda com mock)
- **Próximo passo**: Conectar UI à API real usando `courtsService`

---

## 📡 Endpoints da API

### Admin Quadras (CRUD)

Base URL: `http://localhost:8000/api/admin/courts`  
**Autenticação**: Bearer Token (Sanctum)  
**Autorização**: Middleware `role:admin`

#### 1. **Listar Quadras** (Paginado)
```http
GET /api/admin/courts
Headers: Authorization: Bearer {token}
Query Params (opcionais):
  - esporte: beach_tennis|tenis|futsal|volei|basquete|outros
  - status: ativa|inativa
  - search: string (busca no nome)
  - sort_by: nome|preco_hora|esporte (default: nome)
  - sort_order: asc|desc (default: asc)
  - per_page: number (default: 15)
  - page: number (default: 1)

Response 200:
{
  "data": [
    {
      "id_quadra": "1",
      "nome": "Quadra Beach Tennis 1",
      "localizacao": "Área Externa - Setor A",
      "esporte": "beach_tennis",
      "preco_hora": "80.00",
      "caracteristicas_json": {
        "cobertura": true,
        "iluminacao": true,
        ...
      },
      "status": "ativa",
      "criado_em": "2025-10-16T00:02:27.000000Z",
      "atualizado_em": "2025-10-16T00:02:27.000000Z"
    }
  ],
  "pagination": {
    "total": 7,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "from": 1,
    "to": 7
  }
}
```

#### 2. **Obter Quadra por ID**
```http
GET /api/admin/courts/{id}
Headers: Authorization: Bearer {token}

Response 200:
{
  "data": {
    "id_quadra": "1",
    "nome": "Quadra Beach Tennis 1",
    ...
  }
}

Response 404:
{
  "message": "Quadra não encontrada",
  "code": "NOT_FOUND"
}
```

#### 3. **Criar Quadra**
```http
POST /api/admin/courts
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "nome": "Quadra Nova",
  "localizacao": "Setor B",
  "esporte": "beach_tennis",
  "preco_hora": 100.00,
  "caracteristicas_json": {
    "cobertura": true,
    "iluminacao": true
  },
  "status": "ativa"
}

Response 201:
{
  "message": "Quadra criada com sucesso",
  "data": { ... }
}

Response 422 (Validação):
{
  "message": "Dados inválidos",
  "errors": {
    "nome": ["O nome da quadra é obrigatório"],
    "esporte": ["Esporte inválido"]
  }
}
```

#### 4. **Atualizar Quadra**
```http
PUT /api/admin/courts/{id}
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "nome": "Quadra Renomeada",
  "preco_hora": 120.00
}

Response 200:
{
  "message": "Quadra atualizada com sucesso",
  "data": { ... }
}
```

#### 5. **Excluir Quadra**
```http
DELETE /api/admin/courts/{id}
Headers: Authorization: Bearer {token}

Response 200:
{
  "message": "Quadra excluída com sucesso"
}
```

#### 6. **Atualizar Status**
```http
PATCH /api/admin/courts/{id}/status
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "status": "inativa"
}

Response 200:
{
  "message": "Status atualizado com sucesso",
  "data": { ... }
}
```

---

## 🔧 Detalhes Técnicos

### Mapeamento Backend ↔ Frontend

#### Nomenclatura (Backend pt-BR → Frontend pt-BR temporário)
- `id_quadra` → `id_quadra` (mantido igual por enquanto)
- `nome` → `nome`
- `localizacao` → `localizacao`
- `esporte` → `esporte`
- `preco_hora` → `preco_hora`
- `caracteristicas_json` → `caracteristicas_json`
- `status` → `status` ('ativa' | 'inativa')
- `criado_em` → `criado_em` (ISO 8601 string)
- `atualizado_em` → `atualizado_em` (ISO 8601 string)

**Nota**: Na Fase 3, ao conectar o frontend, podemos decidir se mantemos pt-BR ou traduzimos para en-US no frontend.

### Validações

#### Backend (Laravel)
- **Nome**: required, string, max:100, unique
- **Localização**: nullable, string, max:255
- **Esporte**: required, string, enum (beach_tennis, tenis, futsal, volei, basquete, outros)
- **Preço/hora**: required, numeric, min:0, max:9999.99
- **Características**: nullable, array (convertido para JSON)
- **Status**: nullable, string, enum (ativa, inativa) - default: 'ativa'

#### Frontend (TypeScript)
- Validação via formulário (a implementar na próxima etapa)
- Tipos seguros via `CourtFormData` interface

### Paginação
- **Backend**: Laravel paginate() automático
- **Frontend**: Interface `PaginatedResponse<T>` pronta para consumo

---

## 🚀 Próximos Passos (Fase 3)

### Opção A: Conectar UI Admin de Quadras
1. Modificar `web/src/pages/admin/Courts.tsx`
2. Remover mock data
3. Usar `courtsService.getAdminCourts()` para listar
4. Implementar modals de Criar/Editar com formulário
5. Implementar botão de Excluir com confirmação
6. Implementar toggle de status (ativa ↔ inativa)
7. Adicionar filtros e busca

### Opção B: Ir para Fase 3 - Admin: Planos (CRUD)
1. Model `Plano`
2. `AdminPlanoController`
3. Form Requests
4. Rotas `/api/admin/plans`
5. Seeder de planos

### Opção C: Ir para Fase 4 - Reservas de Quadras
1. Model `ReservaQuadra`
2. Controller com anti-overlap (GIST)
3. Endpoints de disponibilidade

---

## 📝 Comandos Úteis

### Backend
```bash
# Listar rotas admin
docker-compose exec -T api php artisan route:list --path=admin

# Reexecutar seeder
docker-compose exec -T api php artisan db:seed --class=QuadrasSeeder --force

# Limpar cache
docker-compose exec -T api php artisan config:clear
docker-compose exec -T api php artisan route:clear
```

### Frontend
```bash
# Recriar container (se mudar .env.docker)
docker-compose up -d --force-recreate frontend-dev

# Ver logs
docker-compose logs -f frontend-dev
```

---

## 🎉 Conclusão

A **Fase 2** está **100% completa** no backend! Criamos:
- ✅ Model com relacionamentos e scopes
- ✅ CRUD completo (6 endpoints)
- ✅ Validação via Form Requests
- ✅ Autorização via middleware `role:admin`
- ✅ 7 quadras de exemplo via seeder
- ✅ Service frontend pronto para consumo
- ✅ Types TypeScript definidos

O próximo passo é **conectar a UI do admin** ou seguir para outras entidades (Planos, Reservas, etc).

**Escolha sua próxima aventura!** 🚀
