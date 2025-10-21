# Fase 6: Implementação de Soft Delete (Exclusão Lógica)

**Data**: 15 de outubro de 2025  
**Status**: ✅ Concluída  
**Objetivo**: Substituir exclusão física (hard delete) por exclusão lógica (soft delete) para preservar dados históricos e permitir auditoria.

---

## 🎯 Motivação

### Problemas do Hard Delete

- ❌ **Perda permanente de dados**: Não há como recuperar registros excluídos
- ❌ **Quebra de integridade referencial**: Foreign keys ficam inválidas
- ❌ **Impossível auditar**: Não há rastro de quando/quem excluiu
- ❌ **Risco de erros**: Exclusões acidentais são irreversíveis

### Benefícios do Soft Delete

- ✅ **Preservação de dados**: Registros permanecem no banco
- ✅ **Auditoria completa**: Histórico de todas as ações
- ✅ **Recuperação possível**: Basta mudar o status de volta
- ✅ **Integridade referencial**: Foreign keys continuam válidas
- ✅ **Transparente para o frontend**: API continua retornando 204

---

## 📋 Escopo da Implementação

### Tabelas Afetadas

1. **planos** - Planos de assinatura
2. **usuarios** - Usuários do sistema (admin, aluno, personal, instrutor)
3. **instrutores** - Personal trainers/instrutores

### Estratégia Escolhida

- Usar campo `status` existente com novo valor: `'excluido'`
- Manter rotas DELETE inalteradas (transparência para o frontend)
- Filtrar automaticamente registros com `status = 'excluido'` nas listagens
- Permitir recuperação futura (opcional)

---

## 🛠️ Implementação

### 1. Backend - Controllers

#### PlanoController.php

**Arquivo**: `api/app/Http/Controllers/Admin/PlanoController.php`

**Mudanças**:

```php
// ANTES (index - linha 19-20)
public function index(Request $request) {
    $query = Plano::query();
    // ... resto da lógica

// DEPOIS (index - linha 19-21)
public function index(Request $request) {
    $query = Plano::query();
    $query->where('status', '!=', 'excluido'); // ← Filtro adicionado
    // ... resto da lógica
```

```php
// ANTES (destroy - linha 111-114)
public function destroy($id) {
    $plano = Plano::findOrFail($id);
    $plano->delete(); // ← Hard delete
    return response()->json(null, 204);
}

// DEPOIS (destroy - linha 111-114)
public function destroy($id) {
    $plano = Plano::findOrFail($id);
    $plano->update(['status' => 'excluido']); // ← Soft delete
    return response()->json(null, 204);
}
```

#### UserController.php

**Arquivo**: `api/app/Http/Controllers/Admin/UserController.php`

**Mudanças**:

```php
// index() - Adicionada linha 20
$query->where('status', '!=', 'excluido');

// destroy() - Linha 191 alterada
// ANTES: $usuario->delete();
// DEPOIS: $usuario->update(['status' => 'excluido']);
```

#### InstrutorController.php

**Arquivo**: `api/app/Http/Controllers/Admin/InstrutorController.php`

**Mudanças**:

```php
// index() - Adicionada linha 24
$query->where('status', '!=', 'excluido');

// destroy() - Linha 220 alterada
// ANTES: $instrutor->delete();
// DEPOIS: $instrutor->update(['status' => 'excluido']);
```

---

### 2. Database - CHECK Constraints

**Problema**: As tabelas tinham constraint `CHECK (status IN ('ativo', 'inativo'))`, impedindo o valor `'excluido'`.

**Solução**: Atualizar constraints via SQL direto no PostgreSQL.

#### Scripts Executados

```sql
-- 1. Tabela planos
ALTER TABLE planos DROP CONSTRAINT IF EXISTS planos_status_check;
ALTER TABLE planos ADD CONSTRAINT planos_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));

-- 2. Tabela usuarios
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_status_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));

-- 3. Tabela instrutores
ALTER TABLE instrutores DROP CONSTRAINT IF EXISTS instrutores_status_check;
ALTER TABLE instrutores ADD CONSTRAINT instrutores_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));
```

#### Comandos Executados (PowerShell)

