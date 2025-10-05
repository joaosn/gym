# Fitway — Modelo de Dados e Fluxos

Este documento resume o relacionamento das tabelas (a partir do `database/ddl.sql`), os fluxos principais do sistema (login, reservas, aulas, personal, assinaturas/pagamentos) e um plano de integração Frontend ↔ API para destravar a implementação dos CRUDs.

---

## 1) Entidades principais (resumo)

- usuarios (auth e perfis: admin, aluno, personal/instrutor)
- planos, assinaturas, eventos_assinatura (gestão de planos e ciclo)
- quadras, bloqueios_quadra, reservas_quadra (agenda de quadras + anti-overlap)
- instrutores, aulas, horarios_aula, ocorrencias_aula, inscricoes_aula (turmas)
- disponibilidade_instrutor, sessoes_personal (agenda 1:1 + anti-overlap)
- pagamentos, itens_pagamento, webhooks_pagamento (financeiro)
- notificacoes, auditorias (apoio)

Observações:

- Anti-overlap garantido via constraints `EXCLUDE USING gist` (reservas_quadra, ocorrencias_aula, sessoes_personal).
- Datas/times com períodos calculados (coluna `periodo` como TSTZRANGE) para facilitar busca e conflitos.

---

## 2) Relacionamentos (chaves principais)

- `usuarios`
  - 1:N `reservas_quadra.id_usuario → usuarios.id_usuario`
  - 1:N `inscricoes_aula.id_usuario → usuarios.id_usuario`
  - 1:N `sessoes_personal.id_usuario → usuarios.id_usuario`
  - 1:N `pagamentos.id_usuario → usuarios.id_usuario`
  - 1:N `assinaturas.id_usuario → usuarios.id_usuario`
  - 1:N `instrutores.id_usuario → usuarios.id_usuario` (opcional, SET NULL)

- `planos`
  - 1:N `assinaturas.id_plano → planos.id_plano`

- `quadras`
  - 1:N `reservas_quadra.id_quadra → quadras.id_quadra`
  - 1:N `bloqueios_quadra.id_quadra → quadras.id_quadra`
  - 1:N `horarios_aula.id_quadra → quadras.id_quadra`
  - 1:N `ocorrencias_aula.id_quadra → quadras.id_quadra`
  - 1:N `sessoes_personal.id_quadra → quadras.id_quadra` (opcional)

- `instrutores`
  - 1:N `horarios_aula.id_instrutor → instrutores.id_instrutor`
  - 1:N `ocorrencias_aula.id_instrutor → instrutores.id_instrutor`
  - 1:N `disponibilidade_instrutor.id_instrutor → instrutores.id_instrutor`
  - 1:N `sessoes_personal.id_instrutor → instrutores.id_instrutor`

- `aulas`
  - 1:N `horarios_aula.id_aula → aulas.id_aula`
  - 1:N `ocorrencias_aula.id_aula → aulas.id_aula`
  - 1:N `inscricoes_aula.id_aula → aulas.id_aula`

- `pagamentos`
  - 1:N `itens_pagamento.id_pagamento → pagamentos.id_pagamento`
  - Webhooks se relacionam por `provedor/id_evento_externo` e referências em `itens_pagamento`.

---

## 3) Perfis e Regras de Acesso (MVP)

- Admin: CRUD completo de planos, quadras, aulas, instrutores, bloqueios; visão geral de reservas/pagamentos.
- Personal/Instrutor: gerencia disponibilidade, visualiza suas turmas/sessões, registra presença.
- Aluno: reserva quadra, se inscreve em aulas, contrata personal, gerencia assinatura.

---

## 4) Fluxos principais

### 4.1 Login/Autenticação (Sanctum ou JWT)

- Recomendação: usar Laravel Sanctum com bearer token (já previsto no frontend via header Authorization).
- Roles no frontend: `aluno`, `personal`, `admin` (mapeadas de `usuarios.papel`).

Endpoints (proposta):

- POST `/auth/login` { email, senha } → { access_token, user { id, nome, email, papel } }
- GET `/auth/me` → dados do usuário logado
- POST `/auth/logout`

Mapeamento para a tabela `usuarios`:

- `email` → `usuarios.email`
- `senha` → verificar via hash (comparar com `senha_hash`).
- `papel` → `aluno | personal | admin`

### 4.2 Assinaturas/Planos

- Admin cria `planos`.
- Aluno assina → cria `assinaturas` com `status` e ciclo.
- Eventos de assinatura ficam em `eventos_assinatura`.

