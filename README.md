# 🏋️ Fitway — Guia Rápido (para qualquer pessoa)

> Objetivo: subir tudo com 1 clique e usar. Sem conhecimento técnico.

## 1) O que você precisa ter

- Windows, macOS ou Linux
- Docker Desktop instalado e aberto (com Docker Compose)

## 2) Como iniciar (escolha 1 opção)

Windows (clique duas vezes):

- quick-start.bat  → recomendado
- setup-docker.bat → alternativa

Linux/macOS (Terminal):

```bash
chmod +x quick-start.sh setup-docker.sh
./quick-start.sh            # recomendado
# ou
./setup-docker.sh          # alternativa
```

O que acontece automaticamente:

- Sobe o banco PostgreSQL
- Sobe a API (Laravel, PHP 8.4)
- Sobe o site (React)
- Prepara o banco: DDL completo (primeiro start), depois migrations e seeders

## 3) Onde acessar

- Site (Frontend): <http://localhost:3000>
- API (Backend):   <http://localhost:8000>
- Banco (PostgreSQL): localhost:5432

## 4) Banco para conectar (DBeaver/pgAdmin)

- Host: localhost
- Porta: 5432
- Database: fitway_db
- Usuário: fitway_user
- Senha: fitway_password

## 5) Usuários de teste (para login)

- `admin@fitway.com`   / `password`  → Administrador
- `personal@fitway.com` / `password` → Personal
- `aluno@fitway.com`    / `password`  → Aluno

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