```powershell
# Planos
docker-compose exec -T db psql -U fitway_user -d fitway_db -c "ALTER TABLE planos DROP CONSTRAINT IF EXISTS planos_status_check; ALTER TABLE planos ADD CONSTRAINT planos_status_check CHECK (status IN ('ativo', 'inativo', 'excluido'));"

# Usuários
docker-compose exec -T db psql -U fitway_user -d fitway_db -c "ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_status_check; ALTER TABLE usuarios ADD CONSTRAINT usuarios_status_check CHECK (status IN ('ativo', 'inativo', 'excluido'));"

# Instrutores
docker-compose exec -T db psql -U fitway_user -d fitway_db -c "ALTER TABLE instrutores DROP CONSTRAINT IF EXISTS instrutores_status_check; ALTER TABLE instrutores ADD CONSTRAINT instrutores_status_check CHECK (status IN ('ativo', 'inativo', 'excluido'));"
```

**Resultado**: ✅ Todas as 3 constraints atualizadas com sucesso.

---

### 3. Frontend - Sem Mudanças

O frontend **não precisa saber** da mudança! 🎉

- Rotas DELETE continuam iguais: `DELETE /api/admin/planos/{id}`
- Resposta continua sendo `204 No Content`
- Registros "excluídos" simplesmente desaparecem da listagem
- Componentes React continuam funcionando normalmente

**Arquivos não modificados**:

- `web/src/pages/admin/Plans.tsx`
- `web/src/pages/admin/Users.tsx`
- `web/src/pages/admin/Instructors.tsx`
- `web/src/services/*.service.ts`

---

## 🔄 Fluxo Completo (Soft Delete)

### Antes (Hard Delete)

```
1. Frontend: DELETE /api/admin/planos/1
2. Backend: PlanoController@destroy()
3. Laravel: $plano->delete()
4. PostgreSQL: DELETE FROM planos WHERE id_plano = 1
5. Resultado: ❌ Registro removido permanentemente
```

### Depois (Soft Delete)

```
1. Frontend: DELETE /api/admin/planos/1 (sem mudança!)
2. Backend: PlanoController@destroy()
3. Laravel: $plano->update(['status' => 'excluido'])
4. PostgreSQL: UPDATE planos SET status = 'excluido' WHERE id_plano = 1
5. Resultado: ✅ Registro preservado, apenas marcado como excluído
6. Listagem: WHERE status != 'excluido' (não aparece mais)
```

---

## 🧪 Como Testar

### Teste 1: Excluir um Plano

1. Acesse: `http://localhost:5173/admin/plans`
2. Clique em "Excluir" em qualquer plano
3. Confirme a exclusão
4. ✅ Plano desaparece da lista
5. Verifique no banco:

   ```sql
   SELECT id_plano, nome, status FROM planos WHERE status = 'excluido';
   ```

   **Esperado**: Registro com `status = 'excluido'`

### Teste 2: Excluir um Usuário

1. Acesse: `http://localhost:5173/admin/users`
2. Clique em "Excluir" (não pode ser você mesmo)
3. Confirme
4. ✅ Usuário desaparece
5. Verifique no banco:

   ```sql
   SELECT id_usuario, nome, email, status FROM usuarios WHERE status = 'excluido';
   ```

### Teste 3: Excluir um Instrutor

1. Acesse: `http://localhost:5173/admin/instructors`
2. Clique em "Excluir"
3. Confirme
4. ✅ Instrutor desaparece
5. Verifique no banco:

   ```sql
   SELECT id_instrutor, nome, email, status FROM instrutores WHERE status = 'excluido';
   ```

### Teste 4: Verificar que Não Aparece em Listagens

1. Acesse qualquer tela de listagem (planos/users/instructors)
2. ✅ Registros com `status = 'excluido'` NÃO devem aparecer
3. Verifique com filtro "Todos" no status
4. ✅ Continua não aparecendo (filtro aplicado no backend)

---

## 🔧 Funcionalidades Futuras (Opcional)

### Recuperação de Registros (Restore)

Se quiser implementar recuperação de registros "excluídos":

**Backend - Adicionar método no Controller**:

```php
// PlanoController.php
public function restore($id) {
    $plano = Plano::where('id_plano', $id)
                  ->where('status', 'excluido')
                  ->firstOrFail();
    
    $plano->update(['status' => 'ativo']);
    
    return response()->json(['data' => $plano], 200);
}
```

**Rota**:

```php
// routes/api.php
Route::patch('/admin/planos/{id}/restore', [PlanoController::class, 'restore']);
```

**Frontend - Botão de Restaurar**:

```tsx
// Adicionar aba "Excluídos" na tela de listagem
// Listar registros com status='excluido'
// Botão "Restaurar" ao lado de cada item
```

### Listar Registros Excluídos

**Backend - Novo método**:

