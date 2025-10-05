-- =====================================================================
-- BANCO INICIAL FITGAMES / POSTGRESQL
-- Tabelas em pt-BR, snake_case, ids explícitos, constraints e índices.
-- =====================================================================

-- EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- (Opcional) Ajustar schema corrente
SET search_path TO public;

-- =====================================================================
-- LIMPEZA (CUIDADO EM PRODUÇÃO)
-- =====================================================================
DROP TABLE IF EXISTS
  notificacoes,
  auditorias,
  webhooks_pagamento,
  itens_pagamento,
  pagamentos,
  sessoes_personal,
  disponibilidade_instrutor,
  inscricoes_aula,
  ocorrencias_aula,
  horarios_aula,
  aulas,
  instrutores,
  reservas_quadra,
  bloqueios_quadra,
  quadras,
  eventos_assinatura,
  assinaturas,
  planos,
  usuarios
CASCADE;

-- =====================================================================
-- USUÁRIOS E PLANOS
-- =====================================================================
CREATE TABLE usuarios (
  id_usuario        BIGSERIAL PRIMARY KEY,
  nome              TEXT NOT NULL,
  email             CITEXT NOT NULL UNIQUE,
  senha_hash        TEXT NOT NULL,
  telefone          TEXT,
  documento         TEXT,           -- CPF/Documento
  data_nascimento   DATE,
  papel             TEXT NOT NULL CHECK (papel IN ('admin','aluno','personal','instrutor')),
  status            TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE planos (
  id_plano                 BIGSERIAL PRIMARY KEY,
  nome                     TEXT NOT NULL,
  preco                    NUMERIC(12,2) NOT NULL,                     -- R$
  ciclo_cobranca           TEXT NOT NULL CHECK (ciclo_cobranca IN ('mensal','trimestral','anual')),
  max_reservas_futuras     INTEGER NOT NULL DEFAULT 0,
  beneficios_json          JSONB,
  status                   TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em                TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assinaturas (
  id_assinatura        BIGSERIAL PRIMARY KEY,
  id_usuario           BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_plano             BIGINT NOT NULL REFERENCES planos(id_plano),
  data_inicio          DATE NOT NULL,
  data_fim             DATE,
  renova_automatico    BOOLEAN NOT NULL DEFAULT true,
  status               TEXT NOT NULL CHECK (status IN ('ativa','pendente','cancelada','expirada')),
  proximo_vencimento   DATE,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_assinaturas_usuario_status ON assinaturas (id_usuario, status);
CREATE INDEX ix_assinaturas_vencimento     ON assinaturas (proximo_vencimento);

CREATE TABLE eventos_assinatura (
  id_evento_assinatura  BIGSERIAL PRIMARY KEY,
  id_assinatura         BIGINT NOT NULL REFERENCES assinaturas(id_assinatura) ON DELETE CASCADE,
  tipo                  TEXT NOT NULL CHECK (tipo IN ('criada','renovada','cancelada','pagamento_ok','pagamento_erro')),
  payload_json          JSONB,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_eventos_assinatura_assin ON eventos_assinatura (id_assinatura);

-- =====================================================================
-- QUADRAS E RESERVAS (ANTI-OVERLAP)
-- =====================================================================
CREATE TABLE quadras (
  id_quadra            BIGSERIAL PRIMARY KEY,
  nome                 TEXT NOT NULL,
  localizacao          TEXT NOT NULL,
  esporte              TEXT NOT NULL,  -- 'beach_tennis','tenis','futebol',...
  preco_hora           NUMERIC(12,2) NOT NULL,
  caracteristicas_json JSONB,
  status               TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','inativa')),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bloqueios_quadra (
  id_bloqueio_quadra   BIGSERIAL PRIMARY KEY,
  id_quadra            BIGINT NOT NULL REFERENCES quadras(id_quadra) ON DELETE CASCADE,
  inicio               TIMESTAMPTZ NOT NULL,
  fim                  TIMESTAMPTZ NOT NULL,
  motivo               TEXT,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fim > inicio)
);
CREATE INDEX ix_bloqueios_quadra_periodo ON bloqueios_quadra (id_quadra, inicio, fim);

CREATE TABLE reservas_quadra (
  id_reserva_quadra    BIGSERIAL PRIMARY KEY,
  id_quadra            BIGINT NOT NULL REFERENCES quadras(id_quadra) ON DELETE CASCADE,
  id_usuario           BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  inicio               TIMESTAMPTZ NOT NULL,
  fim                  TIMESTAMPTZ NOT NULL,
  periodo              TSTZRANGE GENERATED ALWAYS AS (tstzrange(inicio, fim, '[)')) STORED,
  preco_total          NUMERIC(12,2) NOT NULL,
  origem               TEXT NOT NULL DEFAULT 'site' CHECK (origem IN ('site','admin')),
  status               TEXT NOT NULL CHECK (status IN ('pendente','confirmada','cancelada','no_show','concluida')),
  observacoes          TEXT,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fim > inicio)
);
CREATE INDEX ix_reservas_quadra_quadra_inicio ON reservas_quadra (id_quadra, inicio);
CREATE INDEX ix_reservas_quadra_usuario_inicio ON reservas_quadra (id_usuario, inicio);

-- Evita reservas sobrepostas para a MESMA quadra
ALTER TABLE reservas_quadra
  ADD CONSTRAINT uq_reserva_quadra_overlap
  EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&);

-- =====================================================================
-- INSTRUTORES, AULAS (GRUPO) E MATRÍCULAS
-- =====================================================================
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
  status               TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE aulas (
  id_aula              BIGSERIAL PRIMARY KEY,
  nome                 TEXT NOT NULL,
  esporte              TEXT NOT NULL,
  nivel                TEXT,  -- iniciante, intermediario, avancado
  duracao_min          INTEGER NOT NULL,
  capacidade_max       INTEGER NOT NULL,
  preco_unitario       NUMERIC(12,2), -- NULL = incluso no plano
  descricao            TEXT,
  requisitos           TEXT,
  status               TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','inativa')),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE horarios_aula (
  id_horario_aula      BIGSERIAL PRIMARY KEY,
  id_aula              BIGINT NOT NULL REFERENCES aulas(id_aula) ON DELETE CASCADE,
  id_instrutor         BIGINT NOT NULL REFERENCES instrutores(id_instrutor),
  id_quadra            BIGINT NOT NULL REFERENCES quadras(id_quadra),
  dia_semana           SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Seg .. 7=Dom
  hora_inicio          TIME NOT NULL,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_horarios_aula_aula_semana_hora ON horarios_aula (id_aula, dia_semana, hora_inicio);

CREATE TABLE ocorrencias_aula (
  id_ocorrencia_aula   BIGSERIAL PRIMARY KEY,
  id_aula              BIGINT NOT NULL REFERENCES aulas(id_aula) ON DELETE CASCADE,
  id_instrutor         BIGINT NOT NULL REFERENCES instrutores(id_instrutor),
  id_quadra            BIGINT NOT NULL REFERENCES quadras(id_quadra),
  inicio               TIMESTAMPTZ NOT NULL,
  fim                  TIMESTAMPTZ NOT NULL,
  periodo              TSTZRANGE GENERATED ALWAYS AS (tstzrange(inicio, fim, '[)')) STORED,
  status               TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada','cancelada','realizada')),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fim > inicio)
);
-- Evita sobreposição de ocorrências na mesma quadra
ALTER TABLE ocorrencias_aula
  ADD CONSTRAINT uq_ocorrencia_aula_overlap
  EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&);

CREATE TABLE inscricoes_aula (
  id_inscricao_aula    BIGSERIAL PRIMARY KEY,
  id_ocorrencia_aula   BIGINT REFERENCES ocorrencias_aula(id_ocorrencia_aula) ON DELETE SET NULL,
  id_aula              BIGINT NOT NULL REFERENCES aulas(id_aula) ON DELETE CASCADE,
  id_usuario           BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  status               TEXT NOT NULL DEFAULT 'inscrito' CHECK (status IN ('inscrito','cancelado','presente','falta')),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_ocorrencia_aula, id_usuario)
);
CREATE INDEX ix_inscricoes_aula_usuario ON inscricoes_aula (id_usuario, status);

