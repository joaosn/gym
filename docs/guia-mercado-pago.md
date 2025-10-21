# 🧭 Guia: Configurar Mercado Pago (Checkout Pro)

Este guia explica como habilitar o Checkout Pro (Pix e Cartão) no Fitway.

## 1) Variáveis de Ambiente (API)

Edite `api/.env.docker` e defina:

```dotenv
# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxx
MP_NOTIFICATION_URL=https://SEU_DOMINIO/api/webhooks/mercadopago

# Frontend (usado para redirecionamentos/links auxiliares)
FRONTEND_URL=http://localhost:5173
```

Observações:

- `MP_NOTIFICATION_URL` é opcional. Se omitir, o backend usará `APP_URL + /api/webhooks/mercadopago`.
- Use Access Token de produção para pagamentos reais. Para testes locais, é possível usar Sandbox (ver seção 4).

Recrie o container da API após editar:

```powershell
docker-compose up -d --no-deps --force-recreate api
```

## 2) Webhook no Mercado Pago

No Painel do Mercado Pago (Credenciais → Webhooks):

- Adicione a URL: `https://SEU_DOMINIO/api/webhooks/mercadopago`
- Eventos: selecione “Pagamentos” (payments) e “Merchant Orders” (opcional)

Dicas:

- Em ambiente local, exponha a porta da API usando um túnel (ngrok, localtunnel) para receber webhooks.
- Exemplo: `https://abcd-1234.ngrok-free.app/api/webhooks/mercadopago`

## 3) Fluxo de Checkout

Alunos:

- `POST /api/payments/checkout/mp/{id_parcela}` → retorna `init_point` (url) do Mercado Pago.
- O aluno é redirecionado para o MP e finaliza o pagamento (Pix/Cartão).
- O Mercado Pago envia um webhook → o backend atualiza o status (pago/aprovado).

Administradores:

- `POST /api/admin/payments/{id}/create-checkout` → gera link do MP para uma cobrança pendente.

## 4) Testes em Sandbox

- Use credenciais de teste no Dashboard do MP (modo Sandbox).
- Com Sandbox, é possível simular pagamentos sem transações reais.
- Para testes rápidos no app, existe também um fallback de simulação (CheckoutPage → “Criar Pagamento” e “Aprovar”).

## 5) Segurança

- Não exponha o Access Token no frontend; ele fica apenas no backend.
- Valide a origem do webhook se necessário (opcional: consultar o pagamento no MP antes de marcar como pago).

## 6) Troubleshooting

- Link não abre: verifique se o endpoint está retornando `init_point` e se o browser não bloqueou pop-ups.
- Webhook não atualiza o status:
  - Confirme a URL configurada no painel do MP.
  - Verifique logs da API: `docker-compose logs -f api`.
  - Cheque se a URL é pública (use ngrok/localtunnel em desenvolvimento).
- 401/403 ao criar link: confira token de autenticação e roles (admin/aluno).
- CORS no frontend: confira `CORS_ALLOWED_ORIGINS` e `SANCTUM_STATEFUL_DOMAINS` no `.env.docker` da API.

## 7) Referências

- Arquivo: `api/config/services.php` (chaves do MP)
- Endpoints: `api/routes/api.php`
- Controladores: `PagamentoController`, `MercadoPagoWebhookController`