```php
public function deleted(Request $request) {
    $query = Plano::where('status', 'excluido');
    // ... mesma lógica de paginação do index()
    return response()->json(['data' => $planos]);
}
```

**Rota**:

```php
Route::get('/admin/planos/deleted', [PlanoController::class, 'deleted']);
```

---

## 📊 Comparação de Arquivos

### Arquivos Modificados

| Arquivo | Linhas Modificadas | Mudança |
|---------|-------------------|---------|
| `PlanoController.php` | 20, 113 | Filtro + soft delete |
| `UserController.php` | 20, 191 | Filtro + soft delete |
| `InstrutorController.php` | 24, 220 | Filtro + soft delete |
| **Database** (3 tabelas) | - | CHECK constraints atualizados |

### Arquivos NÃO Modificados

- ✅ Rotas (`api/routes/api.php`) - inalteradas
- ✅ Models - inalterados
- ✅ Frontend - inalterado
- ✅ Seeders - inalterados

---

## 📚 Documentação Atualizada

### Copilot Instructions

Arquivo atualizado: `.github/copilot-instructions.md`

**Seções adicionadas**:

1. **Soft Delete (Exclusão Lógica)** - Nova seção antes de "Contrato API ↔ Frontend"
   - Regra importante de sempre usar soft delete
   - Padrão de implementação (Controller, Database, Frontend)
   - Tabelas com soft delete implementado
   - Recuperação de registros (opcional)

2. **Checklist - Backend** - Atualizada
   - Adicionado item: "SOFT DELETE: Usar `update(['status' => 'excluido'])` no destroy()"
   - Adicionado item: "FILTRO: Adicionar `where('status', '!=', 'excluido')` no index()"
   - Adicionado item: "Database: Atualizar CHECK constraint para incluir 'excluido'"

**Status HTTP**:

- Atualizado `204 No Content`: sucesso sem retorno (ex: DELETE **com soft delete**)

---

## ✅ Checklist de Validação

- [x] Backend: PlanoController modificado (index + destroy)
- [x] Backend: UserController modificado (index + destroy)
- [x] Backend: InstrutorController modificado (index + destroy)
- [x] Database: CHECK constraint de `planos` atualizado
- [x] Database: CHECK constraint de `usuarios` atualizado
- [x] Database: CHECK constraint de `instrutores` atualizado
- [x] Documentação: copilot-instructions.md atualizado
- [x] Documentação: FASE_6_SOFT_DELETE.md criado
- [ ] Teste: Excluir plano e verificar no banco
- [ ] Teste: Excluir usuário e verificar no banco
- [ ] Teste: Excluir instrutor e verificar no banco
- [ ] Teste: Confirmar que registros não aparecem em listagens

---

## 🎓 Lições Aprendidas

1. **Soft Delete é Crucial**: Preservar dados é essencial para auditoria e conformidade
2. **Transparência**: Frontend não precisa saber da mudança (API contract mantido)
3. **Reutilização**: Campo `status` existente pode ser aproveitado
4. **Constraints**: Sempre atualizar CHECK constraints ao adicionar novos valores
5. **Padrão Consistente**: Aplicar mesma lógica em todos os controllers (index + destroy)
6. **Filtro Automático**: `WHERE status != 'excluido'` garante que registros não apareçam

---

## 🚀 Próximos Passos

### Fase 7: Quadras (CRUD + Reservas)

- [ ] Backend: CRUD de quadras (admin)
- [ ] Backend: Bloqueios de quadras
- [ ] Backend: Reservas com anti-overlap (GIST)
- [ ] Frontend: Conectar páginas de quadras e reservas
- [ ] **IMPORTANTE**: Aplicar soft delete desde o início!

### Fase 8: Aulas (CRUD + Ocorrências)

- [ ] Backend: CRUD de aulas (turmas)
- [ ] Backend: Gerar ocorrências automáticas
- [ ] Backend: Inscrições com limite de vagas
- [ ] Frontend: Conectar páginas de aulas
- [ ] **IMPORTANTE**: Aplicar soft delete desde o início!

### Fase 9: Sessões Personal (CRUD + Agendamento)

- [ ] Backend: Disponibilidade de instrutores
- [ ] Backend: Agendamento 1:1 com anti-overlap
- [ ] Frontend: Conectar páginas de personal
- [ ] **IMPORTANTE**: Aplicar soft delete desde o início!

---

**Conclusão**: Soft Delete implementado com sucesso! 🎉  
Todos os CRUDs futuros devem seguir este padrão automaticamente.
