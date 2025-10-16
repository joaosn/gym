# 🏋️ Fitway — Sistema de Gestão Esportiva

> **Sistema completo** de gestão de academia/centro esportivo com quadras de beach tennis, aulas em grupo, personal trainers e assinaturas.

## 🚀 Quick Start

### 1) Pré-requisitos

- **Docker Desktop** instalado e rodando
- **PowerShell** (Windows) ou **Bash** (Linux/macOS)
- Portas livres: 3000, 5050, 5173, 5432, 8000

### 2) Iniciar o Ambiente

**Windows** (PowerShell ou CMD):

```powershell
quick-start.bat
```

**Linux/macOS** (Terminal):

```bash
chmod +x quick-start.sh
./quick-start.sh
```

**O que acontece automaticamente**:

- ✅ Sobe PostgreSQL 16 (banco de dados)
- ✅ Sobe pgAdmin (interface gráfica do banco)
- ✅ Sobe API Laravel (backend PHP 8.4)
- ✅ Sobe Frontend React (produção e desenvolvimento)
- ✅ Aplica DDL completo (estrutura do banco)
- ✅ Roda migrations e seeders (dados de teste)

### 3) Acessar o Sistema

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| � **Frontend Dev** (HMR) | http://localhost:5173 | Ver usuários de teste abaixo |
| 🌐 **Frontend Prod** | http://localhost:3000 | Ver usuários de teste abaixo |
| 🔧 **API** | http://localhost:8000 | - |
| 🗄️ **pgAdmin** | http://localhost:5050 | `admin@fitway.com` / `admin123` |
| 📊 **PostgreSQL** | `localhost:5432` | `fitway_user` / `fitway_password` |

### 4) Usuários de Teste (Login)

Após rodar seeders, você pode fazer login com:

| Perfil | Email | Senha | Dashboard |
|--------|-------|-------|-----------|
| 👨‍💼 **Admin** | `admin@fitway.com` | `admin123` | http://localhost:5173/admin/dashboard |
| � **Personal** | `personal@fitway.com` | `personal123` | http://localhost:5173/personal/dashboard |
| 👤 **Aluno** | `aluno@fitway.com` | `aluno123` | http://localhost:5173/aluno/dashboard |


---

## 📚 Documentação Completa

Este projeto está em **desenvolvimento ativo**. Estamos removendo mocks e implementando funcionalidades reais.

### 📖 Guias Disponíveis

| Documento | Descrição |
|-----------|-----------|
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | 📘 **Guia completo do projeto** - nomenclaturas, padrões, arquitetura |
| [`docs/PLANO_DE_ACAO.md`](docs/PLANO_DE_ACAO.md) | 🎯 **Plano de implementação detalhado** - código, fases, cronograma |
| [`docs/RESUMO_EXECUTIVO.md`](docs/RESUMO_EXECUTIVO.md) | 📊 **Visão geral executiva** - status, marcos, roadmap |
| [`docs/MAPA_VISUAL.md`](docs/MAPA_VISUAL.md) | 🗺️ **Mapas e fluxos visuais** - arquitetura, endpoints, permissões |
| [`docs/arquitetura-dados-e-fluxos.md`](docs/arquitetura-dados-e-fluxos.md) | 🏗️ Arquitetura de dados e relacionamentos |
| [`docs/containers-e-comandos.md`](docs/containers-e-comandos.md) | 🐳 Comandos Docker úteis |

### 🔧 Stack Tecnológica

**Backend**:
- Laravel 10 + PHP 8.4
- PostgreSQL 16 (anti-overlap com GIST constraints)
- Laravel Sanctum (autenticação Bearer Token)

**Frontend**:
- React 18 + TypeScript
- Vite (HMR para dev)
- TailwindCSS + shadcn/ui
- React Query (server state)
- React Router (navegação)

**DevOps**:
- Docker Compose (4 serviços: DB, API, Frontend Dev, Frontend Prod)
- Nginx (proxy reverso)
- pgAdmin (gestão do banco)

