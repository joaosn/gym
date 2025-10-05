@echo off
echo 🚀 Início Rápido - Fitway Development
echo ======================================

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo 🐳 Parando containers existentes (se houver)...
docker-compose down

echo 🧹 Limpando volumes antigos...
docker-compose down -v

echo 🔧 Construindo e iniciando containers...
docker-compose up --build -d

echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 25 /nobreak >nul

echo 🔑 Configurando aplicação Laravel...
docker-compose exec -T api php artisan key:generate --force

echo 📊 Executando migrações...
docker-compose exec -T api php artisan migrate --force

echo 🌱 Populando banco de dados...
docker-compose exec -T api php artisan db:seed --force

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 🌐 URLs de Acesso:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo.
echo 📊 Banco PostgreSQL:
echo    Host: localhost:5432
echo    DB: fitway_db
echo    User: fitway_user
echo    Pass: fitway_password
echo.
echo 🔍 Comandos úteis:
echo    docker-compose logs -f     # Ver logs
echo    docker-compose restart     # Reiniciar
echo    docker-compose down        # Parar tudo
echo.
echo 👤 Usuários de teste (use no login):
echo    admin@fitway.com    # Administrador
echo    personal@fitway.com # Personal Trainer
echo    aluno@fitway.com    # Aluno
echo    (senha: password para todos)
echo.
pause
