# 📡 Fitway - Documentação da API

> **Versão**: 1.0 | **Base URL**: `http://localhost:8000/api`

---

## 📚 Índice

- [Autenticação](#autenticação)
- [Quadras (Courts)](#quadras-courts)
- [Reservas de Quadras (Court Bookings)](#reservas-de-quadras-court-bookings)
- [Bloqueios de Quadras (Court Blockings)](#bloqueios-de-quadras-court-blockings)
- [Planos (Plans)](#planos-plans)
- [Usuários (Users)](#usuários-users)
- [Instrutores (Instructors)](#instrutores-instructors)
- [Disponibilidade Instrutor (Instructor Availability)](#disponibilidade-instrutor-instructor-availability)
- [Aulas em Grupo (Classes)](#aulas-em-grupo-classes)
- [Horários de Aula (Class Schedules)](#horários-de-aula-class-schedules)
- [Ocorrências de Aula (Class Occurrences)](#ocorrências-de-aula-class-occurrences)
- [Inscrições (Enrollments)](#inscrições-enrollments)
- [Sessões Personal (Personal Sessions)](#sessões-personal-personal-sessions)
- [Assinaturas (Subscriptions)](#assinaturas-subscriptions)
- [Pagamentos (Payments)](#pagamentos-payments)
- [Webhooks](#webhooks)
- [Códigos de Status](#códigos-de-status)
- [Tratamento de Erros](#tratamento-de-erros)

---

## 🔐 Autenticação

Todas as rotas protegidas requerem header:

```http
Authorization: Bearer {token}
```

### Registrar Usuário

```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "senha_confirmation": "senha123",
  "telefone": "11988887777",
  "documento": "12345678900",
  "data_nascimento": "1990-01-15",
  "papel": "aluno"
}
```

**Response** (201):
```json
{
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "papel": "aluno",
    "status": "ativo"
  },
  "access_token": "1|abcdef123456..."
}
```

**Validações**:
- `nome`: obrigatório, string
- `email`: obrigatório, email válido, único
- `senha`: obrigatório, min:6, confirmação
- `telefone`: obrigatório, formato brasileiro
- `documento`: obrigatório, CPF válido, único
- `data_nascimento`: obrigatório, data passada
- `papel`: obrigatório, enum (aluno, personal, instrutor, admin)

---

### Login

```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "papel": "aluno",
    "status": "ativo"
  },
  "access_token": "1|abcdef123456..."
}
```

**Erros**:
- `401`: Credenciais inválidas

---

### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### Usuário Logado

```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11988887777",
    "documento": "12345678900",
    "data_nascimento": "1990-01-15",
    "papel": "aluno",
    "status": "ativo",
    "criado_em": "2025-01-15T10:00:00-03:00",
    "atualizado_em": "2025-01-15T10:00:00-03:00"
  }
}
```

---

## 🏐 Quadras (Courts)

### Listar Quadras (Admin)

```http
GET /api/admin/courts
Authorization: Bearer {token}
```

**Query Parameters**:
- `nome`: filtro por nome (like)
- `esporte`: filtro por esporte
- `status`: filtro por status (ativa, inativa, manutencao)
- `per_page`: items por página (padrão: 15)

**Response** (200):
```json
{
  "data": [
    {
      "id_quadra": 1,
      "nome": "Quadra Beach Tennis 1",
      "localizacao": "Área Externa",
      "esporte": "beach_tennis",
      "preco_hora": 150.00,
      "status": "ativa",
      "caracteristicas_json": {
        "cobertura": true,
        "iluminacao": true,
        "vestiario": true
      },
      "criado_em": "2025-01-15T10:00:00-03:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 5,
    "per_page": 15
  }
}
```

---

### Criar Quadra (Admin)

```http
POST /api/admin/courts
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "nome": "Quadra Beach Tennis 2",
  "localizacao": "Área Externa",
  "esporte": "beach_tennis",
  "preco_hora": 150.00,
  "status": "ativa",
  "caracteristicas_json": {
    "cobertura": true,
    "iluminacao": true
  }
}
```

**Response** (201):
```json
{
  "data": {
    "id_quadra": 2,
    "nome": "Quadra Beach Tennis 2",
    "preco_hora": 150.00,
    "status": "ativa"
  }
}
```

**Validações**:
- `nome`: obrigatório, único, max:100
- `esporte`: obrigatório, enum (beach_tennis, tenis, futevolei, volei)
- `preco_hora`: obrigatório, numérico, > 0
- `status`: opcional, enum (ativa, inativa, manutencao)

---

### Atualizar Quadra (Admin)

```http
PUT /api/admin/courts/{id}
Authorization: Bearer {token}
```

**Request Body**: Igual ao POST (todos campos opcionais)

**Response** (200): Igual ao POST

---

### Deletar Quadra (Admin)

```http
DELETE /api/admin/courts/{id}
Authorization: Bearer {token}
```

**Response** (204): No Content

**Nota**: Soft Delete - marca `status = 'excluido'`

---

## 📅 Reservas de Quadras (Court Bookings)

### Listar Minhas Reservas (Aluno)

```http
GET /api/court-bookings
Authorization: Bearer {token}
```

**Query Parameters**:
- `status`: filtro (pendente, confirmada, cancelada, concluida)
- `data_inicio`: filtro por data >= (YYYY-MM-DD)
- `data_fim`: filtro por data <= (YYYY-MM-DD)

**Response** (200):
```json
{
  "data": [
    {
      "id_reserva_quadra": 1,
      "id_quadra": 1,
      "id_usuario": 2,
      "inicio": "2025-01-20T14:00:00-03:00",
      "fim": "2025-01-20T15:30:00-03:00",
      "preco_total": 225.00,
      "status": "confirmada",
      "quadra": {
        "nome": "Quadra Beach Tennis 1",
        "esporte": "beach_tennis"
      },
      "usuario": {
        "nome": "João Silva"
      }
    }
  ]
}
```

---

### Criar Reserva (Aluno)

```http
POST /api/court-bookings
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_quadra": 1,
  "id_usuario": 2,
  "inicio": "2025-01-20T14:00:00",
  "fim": "2025-01-20T15:30:00"
}
```

**Response** (201):
```json
{
  "data": {
    "id_reserva_quadra": 1,
    "id_quadra": 1,
    "id_usuario": 2,
    "inicio": "2025-01-20T14:00:00-03:00",
    "fim": "2025-01-20T15:30:00-03:00",
    "preco_total": 225.00,
    "status": "pendente"
  }
}
```

**Validações**:
- `id_quadra`: obrigatório, existe, ativa
- `inicio`: obrigatório, datetime futuro
- `fim`: obrigatório, datetime após início
- **Anti-overlap**: valida contra reservas existentes

**Erros**:
- `409`: Horário já reservado (overlap)
- `422`: Quadra inativa ou fora de horário

---

### Verificar Disponibilidade

```http
POST /api/court-bookings/check-availability
```

**Request Body**:
```json
{
  "id_quadra": 1,
  "inicio": "2025-01-20T14:00:00",
  "fim": "2025-01-20T15:30:00"
}
```

**Response** (200):
```json
{
  "disponivel": true,
  "preco_total": 225.00
}
```

**Response** (409):
```json
{
  "disponivel": false,
  "message": "Horário já reservado",
  "conflitos": [
    {
      "inicio": "2025-01-20T14:00:00-03:00",
      "fim": "2025-01-20T16:00:00-03:00",
      "usuario": "Maria Santos"
    }
  ]
}
```

---

### Confirmar Reserva (Admin)

```http
PATCH /api/court-bookings/{id}/confirm
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id_reserva_quadra": 1,
    "status": "confirmada"
  }
}
```

---

### Cancelar Reserva

```http
PATCH /api/court-bookings/{id}/cancel
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id_reserva_quadra": 1,
    "status": "cancelada"
  }
}
```

**Regras**:
- Aluno só pode cancelar próprias reservas
- Admin pode cancelar qualquer reserva
- Não pode cancelar reservas já concluídas

---

## 🚫 Bloqueios de Quadras (Court Blockings)

### Criar Bloqueio (Admin)

```http
POST /api/admin/court-blockings
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_quadra": 1,
  "inicio": "2025-01-25T00:00:00",
  "fim": "2025-01-26T23:59:59",
  "motivo": "Manutenção preventiva"
}
```

**Response** (201):
```json
{
  "data": {
    "id_bloqueio_quadra": 1,
    "id_quadra": 1,
    "inicio": "2025-01-25T00:00:00-03:00",
    "fim": "2025-01-26T23:59:59-03:00",
    "motivo": "Manutenção preventiva"
  }
}
```

**Validações**:
- `id_quadra`: obrigatório, existe
- `inicio`: obrigatório, datetime futuro
- `fim`: obrigatório, datetime após início
- `motivo`: obrigatório, string

**Efeito**: Reservas no período ficam indisponíveis

---

## 💳 Planos (Plans)

### Listar Planos (Público)

```http
GET /api/plans
```

**Response** (200):
```json
{
  "data": [
    {
      "id_plano": 1,
      "nome": "Básico Mensal",
      "preco": 150.00,
      "ciclo_cobranca": "mensal",
      "max_reservas_futuras": 2,
      "max_sessoes_personal_mes": 0,
      "desconto_aulas_grupo": 0,
      "desconto_reservas_quadra": 0,
      "beneficios_json": [
        "2 reservas simultâneas",
        "Acesso às quadras"
      ],
      "status": "ativo"
    }
  ]
}
```

---

### Criar Plano (Admin)

```http
POST /api/admin/plans
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "nome": "Premium Anual",
  "preco": 1500.00,
  "ciclo_cobranca": "anual",
  "max_reservas_futuras": 5,
  "max_sessoes_personal_mes": 4,
  "desconto_aulas_grupo": 20,
  "desconto_reservas_quadra": 15,
  "beneficios_json": [
    "5 reservas simultâneas",
    "4 sessões personal/mês",
    "20% off em aulas",
    "15% off em reservas"
  ]
}
```

**Response** (201):
```json
{
  "data": {
    "id_plano": 3,
    "nome": "Premium Anual",
    "preco": 1500.00,
    "status": "ativo"
  }
}
```

**Validações**:
- `nome`: obrigatório, único
- `preco`: obrigatório, numérico > 0
- `ciclo_cobranca`: obrigatório, enum (mensal, trimestral, semestral, anual)
- `max_reservas_futuras`: opcional, inteiro >= 0
- `desconto_*`: opcional, entre 0 e 100

---

## 👤 Usuários (Users)

### Listar Usuários (Admin)

```http
GET /api/admin/users
Authorization: Bearer {token}
```

**Query Parameters**:
- `nome`: filtro por nome (like)
- `papel`: filtro (aluno, personal, instrutor, admin)
- `status`: filtro (ativo, inativo)

**Response** (200):
```json
{
  "data": [
    {
      "id_usuario": 2,
      "nome": "João Silva",
      "email": "joao@example.com",
      "telefone": "11988887777",
      "documento": "12345678900",
      "papel": "aluno",
      "status": "ativo",
      "criado_em": "2025-01-15T10:00:00-03:00"
    }
  ]
}
```

---

### Criar Usuário (Admin)

```http
POST /api/admin/users
Authorization: Bearer {token}
```

**Request Body**: Igual ao `/auth/register`

**Response** (201): Objeto do usuário criado

---

### Atualizar Usuário (Admin)

```http
PUT /api/admin/users/{id}
Authorization: Bearer {token}
```

**Request Body**: Campos do usuário (todos opcionais)

**Response** (200): Objeto do usuário atualizado

---

### Deletar Usuário (Admin)

```http
DELETE /api/admin/users/{id}
Authorization: Bearer {token}
```

**Response** (204): No Content

**Nota**: Soft Delete - marca `status = 'excluido'`

---

## 💪 Instrutores (Instructors)

### Listar Instrutores

```http
GET /api/instructors
Authorization: Bearer {token}
```

**Query Parameters**:
- `nome`: filtro por nome (like)
- `especialidades`: filtro por especialidade
- `status`: filtro (ativo, inativo)

**Response** (200):
```json
{
  "data": [
    {
      "id_instrutor": 1,
      "id_usuario": 5,
      "nome": "Carlos Personal",
      "email": "carlos@fitway.com",
      "telefone": "11977776666",
      "cref": "123456-G/SP",
      "valor_hora": 120.00,
      "especialidades_json": ["beach_tennis", "funcional"],
      "status": "ativo",
      "usuario": {
        "nome": "Carlos Personal",
        "email": "carlos@fitway.com"
      }
    }
  ]
}
```

---

### Criar Instrutor (Admin)

```http
POST /api/admin/instructors
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_usuario": 5,
  "nome": "Carlos Personal",
  "email": "carlos@fitway.com",
  "telefone": "11977776666",
  "cref": "123456-G/SP",
  "valor_hora": 120.00,
  "especialidades_json": ["beach_tennis", "funcional"]
}
```

**Response** (201):
```json
{
  "data": {
    "id_instrutor": 1,
    "nome": "Carlos Personal",
    "valor_hora": 120.00,
    "status": "ativo"
  }
}
```

**Validações**:
- `id_usuario`: obrigatório, existe, único
- `nome`: obrigatório
- `email`: obrigatório, email válido
- `cref`: obrigatório, formato XXXXXX-G/UF
- `valor_hora`: obrigatório, numérico > 0
- `especialidades_json`: opcional, array

---

## 🕐 Disponibilidade Instrutor (Instructor Availability)

### Listar Disponibilidade de um Instrutor

```http
GET /api/instructor-availability/{id_instrutor}
```

**Response** (200):
```json
{
  "data": [
    {
      "id_disponibilidade": 1,
      "id_instrutor": 1,
      "dia_semana": 1,
      "hora_inicio": "08:00:00",
      "hora_fim": "12:00:00"
    },
    {
      "id_disponibilidade": 2,
      "id_instrutor": 1,
      "dia_semana": 1,
      "hora_inicio": "14:00:00",
      "hora_fim": "18:00:00"
    }
  ]
}
```

**`dia_semana`**: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

---

### Criar Disponibilidade (Instrutor/Admin)

```http
POST /api/instructor-availability
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_instrutor": 1,
  "dia_semana": 1,
  "hora_inicio": "08:00:00",
  "hora_fim": "12:00:00"
}
```

**Response** (201):
```json
{
  "data": {
    "id_disponibilidade": 1,
    "id_instrutor": 1,
    "dia_semana": 1,
    "hora_inicio": "08:00:00",
    "hora_fim": "12:00:00"
  }
}
```

**Validações**:
- `dia_semana`: obrigatório, entre 0 e 6
- `hora_inicio`: obrigatório, formato HH:MM:SS
- `hora_fim`: obrigatório, após hora_inicio
- **Anti-overlap**: não pode sobrepor disponibilidades existentes do mesmo instrutor no mesmo dia

---

### Deletar Disponibilidade

```http
DELETE /api/instructor-availability/{id}
Authorization: Bearer {token}
```

**Response** (204): No Content

---

## 📚 Aulas em Grupo (Classes)

### Listar Aulas

```http
GET /api/classes
Authorization: Bearer {token}
```

**Query Parameters**:
- `nome`: filtro por nome (like)
- `esporte`: filtro por esporte
- `nivel`: filtro por nível (iniciante, intermediario, avancado)

**Response** (200):
```json
{
  "data": [
    {
      "id_aula": 1,
      "nome": "Beach Tennis Iniciante",
      "descricao": "Aula para iniciantes",
      "esporte": "beach_tennis",
      "nivel": "iniciante",
      "duracao_min": 60,
      "capacidade_max": 8,
      "preco_unitario": 50.00,
      "status": "ativa"
    }
  ]
}
```

---

### Criar Aula (Admin)

```http
POST /api/admin/classes
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "nome": "Beach Tennis Avançado",
  "descricao": "Aula para alunos avançados",
  "esporte": "beach_tennis",
  "nivel": "avancado",
  "duracao_min": 90,
  "capacidade_max": 6,
  "preco_unitario": 80.00
}
```

**Response** (201):
```json
{
  "data": {
    "id_aula": 2,
    "nome": "Beach Tennis Avançado",
    "preco_unitario": 80.00,
    "status": "ativa"
  }
}
```

**Validações**:
- `nome`: obrigatório, único
- `esporte`: obrigatório
- `nivel`: obrigatório, enum (iniciante, intermediario, avancado)
- `duracao_min`: obrigatório, inteiro > 0
- `capacidade_max`: obrigatório, inteiro > 0
- `preco_unitario`: obrigatório, numérico >= 0

---

## ⏰ Horários de Aula (Class Schedules)

### Criar Horário Semanal (Admin)

```http
POST /api/admin/class-schedules
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_aula": 1,
  "id_instrutor": 1,
  "id_quadra": 1,
  "dia_semana": 1,
  "hora_inicio": "08:00:00"
}
```

**Response** (201):
```json
{
  "data": {
    "id_horario_aula": 1,
    "id_aula": 1,
    "id_instrutor": 1,
    "id_quadra": 1,
    "dia_semana": 1,
    "hora_inicio": "08:00:00"
  }
}
```

**Validações**:
- `id_aula`: obrigatório, existe, ativa
- `id_instrutor`: obrigatório, existe, ativo
- `id_quadra`: obrigatório, existe, ativa
- `dia_semana`: obrigatório, entre 0 e 6
- `hora_inicio`: obrigatório, formato HH:MM:SS
- **Anti-overlap**: valida disponibilidade do instrutor

---

## 📆 Ocorrências de Aula (Class Occurrences)

### Gerar Ocorrências (Admin)

```http
POST /api/admin/class-occurrences/generate
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_aula": 1,
  "data_inicio": "2025-01-20",
  "data_fim": "2025-02-20"
}
```

**Response** (201):
```json
{
  "message": "8 ocorrências geradas com sucesso",
  "data": [
    {
      "id_ocorrencia_aula": 1,
      "id_aula": 1,
      "id_instrutor": 1,
      "id_quadra": 1,
      "inicio": "2025-01-20T08:00:00-03:00",
      "fim": "2025-01-20T09:00:00-03:00",
      "vagas_disponiveis": 8,
      "status": "agendada"
    }
  ]
}
```

**Lógica**:
- Gera ocorrências baseadas nos `horarios_aula` da aula
- Calcula `fim` baseado em `duracao_min` da aula
- Inicializa `vagas_disponiveis = capacidade_max`
- Pula datas com bloqueio de quadra

---

### Listar Ocorrências

```http
GET /api/class-occurrences
Authorization: Bearer {token}
```

**Query Parameters**:
- `id_aula`: filtro por aula
- `data_inicio`: filtro >= (YYYY-MM-DD)
- `data_fim`: filtro <= (YYYY-MM-DD)
- `status`: filtro (agendada, cancelada, realizada)

**Response** (200):
```json
{
  "data": [
    {
      "id_ocorrencia_aula": 1,
      "id_aula": 1,
      "inicio": "2025-01-20T08:00:00-03:00",
      "fim": "2025-01-20T09:00:00-03:00",
      "vagas_disponiveis": 6,
      "status": "agendada",
      "aula": {
        "nome": "Beach Tennis Iniciante",
        "capacidade_max": 8
      },
      "instrutor": {
        "nome": "Carlos Personal"
      }
    }
  ]
}
```

---

## ✍️ Inscrições (Enrollments)

### Inscrever em Aula (Aluno)

```http
POST /api/classes/{id}/enroll
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_ocorrencia_aula": 1
}
```

**Response** (201):
```json
{
  "data": {
    "id_inscricao_aula": 1,
    "id_ocorrencia_aula": 1,
    "id_aula": 1,
    "id_usuario": 2,
    "status": "confirmada"
  }
}
```

**Validações**:
- Usuário não pode estar inscrito na mesma ocorrência
- Ocorrência deve ter vagas disponíveis
- Ocorrência não pode estar cancelada
- Usuário deve ter assinatura ativa (opcional)

**Efeito**: Decrementa `vagas_disponiveis` da ocorrência

---

### Cancelar Inscrição (Aluno)

```http
DELETE /api/enrollments/{id}
Authorization: Bearer {token}
```

**Response** (204): No Content

**Efeito**: Incrementa `vagas_disponiveis` da ocorrência

---

## 🏋️ Sessões Personal (Personal Sessions)

### Listar Minhas Sessões (Aluno)

```http
GET /api/personal-sessions
Authorization: Bearer {token}
```

**Query Parameters**:
- `status`: filtro (pendente, confirmada, cancelada, concluida)
- `data_inicio`: filtro >= (YYYY-MM-DD)

**Response** (200):
```json
{
  "data": [
    {
      "id_sessao_personal": 1,
      "id_instrutor": 1,
      "id_usuario": 2,
      "inicio": "2025-01-22T10:00:00-03:00",
      "fim": "2025-01-22T11:00:00-03:00",
      "preco_total": 120.00,
      "status": "confirmada",
      "instrutor": {
        "nome": "Carlos Personal"
      }
    }
  ]
}
```

---

### Criar Sessão Personal (Aluno)

```http
POST /api/personal-sessions
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_instrutor": 1,
  "id_usuario": 2,
  "inicio": "2025-01-22T10:00:00",
  "fim": "2025-01-22T11:00:00",
  "id_quadra": 1
}
```

**Response** (201):
```json
{
  "data": {
    "id_sessao_personal": 1,
    "id_instrutor": 1,
    "id_usuario": 2,
    "inicio": "2025-01-22T10:00:00-03:00",
    "fim": "2025-01-22T11:00:00-03:00",
    "preco_total": 120.00,
    "status": "pendente"
  }
}
```

**Validações (4 anti-overlap)**:
1. Instrutor disponível (dia da semana + horário)
2. Instrutor sem outra sessão no horário
3. Aluno sem outra sessão no horário
4. Quadra disponível (se `id_quadra` informado)

**Cálculo de Preço**: `instrutor.valor_hora * duração_em_horas`

---

### Verificar Disponibilidade Instrutor

```http
POST /api/personal-sessions/check-availability
```

**Request Body**:
```json
{
  "id_instrutor": 1,
  "inicio": "2025-01-22T10:00:00",
  "fim": "2025-01-22T11:00:00"
}
```

**Response** (200):
```json
{
  "disponivel": true,
  "preco_estimado": 120.00
}
```

**Response** (409):
```json
{
  "disponivel": false,
  "message": "Instrutor não disponível neste horário",
  "motivo": "Sessão já agendada das 10:00 às 12:00"
}
```

---

### Sessões do Instrutor

```http
GET /api/personal-sessions/my-sessions
Authorization: Bearer {token}
```

**Response** (200): Lista de sessões onde `id_instrutor = usuário logado`

---

### Confirmar Sessão (Instrutor/Admin)

```http
PATCH /api/personal-sessions/{id}/confirm
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id_sessao_personal": 1,
    "status": "confirmada"
  }
}
```

---

### Cancelar Sessão

```http
DELETE /api/personal-sessions/{id}
Authorization: Bearer {token}
```

**Response** (204): No Content

---

## 📋 Assinaturas (Subscriptions)

### Minha Assinatura Ativa (Aluno)

```http
GET /api/subscriptions/active
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id_assinatura": 1,
    "id_usuario": 2,
    "id_plano": 1,
    "data_inicio": "2025-01-01",
    "data_fim": "2025-02-01",
    "status": "ativa",
    "proximo_vencimento": "2025-02-01",
    "plano": {
      "nome": "Básico Mensal",
      "preco": 150.00
    }
  }
}
```

**Response** (404): Se não tiver assinatura ativa

---

### Criar Assinatura (Admin)

```http
POST /api/admin/subscriptions
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_usuario": 2,
  "id_plano": 1,
  "data_inicio": "2025-01-01",
  "data_fim": "2025-02-01"
}
```

**Response** (201):
```json
{
  "data": {
    "id_assinatura": 1,
    "id_usuario": 2,
    "id_plano": 1,
    "status": "ativa",
    "proximo_vencimento": "2025-02-01"
  }
}
```

**Validações**:
- `id_usuario`: obrigatório, existe
- `id_plano`: obrigatório, existe, ativo
- `data_inicio`: obrigatório, data válida
- `data_fim`: obrigatório, após data_inicio

---

### Cancelar Assinatura

```http
PATCH /api/subscriptions/{id}/cancel
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": {
    "id_assinatura": 1,
    "status": "cancelada"
  }
}
```

**Regras**:
- Aluno só pode cancelar própria assinatura
- Admin pode cancelar qualquer assinatura

---

## 💰 Pagamentos (Payments)

### Minhas Cobranças Pendentes (Aluno)

```http
GET /api/payments/pending
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "data": [
    {
      "id_pagamento": 1,
      "id_usuario": 2,
      "valor_total": 225.00,
      "moeda": "BRL",
      "status": "pendente",
      "vencimento": "2025-01-25",
      "provedor": "mercadopago",
      "itens": [
        {
          "referencia_tipo": "reserva_quadra",
          "referencia_id": 1,
          "descricao": "Reserva Quadra Beach Tennis 1",
          "valor": 225.00
        }
      ]
    }
  ]
}
```

---

### Histórico de Pagamentos (Aluno)

```http
GET /api/payments/history
Authorization: Bearer {token}
```

**Query Parameters**:
- `status`: filtro (pendente, pago, cancelado)
- `data_inicio`: filtro >= (YYYY-MM-DD)
- `data_fim`: filtro <= (YYYY-MM-DD)

**Response** (200): Lista de pagamentos do usuário

---

### Criar Cobrança Manual (Admin)

```http
POST /api/admin/payments/charges
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id_usuario": 2,
  "valor_total": 500.00,
  "vencimento": "2025-01-30",
  "referencia_tipo": "mensalidade",
  "referencia_id": 1,
  "descricao": "Mensalidade Janeiro 2025"
}
```

**Response** (201):
```json
{
  "data": {
    "id_pagamento": 2,
    "id_usuario": 2,
    "valor_total": 500.00,
    "status": "pendente",
    "vencimento": "2025-01-30"
  }
}
```

**Validações**:
- `id_usuario`: obrigatório, existe
- `valor_total`: obrigatório, numérico > 0
- `vencimento`: obrigatório, data futura
- `referencia_tipo`: obrigatório, enum (reserva_quadra, sessao_personal, inscricao_aula, assinatura, mensalidade, outro)

---

### Criar Checkout Mercado Pago (Aluno)

```http
POST /api/payments/{id}/checkout
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "url_checkout": "https://www.mercadopago.com.br/checkout/v1/payment/...",
  "id_transacao_ext": "1234567890",
  "expira_em": "2025-01-20T15:00:00-03:00"
}
```

**Erros**:
- `403`: Pagamento não pertence ao usuário
- `422`: Pagamento já pago/cancelado

**Fluxo**:
1. Aluno clica em "Pagar"
2. Backend cria preferência no Mercado Pago
3. Backend retorna URL do checkout
4. Frontend redireciona para URL
5. Usuário paga (PIX ou Cartão)
6. Mercado Pago envia webhook
7. Backend atualiza status do pagamento

---

### Simular Pagamento (DEV only)

```http
POST /api/payments/{id}/simulate
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "Pagamento simulado com sucesso",
  "data": {
    "id_pagamento": 1,
    "status": "pago"
  }
}
```

**⚠️ ATENÇÃO**: Apenas para ambiente de desenvolvimento!

---

## 🔔 Webhooks

### Webhook Mercado Pago

```http
POST /api/webhooks/mercadopago
```

**Headers**:
```http
Content-Type: application/json
X-Signature: {mercadopago_signature}
```

**Request Body** (exemplo):
```json
{
  "action": "payment.updated",
  "data": {
    "id": "1234567890"
  }
}
```

**Response** (200):
```json
{
  "message": "Webhook processado com sucesso"
}
```

**Lógica**:
1. Valida assinatura do Mercado Pago
2. Busca pagamento local por `id_transacao_ext`
3. Consulta status no Mercado Pago
4. Atualiza status local
5. Registra webhook em `webhooks_pagamento`

**Status Mapeados**:
- `approved` → `pago`
- `rejected` → `cancelado`
- `cancelled` → `cancelado`
- Outros → mantém `pendente`

---

## 📊 Códigos de Status

### HTTP Status Codes

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Sucesso sem corpo de resposta (DELETE) |
| 400 | Bad Request | Erro de sintaxe na requisição |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Sem permissão para acessar |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: horário ocupado) |
| 422 | Unprocessable Entity | Validação falhou |
| 500 | Internal Server Error | Erro no servidor |

### Status de Entidades

**Quadras**:
- `ativa`: Disponível para reservas
- `inativa`: Não aceita reservas
- `manutencao`: Temporariamente indisponível

**Reservas**:
- `pendente`: Aguardando confirmação
- `confirmada`: Confirmada pelo admin
- `cancelada`: Cancelada por aluno ou admin
- `concluida`: Realizada

**Aulas/Ocorrências**:
- `agendada`: Aberta para inscrições
- `cancelada`: Cancelada
- `realizada`: Já aconteceu

**Sessões Personal**:
- `pendente`: Aguardando confirmação do instrutor
- `confirmada`: Confirmada pelo instrutor
- `cancelada`: Cancelada
- `concluida`: Realizada

**Pagamentos**:
- `pendente`: Aguardando pagamento
- `pago`: Pagamento confirmado
- `cancelado`: Cancelado ou expirado

**Assinaturas**:
- `ativa`: Ativa e dentro do período
- `cancelada`: Cancelada pelo usuário/admin
- `expirada`: Período encerrado

---

## ⚠️ Tratamento de Erros

### Formato de Erro Padrão

```json
{
  "message": "Mensagem amigável do erro",
  "errors": {
    "campo": [
      "Mensagem de validação específica"
    ]
  }
}
```

### Exemplos

**Validação (422)**:
```json
{
  "message": "Dados inválidos",
  "errors": {
    "email": ["O campo email é obrigatório."],
    "senha": ["A senha deve ter no mínimo 6 caracteres."]
  }
}
```

**Conflict (409)**:
```json
{
  "message": "Horário já reservado",
  "conflitos": [
    {
      "inicio": "2025-01-20T14:00:00-03:00",
      "fim": "2025-01-20T16:00:00-03:00",
      "usuario": "Maria Santos"
    }
  ]
}
```

**Not Found (404)**:
```json
{
  "message": "Quadra não encontrada"
}
```

**Unauthorized (401)**:
```json
{
  "message": "Token inválido ou expirado"
}
```

**Forbidden (403)**:
```json
{
  "message": "Você não tem permissão para acessar este recurso"
}
```

---

## 🔒 Permissões por Role

| Endpoint | Admin | Aluno | Instrutor |
|----------|-------|-------|-----------|
| `GET /auth/me` | ✅ | ✅ | ✅ |
| `POST /admin/courts` | ✅ | ❌ | ❌ |
| `GET /courts` | ✅ | ✅ | ✅ |
| `POST /court-bookings` | ✅ | ✅ | ❌ |
| `PATCH /court-bookings/{id}/confirm` | ✅ | ❌ | ❌ |
| `POST /admin/classes` | ✅ | ❌ | ❌ |
| `POST /classes/{id}/enroll` | ✅ | ✅ | ❌ |
| `POST /personal-sessions` | ✅ | ✅ | ❌ |
| `PATCH /personal-sessions/{id}/confirm` | ✅ | ❌ | ✅ |
| `GET /personal-sessions/my-sessions` | ✅ | ❌ | ✅ |
| `POST /admin/subscriptions` | ✅ | ❌ | ❌ |
| `POST /admin/payments/charges` | ✅ | ❌ | ❌ |
| `POST /payments/{id}/checkout` | ✅ | ✅ | ❌ |

---

## 📞 Suporte

- 📧 Email: suporte@fitway.com
- 📱 Telefone: (11) 1234-5678
- 🌐 Site: https://fitway.com.br

---

**Versão da API**: 1.0  
**Última Atualização**: Janeiro 2025
