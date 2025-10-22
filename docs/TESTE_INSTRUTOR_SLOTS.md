# 🧪 Teste Manual - Tela de Horários do Instrutor (Fase 10)

## ✅ O que foi implementado

### Backend (API Laravel)
1. **Novo Controller**: `app/Http/Controllers/Instrutor/InstructorSessionsController.php`
   - Método `mySessions()`: Retorna todas as sessões do instrutor autenticado
   - Método `cancelarSessao()`: Cancela uma sessão (status → 'cancelada')
   - Método `concluirSessao()`: Marca como concluída (status → 'concluida')

2. **Rotas Adicionadas** em `api/routes/api.php`:
   ```php
   GET  /instructor/my-sessions              // Listar
   PATCH /instructor/sessions/{id}/cancel    // Cancelar
   PATCH /instructor/sessions/{id}/complete  // Concluir
   ```

### Frontend (React/TypeScript)
1. **Arquivo reescrito**: `web/src/pages/personal/Slots.tsx`
   - ✅ Dados REAIS da API (antes era mock)
   - ✅ 3 cards de estatísticas: Confirmadas, Hoje, Total
   - ✅ Agrupamento de sessões por data
   - ✅ Status colorido com badges (verde, amarelo, vermelho, azul)
   - ✅ Ações: "Concluir Aula" + "Cancelar com confirmação"
   - ✅ Toasts de feedback (sucesso/erro)
   - ✅ Loading states com placeholders

## 🧪 Como Testar (Passo a Passo)

### 1️⃣ Preparar o Ambiente
```powershell
# Terminal 1 - Garantir que API está rodando
cd c:\laragon\www\tccFitway
docker-compose up -d db api

# Terminal 2 - Garantir que Frontend Dev está rodando
docker-compose up -d frontend-dev
```

### 2️⃣ Executar Seeders (para ter dados de teste)
```powershell
docker-compose exec api php artisan db:seed --class=SessaoPersonalSeeder
```

### 3️⃣ Login como Instrutor
- Abrir: http://localhost:5173/login
- Email: `personal@fitway.com`
- Senha: `123456`
- Após login, você será redirecionado para `/instrutor/dashboard`

### 4️⃣ Navegar para Horários
- Menu lateral > "Horários" (ou navegue direto para http://localhost:5173/instrutor/slots)

### 5️⃣ Testar Funcionalidades

#### ✅ Verificar que dados carregam
- [ ] Página carrega sem erros (check console)
- [ ] 3 cards de stats mostram números
- [ ] Sessões agrupadas por data aparecem
- [ ] Cada sessão mostra: Hora, Aluno, Email, Duração, Valor, Status

#### ✅ Testar "Concluir Aula"
1. Encontre uma sessão com status **"Confirmada"** (verde)
2. Clique no botão **"Concluir Aula"** (verde)
3. Botão fica em loading ("Concluindo...")
4. Toast de sucesso deve aparecer: "✓ Sessão concluída!"
5. Lista recarrega automaticamente
6. Status da sessão muda para **"Concluída"** (azul)
7. Botão desaparece e mostra texto: "✓ Sessão concluída"

#### ✅ Testar "Cancelar"
1. Encontre uma sessão (confirmada ou pendente)
2. Clique no botão **"Cancelar"** (vermelho)
3. Modal de confirmação abre com:
   - Título: "Cancelar sessão?"
   - Descrição: "Tem certeza que deseja cancelar a sessão com [NOME DO ALUNO]?"
   - Botões: "Voltar" e "Cancelar Sessão"
4. Clique em "Cancelar Sessão"
5. Botão fica em loading ("Cancelando...")
6. Toast de sucesso: "✓ Sessão cancelada" + "Lembrete enviado para [ALUNO]"
7. Lista recarrega
8. Status muda para **"Cancelada"** (vermelho)
9. Botão desaparece e mostra: "❌ Sessão cancelada"

#### ✅ Testar Erro (simular)
1. Abra DevTools (F12)
2. Network tab: pausar requisições ou mudar URL da API
3. Tente clicar em "Concluir Aula" ou "Cancelar"
4. Toast de erro deve aparecer com mensagem amigável

#### ✅ Testar Responsividade
1. Abra DevTools (F12)
2. Ative device emulation (tablet e mobile)
3. Verificar que layout se adapta bem
4. Botões continuam funcionais

## 🔍 Validações Importantes

### Backend deve retornar
- `GET /instructor/my-sessions` → Array de sessões com campos:
  ```json
  {
    "id_sessao_personal": 1,
    "id_instrutor": 5,
    "id_usuario": 42,
    "aluno_nome": "João Silva",
    "aluno_email": "joao@example.com",
    "inicio": "2025-10-25T08:00:00Z",
    "fim": "2025-10-25T09:00:00Z",
    "preco_total": "100.00",
    "status": "confirmada"
  }
  ```

### Frontend deve:
- ✅ Fazer GET ao carregar a página (no `useEffect`)
- ✅ Enviar PATCH ao clicar "Concluir Aula"
- ✅ Enviar PATCH ao confirmar "Cancelar"
- ✅ Recarregar lista após qualquer ação
- ✅ Mostrar toasts em todos os casos (sucesso/erro)

## 📋 Checklist de Testes
- [ ] Dados carregam corretamente
- [ ] Concluir aula funciona
- [ ] Cancelar aula funciona com confirmação
- [ ] Toasts aparecem
- [ ] Recarregamento automático funciona
- [ ] Layout responsivo ok
- [ ] Sem erros no console

## 🐛 Possíveis Problemas

| Problema | Solução |
|----------|---------|
| "Nenhuma sessão agendada" | Executar seeder: `docker-compose exec api php artisan db:seed --class=SessaoPersonalSeeder` |
| 404 no endpoint | Verificar rotas: `docker-compose exec api php artisan route:list --path=instructor` |
| CORS error | Verificar `.env.docker`: `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000` |
| Toast não aparece | Abrir DevTools → Console e verificar erros |
| Loading infinito | Verificar aba Network no DevTools, ver resposta da API |

## 📞 Debugging
```powershell
# Ver logs da API
docker-compose logs -f api

# Testar endpoint diretamente
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/instructor/my-sessions

# Ver dados no banco
docker-compose exec db psql -U fitway_user -d fitway_db -c "SELECT * FROM sessoes_personal LIMIT 5;"
```

## ✨ O que vem depois
- [ ] Adicionar notificação de email ao aluno quando cancelada
- [ ] Dashboard instrutor mostrar "Últimas 3 sessões" (já faz!)
- [ ] Histórico de sessões concluídas
- [ ] Cálculo de horas totalizadas
- [ ] Sistema de avaliações do aluno

---

**Criado em**: 22/10/2025  
**Status**: 🟢 Pronto para Teste