---

## 🛠️ Comandos Úteis (Desenvolvimento)

### Docker

```powershell
# Subir apenas backend + DB
docker-compose up -d db api

# Subir frontend dev (com HMR)
docker-compose up -d frontend-dev

# Ver logs em tempo real
docker-compose logs -f api
docker-compose logs -f frontend-dev

# Reiniciar um serviço específico
docker-compose restart api

# Recriar após mudanças no .env.docker
docker-compose up -d --no-deps --force-recreate api

# Derrubar tudo (mantém volumes)
docker-compose down

# ⚠️ CUIDADO: Apagar volumes (perde dados do DB)
docker-compose down -v
```

### Laravel (API)

```powershell
# Artisan
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed
docker-compose exec api php artisan route:list
docker-compose exec api php artisan tinker

# Limpar caches
docker-compose exec api php artisan cache:clear
docker-compose exec api php artisan config:clear
docker-compose exec api php artisan route:clear

# Criar recursos
docker-compose exec api php artisan make:controller NomeController
docker-compose exec api php artisan make:model NomeModel
docker-compose exec api php artisan make:request NomeRequest
docker-compose exec api php artisan make:seeder NomeSeeder

# Composer
docker-compose exec api composer install
docker-compose exec api composer require pacote/nome

# Shell
docker-compose exec api sh
```

### PostgreSQL

```powershell
# Acessar psql
docker-compose exec db psql -U fitway_user -d fitway_db

# Comandos dentro do psql
\dt           # Listar tabelas
\d usuarios   # Descrever tabela
\l            # Listar bancos
\q            # Sair

# Backup
docker-compose exec db pg_dump -U fitway_user fitway_db > backup.sql

# Restore
docker-compose exec -T db psql -U fitway_user fitway_db < backup.sql
```

### Frontend

```powershell
# Instalar dependências
docker-compose exec frontend-dev npm install

# Adicionar pacote
docker-compose exec frontend-dev npm install nome-pacote

# Build de produção
docker-compose build frontend
docker-compose up -d frontend
```

---

## 🐛 Troubleshooting

### API retorna 500

```powershell
# 1. Ver logs
docker-compose logs -f api

# 2. Verificar .env.docker
# DB_HOST=db
# DB_DATABASE=fitway_db

# 3. Rodar migrations
docker-compose exec api php artisan migrate
```

### CORS Error

```powershell
# Verificar api/.env.docker:
# CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
# SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000

# Recriar API
docker-compose up -d --force-recreate api
```

### Frontend não conecta na API

```powershell
# 1. Verificar web/.env.docker
# VITE_API_URL=http://localhost:8000

# 2. API deve estar rodando
docker-compose ps api

# 3. Testar endpoint
curl http://localhost:8000/api/healthz
```

### Permissões no Laravel

```powershell
docker-compose exec api chown -R www-data:www-data storage bootstrap/cache
docker-compose exec api chmod -R 775 storage bootstrap/cache
```

---

## 🎯 Status do Projeto (15/10/2025)

### ✅ Concluído
- **Infraestrutura**: Docker completa (DB, API, Frontend Dev/Prod, pgAdmin)
- **Database**: DDL completo com constraints anti-overlap (GIST + TSTZRANGE)
- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS
- **Autenticação**: Laravel Sanctum funcionando (login/logout/me)
- **Fase 1**: ✅ Sistema de Autenticação (admin/personal/aluno)
- **Fase 2**: ✅ CRUD de Quadras (admin)
- **Fase 3**: ✅ CRUD de Planos (admin) + **Soft Delete**
- **Fase 4**: ✅ CRUD de Usuários (admin) + **Soft Delete**
- **Fase 5**: ✅ CRUD de Instrutores (admin) + **Soft Delete**
- **Fase 6**: ✅ **Soft Delete** implementado em todos os CRUDs

