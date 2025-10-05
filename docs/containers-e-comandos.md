# Guia de containers, modos (prod/dev) e comandos úteis

Este projeto roda quatro serviços com Docker Compose, permitindo usar o frontend em modo produção (Nginx) e em modo desenvolvimento (Vite + HMR) ao mesmo tempo.

## Serviços e portas

- db (PostgreSQL 16)
  - Porta: 5432 (host -> container)
  - Volume: `postgres_data`
  - Healthcheck: `pg_isready`
- api (Laravel 10 em PHP 8.4, Nginx + PHP-FPM + Supervisor)
  - Porta: 8000 (host -> container)
  - Bind mounts: `./api` (código), Nginx conf e scripts
  - Volumes: `api_storage`, `api_bootstrap_cache`
  - start.sh: espera DB, gera APP_KEY, cacheia config/rotas, aplica DDL (se `api/database/ddl.sql` existir), roda migrations/seeders e inicia Supervisor
  - Hot reload: sim (código montado via bind)
- frontend (produção – Nginx servindo build estático)
  - Porta: 3000 (host -> container)
  - Build feito no Dockerfile do `web`
  - Hot reload: não (precisa rebuild)
- frontend-dev (desenvolvimento – Vite + HMR)
  - Porta: 5173 (host -> container)
  - Bind mount: `./web` (código)
  - Volume: `web_node_modules` (para não poluir o host)
  - HMR: sim (watch com polling habilitado para Windows)

URLs principais:

- API: <http://localhost:8000> (raiz 200 OK JSON; health: `/api/healthz`)
- Frontend (prod): <http://localhost:3000>
- Frontend (dev/HMR): <http://localhost:5173>

CORS/Sanctum já permitem `localhost:5173`. Se mudar portas, ajuste `api/.env.docker` (variáveis `CORS_ALLOWED_ORIGINS` e `SANCTUM_STATEFUL_DOMAINS`).

## Quando usar cada frontend

- Produção (Nginx, porta 3000): para validar build final, headers, roteamento SPA em Nginx.
- Desenvolvimento (Vite HMR, porta 5173): para desenvolver rápido; salva e atualiza na hora.

Você pode rodar ambos em paralelo sem conflito de portas.

## Comandos úteis (PowerShell)

Observação: use na raiz do projeto (`C:\\laragon\\www\\tccFitway`). Separei por tópicos. Sinta-se à vontade para copiar/colar.

### Subir/derrubar serviços

```powershell
# Subir tudo (db, api, frontend prod e frontend dev)
docker-compose up -d db api frontend frontend-dev

# Subir apenas API e DB
docker-compose up -d db api

# Derrubar tudo (mantendo volumes)
docker-compose down

# Derrubar tudo e APAGAR volumes (cuidado: apaga dados do Postgres e caches)
docker-compose down -v
```

### Logs e status

```powershell
# Logs da API (seguir)
docker-compose logs -f api

# Logs do frontend dev (Vite)
docker-compose logs -f frontend-dev

# Últimas 200 linhas dos logs do frontend prod (Nginx)
docker-compose logs --tail=200 frontend
```

### Recriar/atualizar um serviço específico

```powershell
# Recriar o frontend dev após mudanças no vite.config.ts
docker-compose up -d --no-deps --force-recreate frontend-dev

# Recriar a API após ajustes no .env.docker ou nginx.conf
docker-compose up -d --no-deps --force-recreate api
```

### Acessar shell/rodar comandos dentro dos containers

```powershell
# Entrar no container da API
docker-compose exec api sh

# Rodar Artisan diretamente
docker-compose exec api php artisan route:clear
docker-compose exec api php artisan config:clear
docker-compose exec api php artisan cache:clear

# Migrar e rodar seeders
docker-compose exec api php artisan migrate --force
docker-compose exec api php artisan db:seed --force

# Composer dentro da API
docker-compose exec api composer install

# Vite/Node dentro do frontend-dev
docker-compose exec frontend-dev npm install
docker-compose exec frontend-dev npm run lint
```

### Banco de dados (PostgreSQL)

```powershell
# Abrir psql no container do DB
docker-compose exec db psql -U fitway_user -d fitway_db

# Listar bancos/tabelas dentro do psql
# \l  (lista bancos)
# \dt (lista tabelas)
```

### Build do frontend de produção

```powershell
# Rebuild do frontend estático e restart do Nginx
docker-compose build frontend
docker-compose up -d frontend
```

### Volumes e limpeza

```powershell
# Remover apenas o volume de node_modules do frontend-dev (se algo corromper)
docker volume rm tccfitway_web_node_modules

# Remover TODOS os volumes do projeto (destrói dados do DB!)
docker-compose down -v
```

## Fluxo recomendado no dia a dia

1. Suba DB, API e o Vite (dev):

  ```powershell
  docker-compose up -d db api frontend-dev
  ```

1. Abra <http://localhost:5173> (dev) e <http://localhost:8000/api/healthz> (API).

1. Quando quiser validar produção, também suba o frontend estático:

  ```powershell
  docker-compose up -d frontend
  ```

1. Precisa rebuildar o estático? Faça:

  ```powershell
  docker-compose build frontend; docker-compose up -d frontend
  ```

## Notas e troubleshooting

- Windows + Docker: file watching às vezes não detecta mudanças. O `frontend-dev` usa polling (CHOKIDAR) para garantir HMR.
- CORS: se ver erro de CORS ao usar <http://localhost:5173>, confira `api/.env.docker` (variáveis de CORS/Sanctum) e reinicie a API.
- APP_KEY: o `start.sh` gera automaticamente se estiver ausente. Se precisar, rode `docker-compose exec api php artisan key:generate`.
- Permissões: o `start.sh` ajusta `storage` e `bootstrap/cache`. Persistindo erro de permissão, rode:

```powershell
docker-compose exec api sh -lc "chown -R www-data:www-data storage bootstrap/cache"
```

- DDL inicial: se você colocar um `api/database/ddl.sql`, o `start.sh` aplica uma vez e depois segue com migrations/seeders. Para reexecutar manualmente, garanta que exista um seeder `RunDdlSeeder` e rode:

```powershell
docker-compose exec api php artisan db:seed --class=RunDdlSeeder --force
```

---

Qualquer ajuste nas portas/hosts, lembre de atualizar:

- `docker-compose.yml` (mapeamentos)
- `api/.env.docker` (CORS/Sanctum)
- `web/.env.docker` (VITE_API_URL)
- `web/vite.config.ts` (host/port HMR, se mudar)
