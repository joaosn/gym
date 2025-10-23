# 🗄️ Banco de Dados - Fitway

## 📋 Visão Geral

O Fitway utiliza PostgreSQL 16 com as seguintes extensões:
- **citext**: Para emails case-insensitive
- **btree_gist**: Para índices de ranges (anti-overlap de horários)

## 🏗️ Estrutura do Banco

### Arquivos Importantes

```
api/database/
├── ddl.sql                    # Schema completo (documentado)
├── schema_dump.sql            # Dump automático do schema atual
├── migrations/                # Migrations Laravel
└── seeders/                   # Seeders (dados de teste)
    ├── UsuarioSeeder.php      # 32 alunos + admins + instrutores
    ├── PlanoSeeder.php        # 3 planos
    ├── QuadraSeeder.php       # 5 quadras
    ├── InstrutorSeeder.php    # 5 instrutores
    ├── AulaSeeder.php         # Aulas em grupo
    ├── AssinaturaSeeder.php   # Assinaturas ativas
    └── SessaoPersonalSeeder.php  # 8 sessões de teste
```

## 🚀 Inicialização Automática

### Como Funciona

Quando você sobe o projeto com `docker-compose up`:

1. **Container `api` inicia** e executa `start.sh`
2. **`start.sh` chama `init-db.sh`** que:
   - ✅ Verifica se o PostgreSQL está pronto
   - ✅ Roda `php artisan migrate --force` (todas as migrations)
   - ✅ Verifica se seeders já foram executados (via flag)
   - ✅ Se primeira vez, roda todos os seeders
   - ✅ Cria flag indicando que seeders foram executados

### Flag de Controle

Arquivo: `/var/www/storage/.seeders_executed`

- Se existe = Seeders já foram executados (não roda novamente)
- Se não existe = Primeira inicialização (roda seeders)

### Forçar Re-execução dos Seeders

Se você quiser rodar os seeders novamente:

```bash
# Remover a flag
docker-compose exec api rm /var/www/storage/.seeders_executed

# Reiniciar o container
docker-compose restart api
```

Ou executar manualmente:

```bash
docker-compose exec api php artisan db:seed --class=UsuarioSeeder --force
docker-compose exec api php artisan db:seed --class=PlanoSeeder --force
# ... etc
```

## 📊 Tabelas Principais

### Usuários e Autenticação
- `usuarios` - Todos os usuários (admin/aluno/instrutor)
- `instrutores` - Dados extras dos instrutores (CREF, valor/hora)
- `personal_access_tokens` - Tokens Sanctum para autenticação

### Planos e Assinaturas
- `planos` - Planos de assinatura (mensal/trimestral/anual)
- `assinaturas` - Assinaturas ativas dos alunos
- `eventos_assinatura` - Log de eventos das assinaturas

### Quadras e Reservas
- `quadras` - Quadras disponíveis (Beach Tennis, Tênis, etc)
- `reservas_quadra` - Reservas de quadra dos alunos
- `bloqueios_quadra` - Bloqueios de manutenção

### Aulas (Grupo)
- `aulas` - Aulas em grupo (Beach Tennis Avançado, etc)
- `horarios_aula` - Horários recorrentes das aulas
- `ocorrencias_aula` - Ocorrências específicas das aulas
- `inscricoes_aula` - Inscrições dos alunos nas aulas

### Personal 1:1
- `sessoes_personal` - Sessões personal training 1:1
- `disponibilidade_instrutor` - Disponibilidade dos instrutores

### Financeiro
- `cobrancas` - O que precisa ser pago
- `cobranca_parcelas` - Parcelas das cobranças
- `pagamentos` - Tentativas de pagamento (Mercado Pago, PIX, etc)
- `webhooks_pagamento` - Webhooks recebidos dos gateways

### Sistema
- `notificacoes` - Notificações para os usuários
- `auditorias` - Log de ações importantes
- `migrations` - Controle de migrations do Laravel

## 🔒 Anti-Overlap (Constraints)

O banco impede automaticamente sobreposições de horários usando **EXCLUDE constraints com GIST**:

### Reservas de Quadra
```sql
-- Impede que a mesma quadra seja reservada em horários sobrepostos
ALTER TABLE reservas_quadra
  ADD CONSTRAINT uq_reserva_quadra_overlap
  EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&);
```

