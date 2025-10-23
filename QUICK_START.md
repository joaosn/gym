# 🚀 Quick Start - Fitway

## Pré-requisitos

- Docker Desktop instalado e rodando
- Git instalado
- 8GB RAM mínimo
- Porta 5432 (PostgreSQL), 8000 (API) e 5173 (Frontend) livres

## 🏃‍♂️ Inicialização Rápida (30 segundos)

```bash
# 1. Clone o repositório (se ainda não tiver)
git clone https://github.com/joaosn/tccfitway.git
cd tccfitway

# 2. Suba TUDO de uma vez
docker-compose up -d

# 3. Aguarde ~30 segundos e acesse
# Frontend Dev: http://localhost:5173
# API: http://localhost:8000
```

**Pronto!** O sistema já está com:
- ✅ Banco criado
- ✅ Migrations rodadas
- ✅ Seeders executados (32 alunos + admins + instrutores + 8 sessões)

## 🔐 Logins de Teste

### Admin
- Email: `admin@fitway.com`
- Senha: `senha123`
- Acesso: Painel administrativo completo

### Instrutor/Personal
- Email: `personal@fitway.com`
- Senha: `senha123`
- Acesso: Dashboard, Horários, Sessões Personal, Perfil

### Aluno
- Email: `aluno@fitway.com`
- Senha: `senha123`
- Acesso: Reservas, Aulas, Sessões Personal

### Mais Alunos (32 total)
- `amanda.costa.18@fitway.com` / `senha123`
- `bruno.silva.19@fitway.com` / `senha123`
- `carlos.pereira.20@fitway.com` / `senha123`
- ... (todos com senha: `senha123`)

## 📊 Verificar se Tudo Funcionou

### Backend (API)

```bash
# Ver logs da API
docker-compose logs -f api

# Deve mostrar:
# ✅ PostgreSQL está pronto!
# 📦 Executando migrations...
# 🌱 Executando seeders pela primeira vez...
# ✅ Seeders executados com sucesso!
# 🎉 Banco de dados pronto para uso!
```

### Banco de Dados

```bash
# Conectar no banco
docker-compose exec db psql -U fitway_user -d fitway_db

# Ver tabelas
\dt

# Contar usuários
SELECT COUNT(*) FROM usuarios;
# Deve retornar: 37 (32 alunos + 3 admins + 2 instrutores)

# Ver sessões personal
SELECT COUNT(*) FROM sessoes_personal;
# Deve retornar: 8 sessões de teste

# Sair
\q
```

### Frontend

```bash
# Ver logs do frontend
docker-compose logs -f frontend-dev

# Abrir navegador
http://localhost:5173
```

## 🛠️ Comandos Úteis

### Ver Status dos Containers

```bash
docker-compose ps
```

### Parar Tudo

```bash
docker-compose down
```

### Reiniciar Tudo

```bash
docker-compose restart
```

### Reconstruir (se mudou Dockerfile)

```bash
docker-compose up -d --build
```

### Ver Logs de um Container Específico

```bash
docker-compose logs -f api
docker-compose logs -f db
docker-compose logs -f frontend-dev
```

### Rodar Comando Dentro do Container

```bash
# Entrar no shell da API
docker-compose exec api bash

# Rodar Artisan
docker-compose exec api php artisan route:list

# Rodar Tinker (console Laravel)
docker-compose exec api php artisan tinker
```

## 🔧 Troubleshooting

### Erro: "port is already allocated"

Alguma porta está sendo usada. Verifique:

```bash
# Windows
netstat -ano | findstr :5432
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Matar processo
taskkill /PID <PID> /F
```

### Erro: "Cannot connect to database"

```bash
# Verificar se o banco está rodando
docker-compose ps

# Reiniciar o banco
docker-compose restart db

# Ver logs do banco
docker-compose logs -f db
```

### Erro: "Seeders já foram executados"

Se você quer rodar seeders novamente:

```bash
# Deletar flag
docker-compose exec api rm /var/www/storage/.seeders_executed

# Reiniciar API
docker-compose restart api
```

### Resetar TUDO do Zero

```bash
# Parar containers
docker-compose down

# Remover volumes (ATENÇÃO: Apaga banco de dados!)
docker volume rm tccfitway_postgres_data
docker volume rm tccfitway_api_vendor
docker volume rm tccfitway_api_storage

# Subir novamente
docker-compose up -d --build
```

### Frontend não atualiza (cache)

```bash
# Reconstruir frontend
docker-compose up -d --build frontend-dev

# OU limpar cache do navegador (Ctrl+Shift+R)
```

## 📁 Estrutura do Projeto

```
tccFitway/
├── api/                          # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/          # Migrations (estrutura do banco)
│   │   ├── seeders/             # Seeders (dados de teste)
│   │   ├── ddl.sql              # Schema SQL documentado
│   │   └── schema_dump.sql      # Dump automático do schema
│   ├── routes/
│   │   └── api.php              # Rotas da API
│   ├── init-db.sh               # Script de inicialização automática
│   └── Dockerfile
├── web/                          # Frontend React
│   ├── src/
│   │   ├── pages/               # Páginas
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── services/            # Serviços (chamadas API)
│   │   └── types/               # Tipos TypeScript
│   └── Dockerfile
├── docs/                         # Documentação
│   ├── BANCO_DE_DADOS.md        # Guia do banco de dados
│   ├── API.md                   # Documentação da API
│   └── FASE_*.md                # Fases do projeto
├── docker-compose.yml            # Orquestração dos containers
└── README.md
```

## 🎯 Próximos Passos

1. **Explorar o sistema**
   - Login como Admin: Criar usuários, planos, quadras
   - Login como Instrutor: Ver horários, sessões, perfil
   - Login como Aluno: Fazer reservas, ver aulas

2. **Testar APIs**
   - Documentação: `docs/API.md`
   - Postman/Insomnia: Importar rotas de `routes/api.php`

3. **Desenvolver features**
   - Ver `docs/FASE_*.md` para plano de desenvolvimento
   - Criar branches para cada feature
   - Fazer PRs com testes

## 📚 Documentação Completa

- **Banco de Dados**: `docs/BANCO_DE_DADOS.md`
- **API**: `docs/API.md`
- **Arquitetura**: `docs/arquitetura-dados-e-fluxos.md`
- **Fases do Projeto**: `docs/FASE_*.md`

## 🆘 Precisa de Ajuda?

1. Verifique a documentação em `docs/`
2. Veja os logs: `docker-compose logs -f`
3. Entre no shell: `docker-compose exec api bash`
4. Rode Tinker: `php artisan tinker`

---

**Última Atualização**: 22/10/2025  
**Versão**: 2.0 - Inicialização Automática