Endpoints (proposta):

- GET `/plans`
- POST `/subscriptions` { planId }
- GET `/subscriptions/me`
- DELETE `/subscriptions/me`
- Admin: CRUD `/admin/plans`, `/admin/subscriptions`

### 4.3 Quadras (Reserva com Anti-Overlap)

- Admin cadastra `quadras` e `bloqueios_quadra`.
- Aluno verifica disponibilidade e faz `reservas_quadra`.
- Constraint impede sobreposição na mesma quadra.

Endpoints (proposta):

- GET `/courts`
- GET `/courts/{id}/availability?date=YYYY-MM-DD`
- POST `/bookings` { id_quadra, inicio, fim }
- DELETE `/bookings/{id}`
- Admin: CRUD `/admin/courts`, `/admin/courts/blocks`

### 4.4 Aulas (Turmas) e Inscrições

- Admin configura `aulas` e `horarios_aula`.
- O sistema gera `ocorrencias_aula` (agenda) e alunos fazem `inscricoes_aula`.

Endpoints (proposta):

- GET `/classes`
- GET `/classes/{id}/schedule?week=YYYY-Www`
- POST `/classes/{id}/enroll`
- DELETE `/classes/{id}/enroll`
- Admin: CRUD `/admin/classes`

### 4.5 Personal (1:1)

- Personal define `disponibilidade_instrutor`.
- Aluno agenda `sessoes_personal`.
- Anti-overlap via constraint por instrutor.

Endpoints (proposta):

- GET `/personals`
- GET `/personals/{id}/availability?date=YYYY-MM-DD`
- POST `/personals/{id}/sessions` { inicio, fim }
- DELETE `/personals/sessions/{id}`

### 4.6 Pagamentos

- Cria `pagamentos` e `itens_pagamento` (referência: assinatura, reserva, inscrição...).
- Webhooks salvam `webhooks_pagamento` e atualizam status.

Endpoints (proposta):

- POST `/payments/checkout` { items: [...] }
- GET `/payments/{id}`
- POST `/payments/webhook` (público, com verificação de assinatura)

---

## 5) Integração Frontend ↔ API

Contrato de autenticação (compatível com `web/src/lib/api-client.ts`):

- O frontend envia `Authorization: Bearer <token>`.
- Ao receber 401, o client remove o token e redireciona para `/login`.

Ajustes no Front:

- `VITE_API_URL` já está configurado para apontar para a API.
- Implementar `authService.login` para chamar `/auth/login` (remover mock) e salvar `access_token` e `user` no localStorage.
- `ProtectedRoute` já valida papel (`allowedRoles`).

Mapeamento de tipos (frontend ↔ banco):

- User (frontend) ≈ `usuarios`: { id: `id_usuario`, name: `nome`, email, role: `papel`, phone: `telefone` }
- Court ≈ `quadras`: id → `id_quadra`, name → `nome`, location → `localizacao`, price/hour → `preco_hora`.
- Booking ≈ `reservas_quadra`: startTime → `inicio`, endTime → `fim`, status, price.
- Class ≈ `aulas` + agenda via `ocorrencias_aula`.
- Personal ≈ `instrutores` + `disponibilidade_instrutor`.

---

## 6) Plano de entrega dos CRUDs (ordem sugerida)

1) Autenticação (login/logout/me) + roles
2) Quadras: CRUD admin + disponibilidade + reservas
3) Aulas: CRUD admin + agenda (ocorrências) + inscrições
4) Personal: cadastro instrutor + disponibilidade + sessões 1:1
5) Planos/Assinaturas: CRUD planos + assinatura do aluno
6) Pagamentos: checkout + webhook + conciliação

Critérios gerais:

- Sempre validar conflito de horário (anti-overlap) no banco (já há constraints), e também no serviço (mensagens amigáveis).
- Paginação e filtros nos endpoints GET (date range, status, etc.).
- Retornar erros consistentes: `{ message, code, details }`.

---

## 7) Próximos passos imediatos

- Implementar endpoints de autenticação (Laravel Sanctum) e conectar o Front (remover mock de `auth.service.ts`).
- Escrever Repositórios/Services na API refletindo a DDL (ex.: `ReservaQuadraService`).
- Criar migrations auxiliares alinhadas à DDL se precisar colunas extras para o Laravel.
- Adicionar testes básicos por fluxo (login, reserva, inscrição).

---

Dúvidas? Vamos detalhar primeiro a autenticação e o endpoint de disponibilidade de quadras, e já ligamos o Front. :)
