# 📝 Atualização do DDL - Changelog

**Data**: 15 de outubro de 2025  
**Arquivo**: `api/database/ddl.sql`

---

## 🎯 Mudanças Aplicadas

### 1. ✅ Soft Delete Implementado

**Tabelas afetadas**:
- `usuarios`
- `planos`
- `instrutores`

**Mudança no CHECK constraint de `status`**:

```sql
-- ANTES
CHECK (status IN ('ativo','inativo'))

-- DEPOIS
CHECK (status IN ('ativo','inativo','excluido'))
```

**Detalhes**:
- Registros não são mais deletados permanentemente
- Exclusão marca o registro com `status = 'excluido'`
- Controllers filtram automaticamente registros excluídos
- Permite recuperação de dados (restore)
- Mantém integridade referencial

---

### 2. ✅ Unificação Personal → Instrutor

**Tabela**: `usuarios`

**Mudança no CHECK constraint de `papel`**:

```sql
-- ANTES
CHECK (papel IN ('admin','aluno','personal','instrutor'))

-- DEPOIS
CHECK (papel IN ('admin','aluno','instrutor'))
```

**Detalhes**:
- Papel `'personal'` removido completamente
- Unificado como `'instrutor'`
- Rotas do frontend: `/personal/*` → `/instrutor/*`
- Consistente com tabela `instrutores`

---

## 📋 DDL Atualizado - Trechos Principais

### Tabela `usuarios`
```sql
CREATE TABLE usuarios (
  id_usuario        BIGSERIAL PRIMARY KEY,
  nome              TEXT NOT NULL,
  email             CITEXT NOT NULL UNIQUE,
  senha_hash        TEXT NOT NULL,
  telefone          TEXT,
  documento         TEXT,
  data_nascimento   DATE,
  papel             TEXT NOT NULL CHECK (papel IN ('admin','aluno','instrutor')), -- ← MUDOU
  status            TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','excluido')), -- ← MUDOU
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Tabela `planos`
```sql
CREATE TABLE planos (
  id_plano                 BIGSERIAL PRIMARY KEY,
  nome                     TEXT NOT NULL,
  preco                    NUMERIC(12,2) NOT NULL,
  ciclo_cobranca           TEXT NOT NULL CHECK (ciclo_cobranca IN ('mensal','trimestral','anual')),
  max_reservas_futuras     INTEGER NOT NULL DEFAULT 0,
  beneficios_json          JSONB,
  status                   TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','excluido')), -- ← MUDOU
  criado_em                TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Tabela `instrutores`
```sql
CREATE TABLE instrutores (
  id_instrutor         BIGSERIAL PRIMARY KEY,
  id_usuario           BIGINT REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  nome                 TEXT NOT NULL,
  email                CITEXT,
  telefone             TEXT,
  cref                 TEXT,
  valor_hora           NUMERIC(12,2),
  especialidades_json  JSONB,
  bio                  TEXT,
  status               TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','excluido')), -- ← MUDOU
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 🔄 Como Aplicar em Banco Existente

Se você já tem um banco rodando e quer aplicar essas mudanças:

### 1. Atualizar CHECK Constraints

```sql
-- Tabela usuarios
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_papel_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_papel_check 
    CHECK (papel IN ('admin', 'aluno', 'instrutor'));

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_status_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));

-- Tabela planos
ALTER TABLE planos DROP CONSTRAINT IF EXISTS planos_status_check;
ALTER TABLE planos ADD CONSTRAINT planos_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));

-- Tabela instrutores
ALTER TABLE instrutores DROP CONSTRAINT IF EXISTS instrutores_status_check;
ALTER TABLE instrutores ADD CONSTRAINT instrutores_status_check 
    CHECK (status IN ('ativo', 'inativo', 'excluido'));
```

### 2. Migrar Dados Existentes (se necessário)

```sql
-- Migrar papel 'personal' para 'instrutor'
UPDATE usuarios SET papel = 'instrutor' WHERE papel = 'personal';
```

---

## 📊 Comparação Before/After

| Item | Antes | Depois |
|------|-------|--------|
| **usuarios.papel** | `'admin','aluno','personal','instrutor'` | `'admin','aluno','instrutor'` |
| **usuarios.status** | `'ativo','inativo'` | `'ativo','inativo','excluido'` |
| **planos.status** | `'ativo','inativo'` | `'ativo','inativo','excluido'` |
| **instrutores.status** | `'ativo','inativo'` | `'ativo','inativo','excluido'` |
| **Exclusão** | Hard delete (DELETE) | Soft delete (UPDATE) |
| **Área do instrutor** | `/personal/*` | `/instrutor/*` |

---

## ✅ Validação

### Verificar Constraints Atualizados

```sql
-- Ver constraint de papel
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'usuarios_papel_check';

-- Resultado esperado:
-- (papel = ANY (ARRAY['admin'::text, 'aluno'::text, 'instrutor'::text]))

-- Ver constraint de status (usuarios)
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'usuarios_status_check';

-- Resultado esperado:
-- (status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'excluido'::text]))
```

### Testar Soft Delete

```sql
-- Tentar inserir com status 'excluido' (deve funcionar)
INSERT INTO usuarios (nome, email, senha_hash, papel, status) 
VALUES ('Teste', 'teste@test.com', 'hash', 'aluno', 'excluido');

-- Tentar inserir com papel 'personal' (deve FALHAR)
INSERT INTO usuarios (nome, email, senha_hash, papel) 
VALUES ('Teste', 'teste2@test.com', 'hash', 'personal');
-- Erro esperado: new row violates check constraint "usuarios_papel_check"
```

---

## 📁 Arquivos Relacionados

**DDL Atualizado**:
- ✅ `api/database/ddl.sql` (CHECK constraints atualizados)

**Controllers com Soft Delete**:
- ✅ `api/app/Http/Controllers/Admin/PlanoController.php`
- ✅ `api/app/Http/Controllers/Admin/UserController.php`
- ✅ `api/app/Http/Controllers/Admin/InstrutorController.php`

**Seeders Atualizados**:
- ✅ `api/database/seeders/UserSeeder.php` (sem papel 'personal')

**Frontend Atualizado**:
- ✅ `web/src/types/index.ts` (papel sem 'personal')
- ✅ `web/src/App.tsx` (rotas `/instrutor/*`)
- ✅ `web/src/components/Sidebar.tsx` (menu instrutor)

---

## 🎓 Observações Importantes

1. **Soft Delete é Padrão**: Todos os CRUDs futuros devem usar soft delete
2. **Instrutor é Único**: Não existe mais papel 'personal' no sistema
3. **DDL é Fonte da Verdade**: Sempre consulte o DDL atualizado
4. **Backwards Compatibility**: Dados antigos com 'personal' devem ser migrados

---

## 🔗 Documentação Relacionada

- `docs/FASE_6_SOFT_DELETE.md` - Implementação do soft delete
- `docs/ANALISE_PERSONAL_VS_INSTRUTOR.md` - Análise da unificação
- `docs/UNIFICACAO_PERSONAL_INSTRUTOR.md` - Documentação da unificação

---

**DDL Atualizado e Sincronizado!** ✅  
Última atualização: 15 de outubro de 2025
