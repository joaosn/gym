# 🧪 Teste: Feature "Nova Sessão" - Instructor Slots

**Data**: 22 de outubro de 2025  
**Feature**: Instructor pode criar manualmente nova sessão para aluno  
**Status**: ✅ **PRONTO PARA TESTAR**

---

## 📋 O que foi implementado

### Backend (`Laravel` API)

#### 1. Novo Controller Method: `getStudents()`
**Arquivo**: `api/app/Http/Controllers/Instrutor/InstructorSessionsController.php`

```php
public function getStudents(Request $request)
{
    // Busca todos os alunos ativos (papel='aluno', status!='excluido')
    // Retorna: array de { id_usuario, nome, email, telefone }
}
```

**Endpoint**: `GET /api/instructor/students`

#### 2. Nova Rota Registrada
**Arquivo**: `api/routes/api.php`

```php
Route::middleware('role:instrutor')->prefix('instructor')->group(function () {
    // ... outras rotas ...
    Route::get('/students', [InstructorSessionsController::class, 'getStudents']);
});
```

**URL**: `http://localhost:8000/api/instructor/students`

### Frontend (`React` App)

#### 1. Nova Interface TypeScript
**Arquivo**: `web/src/types/index.ts`

```typescript
export interface Student {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string;
}
```

#### 2. Atualizado Componente Slots
**Arquivo**: `web/src/pages/personal/Slots.tsx`

**Mudanças**:
- ✅ Implementado `loadAlunos()` - carrega lista da API
- ✅ Transformado Input desabilitado em `<select>` real
- ✅ Select popula com alunos dinâmicos
- ✅ Mostra mensagem de loading enquanto carrega
- ✅ Mostra aviso se nenhum aluno disponível

---

## 🧪 Passo-a-Passo: Como Testar

### Pré-Requisitos
- ✅ Docker rodando com containers `db`, `api`, `frontend-dev`
- ✅ API em `http://localhost:8000`
- ✅ Frontend em `http://localhost:5173`
- ✅ 32 alunos cadastrados no BD

### Teste 1: Verificar Endpoint da API

**Terminal/PowerShell**:
```powershell
# Verificar se rota está registrada
cd c:\laragon\www\tccFitway
docker-compose exec -T api php artisan route:list | Select-String "instructor/students"

# Saída esperada:
# GET|HEAD        api/instructor/students ...
```

**Banco de Dados**:
```sql
-- Verificar alunos disponíveis
SELECT COUNT(*) FROM usuarios 
WHERE papel='aluno' AND status != 'excluido';

-- Retorno esperado: 32 (ou similar)
```

### Teste 2: Testar via Navegador (Browser)

#### Passo 1: Acessar a página
```
1. Abra http://localhost:5173
2. Faça login com:
   - Email: personal@fitway.com
   - Senha: senha123
3. Clique em "Horários" no menu
```

#### Passo 2: Abrir Modal "Nova Sessão"
```
1. Na página de Horários (Slots), procure pelo botão "Nova Sessão" (verde, com ícone +)
2. Clique nele
3. Modal deve abrir com 4 campos:
   - Aluno (select dropdown)
   - Data (date input)
   - Horário de Início (time input)
   - Duração (select dropdown)
```

#### Passo 3: Verificar Carregamento dos Alunos
```
1. Abra o DevTools (F12 no navegador)
2. Vá para aba "Network"
3. Clique em "Nova Sessão" para abrir o modal
4. Na aba "Network", procure por request para `/api/instructor/students`
5. Verifique:
   ✅ Status: 200 OK
   ✅ Response: Array com ~32 alunos
   ✅ Cada aluno tem: id_usuario, nome, email, telefone
```

#### Passo 4: Usar o Selector de Alunos
```
1. No modal aberto, clique no dropdown "Aluno"
2. Deve aparecer lista com alunos:
   - "Aluno Maria Santos (aluno@fitway.com)"
   - "Amanda Costa (amanda.costa.18@fitway.com)"
   - ... etc
3. Selecione um aluno
```

#### Passo 5: Completar Formulário
```
1. Data: Selecione uma data (ex: 22/10/2025)
2. Horário: Selecione um horário (ex: 10:00)
3. Duração: Selecione uma duração (ex: 1 hora)
4. Clique em "Criar Sessão"
```

### Teste 3: Verificar DevTools Console

**Abra o Console (F12 → Console tab)**:

Você deve ver logs como:
```
✅ Alunos carregados: Array(32) [
  {id_usuario: 3, nome: "Aluno Maria Santos", email: "aluno@fitway.com", telefone: "..."},
  {id_usuario: 29, nome: "Amanda Costa", email: "amanda.costa.18@fitway.com", telefone: "..."},
  ...
]
```

Se vir erro como `❌ Erro ao carregar alunos`, vá para aba "Network" e verifique o status da chamada.

---

## 📊 Dados de Teste Disponíveis

### Instrutor para Testar
```
Email: personal@fitway.com
Senha: senha123
ID: 42 (id_usuario) / 5 (id_instrutor)
Nome: Personal Teste zikaa
```

