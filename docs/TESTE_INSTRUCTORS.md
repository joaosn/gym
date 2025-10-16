# 🧪 Teste Rápido - Tela de Instrutores

## 📋 Checklist de Verificação

### 1. Dados no Banco
```powershell
docker-compose exec -T db psql -U fitway_user -d fitway_db -c "SELECT id_instrutor, nome, email, status FROM instrutores WHERE status != 'excluido';"
```

**Esperado**: 3 instrutores (Carlos Silva, Ana Paula Santos, João Oliveira)

---

### 2. API Respondendo
```powershell
# Login primeiro (copie o token)
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@fitway.com","password":"admin123"}' | Select-Object -ExpandProperty Content | ConvertFrom-Json

# Use o token retornado para testar a rota:
# Substitua {TOKEN} pelo access_token recebido
Invoke-WebRequest -Uri "http://localhost:8000/api/admin/instructors" -Method GET -Headers @{"Authorization"="Bearer {TOKEN}"; "Accept"="application/json"} | Select-Object -ExpandProperty Content
```

**Esperado**: JSON com array de 3 instrutores

---

### 3. Frontend Carregando

**Passos**:
1. Acesse: `http://localhost:5173/login`
2. Login com: `admin@fitway.com` / `admin123`
3. Acesse: `http://localhost:5173/admin/instructors`
4. Abra o Console (F12)

**Verifique**:
- ✅ Aparece loading/spinner primeiro
- ✅ Depois carrega 3 cards de instrutores
- ✅ Console NÃO tem erro de CORS
- ✅ Console NÃO tem erro 401/403
- ✅ Network (F12 → Network) mostra request `GET /api/admin/instructors` com status 200

---

## 🔍 Possíveis Problemas

### Problema 1: Tela Vazia (sem instrutores)

**Causa**: Filtro impedindo exibição

**Solução**: 
1. Verifique o filtro de "Status" (deve estar em "Todos")
2. Verifique o filtro de "Especialidade" (deve estar em "Todas")
3. Limpe o campo de busca

---

### Problema 2: Erro 401 no Console

**Causa**: Token expirado ou não está logado

**Solução**:
1. Faça logout: `http://localhost:5173/logout`
2. Faça login novamente: `http://localhost:5173/login`
3. Acesse a tela de instrutores

---

### Problema 3: Erro CORS

**Causa**: API não configurada para aceitar requests do frontend

**Solução**:
```powershell
# Verificar .env.docker da API
docker-compose exec api cat .env.docker | grep CORS

# Deve ter:
# CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
# SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000

# Se não tiver, recriar API:
docker-compose up -d --force-recreate api
```

---

### Problema 4: Dados Mockados Aparecendo

**Causa**: Service ainda tem código de mock

**Verificação**:
```powershell
# Buscar por "mock" no service
Select-String -Path "web\src\services\instructors.service.ts" -Pattern "mock" -CaseSensitive
```

**Esperado**: Nenhum resultado (sem mocks)

---

## 🎯 Como Reportar o Problema

Se ainda estiver com problema, me informe:

1. **O que aparece na tela?**
   - [ ] Tela completamente vazia
   - [ ] Mensagem de erro
   - [ ] Spinner infinito (carregando para sempre)
   - [ ] Dados mockados (nomes que não estão no banco)

2. **Erros no Console (F12)**:
   ```
   Cole aqui os erros que aparecem no console
   ```

3. **Network Request (F12 → Network)**:
   - Status Code: ___
   - Response: ___

4. **Filtros aplicados**:
   - Status: ___
   - Especialidade: ___
   - Busca: ___

---

## ✅ Tudo Funcionando

Se estiver tudo OK, você deve ver:

- 3 cards de instrutores
- Carlos Silva (R$ 150,00/hora)
- Ana Paula Santos (R$ 120,00/hora)  
- João Oliveira (R$ 180,00/hora)
- Badge "Ativo" em verde em cada um
- Botões de editar/excluir funcionando