### Sessões Personal
```sql
-- Impede que o mesmo instrutor tenha 2 sessões ao mesmo tempo
ALTER TABLE sessoes_personal
  ADD CONSTRAINT uq_sessao_instrutor_overlap
  EXCLUDE USING gist (id_instrutor WITH =, periodo WITH &&);
```

### Ocorrências de Aula
```sql
-- Impede que a mesma quadra tenha 2 aulas ao mesmo tempo
ALTER TABLE ocorrencias_aula
  ADD CONSTRAINT uq_ocorrencia_aula_overlap
  EXCLUDE USING gist (id_quadra WITH =, periodo WITH &&);
```

## 🌱 Seeders - Dados de Teste

### UsuarioSeeder
- **Admin**: `admin@fitway.com` / `senha123`
- **Personal**: `personal@fitway.com` / `senha123`
- **Aluno**: `aluno@fitway.com` / `senha123`
- **32 alunos** adicionais: `amanda.costa.18@fitway.com`, etc

### PlanoSeeder
- **Mensal**: R$ 250/mês
- **Trimestral**: R$ 650/3 meses
- **Anual**: R$ 2.400/ano

### QuadraSeeder
- 5 quadras: Beach Tennis (2), Tênis (2), Futevôlei (1)

### SessaoPersonalSeeder
- 8 sessões de teste para o instrutor `personal@fitway.com`

## 🔧 Comandos Úteis

### Verificar Status do Banco
```bash
docker-compose exec db psql -U fitway_user -d fitway_db -c "\dt"
```

### Backup do Banco
```bash
# Schema + dados
docker-compose exec db pg_dump -U fitway_user fitway_db > backup.sql

# Apenas schema (sem dados)
docker-compose exec db pg_dump -U fitway_user -d fitway_db --schema-only > schema.sql
```

### Restaurar Backup
```bash
docker-compose exec -T db psql -U fitway_user -d fitway_db < backup.sql
```

### Resetar Banco Completamente
```bash
# Parar containers
docker-compose down

# Remover volume do banco
docker volume rm tccfitway_postgres_data

# Subir novamente (vai recriar tudo)
docker-compose up -d
```

### Rodar Migrations Manualmente
```bash
docker-compose exec api php artisan migrate --force
```

### Rodar Seeders Manualmente
```bash
docker-compose exec api php artisan db:seed --class=UsuarioSeeder --force
```

### Ver Lista de Migrations
```bash
docker-compose exec api php artisan migrate:status
```

## 📈 Atualizações do Schema

### Última Atualização: 22/10/2025

**Mudanças**:
- ✅ Sistema financeiro refatorado (cobrancas → parcelas → pagamentos)
- ✅ Soft delete implementado (status='excluido')
- ✅ Papel 'personal' removido, agora é 'instrutor'
- ✅ Notificações refatoradas (tipo mais específico)
- ✅ Anti-overlap constraints para prevenir conflitos

**Tabelas Adicionadas**:
- `cobranca_parcelas` - Suporte a parcelamento futuro
- `webhooks_pagamento` - Log de webhooks Mercado Pago

**Tabelas Modificadas**:
- `usuarios` - Status agora aceita 'excluido'
- `instrutores` - Vinculado a usuarios.id_usuario
- `notificacoes` - Novo formato com tipos mais específicos

## 🔐 Segurança

- ✅ Senhas são hashadas com bcrypt (Laravel)
- ✅ Tokens JWT via Sanctum
- ✅ CITEXT para emails (case-insensitive, previne duplicatas)
- ✅ Foreign keys com ON DELETE CASCADE/SET NULL
- ✅ Constraints de validação (CHECK)
- ✅ Índices para performance

## 📞 Troubleshooting

### Erro: "seeders já foram executados"
Remova a flag: `docker-compose exec api rm /var/www/storage/.seeders_executed`

### Erro: "relation does not exist"
Rode as migrations: `docker-compose exec api php artisan migrate --force`

### Erro: "connection refused"
Verifique se o banco está rodando: `docker-compose ps`

### Banco lento
Verifique índices: `docker-compose exec db psql -U fitway_user -d fitway_db -c "\di"`

---

**Última Atualização**: 22/10/2025  
**Mantenedor**: Equipe Fitway