### Alunos Disponíveis (exemplos)
```
1. ID 3  → Aluno Maria Santos
2. ID 29 → Amanda Costa
3. ID 13 → Amanda Souza
4. ID 27 → Ana Gomes
... (total 32 alunos)
```

---

## 🎯 Cenários de Teste

### ✅ Cenário 1: Happy Path (Tudo funciona)
```
1. Login com personal@fitway.com
2. Vai para Horários
3. Clica "Nova Sessão"
4. Modal abre
5. Dropdown "Aluno" popula com 32 alunos
6. Seleciona aluno
7. Preenche data, hora, duração
8. Clica "Criar Sessão"
9. (TODO) Sessão é criada e cobrado do aluno
10. Lista de sessões atualiza
```

### ⚠️ Cenário 2: Erro ao Carregar Alunos
```
Se dropdown vazio ou erro:
1. F12 → Network tab
2. Procure por /api/instructor/students
3. Se 401/403: Token expirou, faça login novamente
4. Se 404: Rota não foi registrada, rode `route:list` novamente
5. Se 500: Ver logs da API com `docker-compose logs -f api`
```

### ⚠️ Cenário 3: Nenhum Aluno Disponível
```
Se mensagem "⚠️ Nenhum aluno disponível":
1. Verifique BD: SELECT COUNT(*) FROM usuarios WHERE papel='aluno'
2. Se houver alunos mas com status='excluido', atualize:
   UPDATE usuarios SET status='ativo' WHERE papel='aluno' AND status='excluido';
```

---

## 🔧 Troubleshooting

### Problema: "⏳ Carregando alunos..." fica travado
**Solução**:
```
1. F12 → Network → Veja status de /api/instructor/students
2. Se 401: Token expirou, login novamente
3. Se 500: docker-compose logs -f api (ver erro)
4. Se timeout: Verifique se API está rodando: curl http://localhost:8000/api/healthz
```

### Problema: Dropdown vazio (0 alunos)
**Solução**:
```
1. docker-compose exec -T db psql -U fitway_user -d fitway_db
2. SELECT COUNT(*) FROM usuarios WHERE papel='aluno' AND status != 'excluido';
3. Se retorna 0: Crie alunos via BD ou painel admin
```

### Problema: Rota não encontrada (404)
**Solução**:
```
1. docker-compose exec -T api php artisan route:list | Select-String "instructor/students"
2. Se não aparecer: rota não registrada em routes/api.php
3. Verifique arquivo api.php e redeploy: docker-compose up -d --force-recreate api
```

---

## 📝 Checklist de Implementação

- [x] Backend: Controller method `getStudents()` criado
- [x] Backend: Rota registrada em `api.php`
- [x] Backend: Sintaxe PHP verificada
- [x] Backend: Query testa alunos ativos
- [x] Frontend: Type `Student` adicionado
- [x] Frontend: `loadAlunos()` implementado
- [x] Frontend: Select dropdown criado
- [x] Frontend: TypeScript compilation: **✅ NO ERRORS**
- [x] Frontend: Modal atualizado com selector
- [ ] **Teste no Navegador**: Verificar se dropdown popula
- [ ] **Teste Completo**: Criar sessão e verificar se cobrança é gerada

---

## 🚀 Próximos Passos (TODO)

1. ✅ **Selector de Aluno**: COMPLETO
2. 🟡 **Criar Sessão**: Backend tem endpoint, mas não testado
3. 🟡 **Auto-Cobrança**: Gerar cobrança para aluno quando sessão criada
4. ❌ **Validações**: Anti-overlap de horário para nova sessão
5. ❌ **Emails**: Notificar aluno quando sessão criada
6. ❌ **Testes E2E**: Cypress/Playwright para fluxo completo

---

## 📚 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `api/app/Http/Controllers/Instrutor/InstructorSessionsController.php` | Added `getStudents()` method | ✅ |
| `api/routes/api.php` | Added `/instructor/students` route | ✅ |
| `web/src/types/index.ts` | Added `Student` interface | ✅ |
| `web/src/pages/personal/Slots.tsx` | Implemented `loadAlunos()` + select dropdown | ✅ |

---

## 💡 Notas de Implementação

### Pattern Usado: API Direct Response
- **Backend retorna**: Array direto `[{...}, {...}]`
- **Frontend parseia**: `Array.isArray(response) ? response : []`
- **Não é**: `{ data: [{...}] }`

### Security
- ✅ Rota protegida por `middleware('role:instrutor')`
- ✅ Query apenas busca alunos ativos (status != 'excluido')
- ✅ Sem exposição de senhas ou dados sensíveis

### UX Melhorias
- ✅ Dropdown disabled enquanto carrega
- ✅ Mensagem de loading: "⏳ Carregando alunos..."
- ✅ Mensagem de erro se nenhum aluno: "⚠️ Nenhum aluno disponível"
- ✅ Label mostra nome + email do aluno: "Maria Santos (aluno@fitway.com)"

---

**🎯 Status**: Feature "Nova Sessão - Selector de Aluno" está **PRONTO PARA TESTAR**

Próximo passo: Teste via navegador em http://localhost:5173 → Login → Horários → Nova Sessão