### 🎉 Novo: Soft Delete (Exclusão Lógica)
Todos os CRUDs agora usam **soft delete** ao invés de deletar permanentemente:
- ✅ Registros são marcados com `status = 'excluido'`
- ✅ Dados preservados no banco (auditoria + recuperação)
- ✅ Filtro automático nas listagens
- ✅ API continua retornando `204 No Content` (transparente)
- 📖 Documentação completa: `docs/FASE_6_SOFT_DELETE.md`

### 🔄 Em Progresso
- **Fase 7**: CRUD de Quadras + Reservas (anti-overlap)
- **Fase 8**: CRUD de Aulas + Ocorrências

### 📋 Próximas Fases
1. ⏳ Reservas de Quadra (3-4 dias)
2. ⏳ Aulas em Grupo (3-4 dias)
3. Admin - Planos (1-2 dias)
4. Aluno - Reservas (3 dias)
5. Aluno - Assinaturas (2 dias)
6. Admin - Aulas (3 dias)
7. Aluno - Aulas (2 dias)
8. Admin - Personals (2 dias)
9. Personal - Disponibilidade (2 dias)
10. Aluno - Sessões Personal (3 dias)
11. Pagamentos MVP (4 dias)
12. Refinamentos (3 dias)

**Estimativa Total**: ~6-7 semanas

Ver detalhes completos em [`docs/PLANO_DE_ACAO.md`](docs/PLANO_DE_ACAO.md)

---

## 🤝 Como Contribuir

1. Ler `.github/copilot-instructions.md` (guia completo)
2. Consultar `docs/PLANO_DE_ACAO.md` (fase atual)
3. Seguir padrões de nomenclatura definidos
4. Testar localmente antes de commitar
5. Atualizar documentação quando necessário

---

## 📞 Suporte

**Dúvidas sobre o projeto?**
- Consulte os documentos em `docs/`
- Verifique `api/database/ddl.sql` (fonte da verdade do banco)
- Use `docker-compose logs -f` para debugar

---

**Criado**: 2025  
**Equipe**: Fitway Development Team  
**Licença**: Proprietário


## 5) Conectar com DBeaver/outro cliente SQL

- Host: `localhost`
- Porta: `5432`
- Database: `fitway_db`
- Usuário: `fitway_user`
- Senha: `fitway_password`

## 5) Usuários de teste (para login)

- `admin@fitway.com` / `password` → Administrador
- `personal@fitway.com` / `password` → Personal Trainer
- `aluno@fitway.com` / `password` → Aluno

## 6) Se algo não subir

No Windows (PowerShell) ou macOS/Linux (Terminal):

```bash
docker-compose logs -f          # ver o que está acontecendo
docker-compose restart          # reiniciar serviços
docker-compose down && docker-compose up --build -d  # parar, reconstruir e subir
```

Problemas comuns:

- “Porta em uso” (3000, 8000 ou 5432): feche outro programa que usa a porta ou edite as portas no docker-compose.yml
- “Permissão no Laravel”: dentro do container

```bash
docker-compose exec api chown -R www-data:www-data storage bootstrap/cache
docker-compose exec api chmod -R 775 storage bootstrap/cache
```

- “Cache do Laravel”:

```bash
docker-compose exec api php artisan cache:clear
docker-compose exec api php artisan config:clear
docker-compose exec api php artisan route:clear
docker-compose exec api php artisan view:clear
```

## 7) Para desenvolvedores (opcional)

Comandos úteis:

```bash
docker-compose exec api php artisan migrate            # migrations
docker-compose exec api php artisan db:seed           # seeders
docker-compose exec api php artisan tinker            # console
docker-compose exec db psql -U fitway_user -d fitway_db
```

Estrutura (resumo):

```text
tccfitway/
├─ api/      # Laravel (API)
├─ web/      # React (Frontend)
└─ docker-compose.yml
```

Pronto. É só abrir o site e usar.
