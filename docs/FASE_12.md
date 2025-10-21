# ✅ FASE 12: Pagamentos (CRUD + Checkout via Mercado Pago)

**Data**: 21/10/2025  
**Status**: ✅ CONCLUÍDO

## 🎯 Objetivo
Implementar o módulo de Pagamentos com:
- CRUD de cobranças (admin)
- Histórico e ações de pagamento (aluno)
- Checkout via Mercado Pago (Checkout Pro – Pix e Cartão)
- Webhook para atualização automática de status
- Fluxo de simulação mantido como fallback

## ✅ Implementado

### Backend
- Rotas (api/routes/api.php)
  - Admin
    - GET/POST/PUT/DELETE `/api/admin/payments` (CRUD de cobranças)
    - POST `/api/admin/payments/{id}/create-checkout` (gera link de pagamento no MP)
  - Student
    - GET `/api/payments/parcela/{id}` (detalhe de parcela)
    - POST `/api/payments/checkout/mp/{id_parcela}` (cria preferência e retorna link MP)
    - Fluxo de simulação preservado (create/approve)
  - Webhook
    - POST `/api/webhooks/mercadopago` (processa notificações e atualiza status)
- Controllers/Services
  - `PagamentoController`: endpoints de admin e student, incluindo criação de link no MP
  - `MercadoPagoWebhookController`: persiste webhook e marca pagamentos como aprovados/quitados
  - `PagamentoService`: reutilizado para regras e cálculos
- Config
  - `config/services.php` → `mercadopago.access_token`, `notification_url`, `frontend_url`

### Frontend
- Admin
  - Página `Admin/Payments.tsx`: filtros, estatísticas, listagem com paginação, modal criar/editar, excluir, e botão “Gerar Link” (abre `init_point` do MP)
  - Select de usuário com busca (reutiliza `usersService`), sem valores vazios (Radix fix)
- Aluno
  - Página `Student/PaymentHistory.tsx`: lista cobranças; para pendentes, “Pagar no App” e “Link MP” (gera e abre link)
  - Página `Student/CheckoutPage.tsx`: prioriza criação de link do MP; fallback para simulação se indisponível
- Services
  - `payments.service.ts`: métodos para CRUD admin, checkout MP (aluno), gerar link (admin), simulação; normalização de IDs e tratamento de erros
  - `notifications.service.ts`: ajustado admin create endpoint

## 🧪 Como Testar

Pré-requisitos:
- Definir variáveis no `api/.env.docker` (detalhes no guia “Configurar Mercado Pago”):
  - `MP_ACCESS_TOKEN`, `MP_NOTIFICATION_URL` (opcional), `FRONTEND_URL`
- Subir os containers da API e do Frontend

Passo a passo (Admin – Gerar Link):
1) Acesse `/admin/pagamentos`
2) Crie uma nova cobrança para um usuário (status “pendente”)
3) Clique em “Gerar Link” → uma nova aba do Mercado Pago abrirá
4) Pague com Pix ou Cartão de crédito
5) Aguarde o webhook (alguns segundos) → status deve mudar para “pago”/“aprovado”

Passo a passo (Aluno – Meu Histórico):
1) Acesse `/aluno/pagamentos`
2) Em uma cobrança pendente, clique em “Link MP”
3) Finalize o pagamento no Mercado Pago
4) Retorne à página e confirme a atualização do status

Fallback (Simulação):
- Em `CheckoutPage`, se a criação do link MP falhar, o fluxo de simulação é ativado: “Criar Pagamento” → “Aprovar”

### Testes Automatizados

- **Backend**: `cd api && ./vendor/bin/phpunit tests/Feature/Payments/PaymentsApiTest.php`  
  (usa SQLite em memória para validar CRUD de cobranças, checkout simulado e processamento de webhook)
- **Frontend**: `cd web && npm exec --prefix .deps -- vitest -- --run`  
  (executar uma vez `npm install --prefix .deps` para instalar as dependências de teste isoladas)

## 📝 Lições Aprendidas
- Radix UI Select: nunca usar `value=""` em itens; usar mensagem desabilitada quando sem resultados
- Overlays: padronizar z-index e portalizar o conteúdo do Select dentro do Dialog ativo
- Webhook: eventos do MP podem chegar com latência; projetar UI para estados “processando”
- Padronização de erros: `ApiError` no frontend preserva `errors` (422) para toasts mais úteis
- Roteamento: PUT rotas específicas antes de `apiResource()` para evitar colisões (`check-availability` vs `show`)

## 📎 Arquivos Relevantes
- Backend
  - `api/routes/api.php`
  - `api/app/Http/Controllers/PagamentoController.php`
  - `api/app/Http/Controllers/MercadoPagoWebhookController.php`
  - `api/app/Services/PagamentoService.php`
  - `api/config/services.php`
- Frontend
  - `web/src/pages/admin/Payments.tsx`
  - `web/src/pages/student/PaymentHistory.tsx`
  - `web/src/pages/student/CheckoutPage.tsx`
  - `web/src/services/payments.service.ts`
  - `web/src/services/notifications.service.ts`

---

Para configuração detalhada do Mercado Pago (tokens, webhook, testes), veja: `docs/guia-mercado-pago.md`.