-- =====================================================================
-- PERSONAL (1:1) E DISPONIBILIDADE (ANTI-OVERLAP)
-- =====================================================================
CREATE TABLE disponibilidade_instrutor (
  id_disponibilidade   BIGSERIAL PRIMARY KEY,
  id_instrutor         BIGINT NOT NULL REFERENCES instrutores(id_instrutor) ON DELETE CASCADE,
  dia_semana           SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio          TIME NOT NULL,
  hora_fim             TIME NOT NULL,
  disponivel           BOOLEAN NOT NULL DEFAULT true,
  CHECK (hora_fim > hora_inicio)
);
CREATE INDEX ix_disp_instrutor_semana_hora ON disponibilidade_instrutor (id_instrutor, dia_semana, hora_inicio);

CREATE TABLE sessoes_personal (
  id_sessao_personal   BIGSERIAL PRIMARY KEY,
  id_instrutor         BIGINT NOT NULL REFERENCES instrutores(id_instrutor) ON DELETE CASCADE,
  id_usuario           BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_quadra            BIGINT REFERENCES quadras(id_quadra),
  inicio               TIMESTAMPTZ NOT NULL,
  fim                  TIMESTAMPTZ NOT NULL,
  periodo              TSTZRANGE GENERATED ALWAYS AS (tstzrange(inicio, fim, '[)')) STORED,
  preco_total          NUMERIC(12,2) NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('pendente','confirmada','cancelada','concluida','no_show')),
  observacoes          TEXT,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fim > inicio)
);
-- Evita duas sessões no mesmo horário para o mesmo instrutor
ALTER TABLE sessoes_personal
  ADD CONSTRAINT uq_sessao_instrutor_overlap
  EXCLUDE USING gist (id_instrutor WITH =, periodo WITH &&);

CREATE INDEX ix_sessoes_personal_instrutor_inicio ON sessoes_personal (id_instrutor, inicio);
CREATE INDEX ix_sessoes_personal_usuario_inicio   ON sessoes_personal (id_usuario, inicio);

-- =====================================================================
-- FINANCEIRO E WEBHOOKS
-- =====================================================================
CREATE TABLE pagamentos (
  id_pagamento       BIGSERIAL PRIMARY KEY,
  id_usuario         BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  valor_total        NUMERIC(12,2) NOT NULL,
  moeda              TEXT NOT NULL DEFAULT 'BRL',
  status             TEXT NOT NULL CHECK (status IN ('pendente','pago','falhou','estornado')),
  provedor           TEXT NOT NULL,   -- ex.: 'mercadopago'
  id_transacao_ext   TEXT,            -- charge_id / payment_id do provedor
  descricao          TEXT,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_pagamentos_usuario_status ON pagamentos (id_usuario, status);

CREATE TABLE itens_pagamento (
  id_item_pagamento  BIGSERIAL PRIMARY KEY,
  id_pagamento       BIGINT NOT NULL REFERENCES pagamentos(id_pagamento) ON DELETE CASCADE,
  referencia_tipo    TEXT NOT NULL CHECK (referencia_tipo IN ('assinatura','reserva_quadra','inscricao_aula','sessao_personal')),
  referencia_id      BIGINT NOT NULL,
  valor              NUMERIC(12,2) NOT NULL,
  quantidade         INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX ix_itens_pagamento_ref ON itens_pagamento (referencia_tipo, referencia_id);

CREATE TABLE webhooks_pagamento (
  id_webhook         BIGSERIAL PRIMARY KEY,
  provedor           TEXT NOT NULL,
  tipo_evento        TEXT NOT NULL,
  id_evento_externo  TEXT NOT NULL,
  payload_json       JSONB NOT NULL,
  processado_em      TIMESTAMPTZ,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provedor, id_evento_externo)
);

-- =====================================================================
-- UTILIDADES (OPCIONAIS)
-- =====================================================================
CREATE TABLE notificacoes (
  id_notificacao   BIGSERIAL PRIMARY KEY,
  id_usuario       BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  canal            TEXT NOT NULL CHECK (canal IN ('email','whatsapp','app')),
  template_key     TEXT NOT NULL,
  payload_json     JSONB,
  status           TEXT NOT NULL DEFAULT 'enfileirada' CHECK (status IN ('enfileirada','enviada','falhou')),
  enviada_em       TIMESTAMPTZ,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_notificacoes_usuario_status ON notificacoes (id_usuario, status);

CREATE TABLE auditorias (
  id_auditoria     BIGSERIAL PRIMARY KEY,
  id_usuario       BIGINT REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  acao             TEXT NOT NULL,
  entidade         TEXT NOT NULL,
  id_entidade      BIGINT,
  meta_json        JSONB,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_auditorias_entidade ON auditorias (entidade, id_entidade);

-- =====================================================================
-- GATILHOS / ATUALIZAÇÃO DE "atualizado_em" (EXEMPLO)
-- (Opcional — pode adicionar para tabelas principais)
-- =====================================================================
-- CREATE OR REPLACE FUNCTION set_atualizado_em()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.atualizado_em := now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Ex.: 
-- CREATE TRIGGER tg_usuarios_atualizado_em
-- BEFORE UPDATE ON usuarios
-- FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- =====================================================================
-- FIM
-- =====================================================================
