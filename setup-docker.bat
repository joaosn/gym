@echo off
echo 🚀 Iniciando setup do ambiente Docker...

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.
    pause
    exit /b 1
)

REM Verificar se o Docker Compose está instalado
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose não está instalado. Por favor, instale e tente novamente.
    pause
    exit /b 1
)

REM Copiar arquivo de ambiente se não existir
if not exist ".\api\.env" (
    echo 📝 Copiando arquivo de ambiente para a API...
    copy ".\api\.env.docker" ".\api\.env"
)

if not exist ".\web\.env" (
    echo 📝 Copiando arquivo de ambiente para o Frontend...
    copy ".\web\.env.docker" ".\web\.env"
)

echo 🐳 Iniciando containers Docker...
docker-compose up --build -d

echo ⏳ Aguardando banco de dados estar pronto...
timeout /t 15 /nobreak >nul

echo 🔑 Gerando chave da aplicação Laravel...
docker-compose exec api php artisan key:generate --force

echo 📊 Executando migrations...
docker-compose exec api php artisan migrate --force

echo 🌱 Executando seeders...
docker-compose exec api php artisan db:seed --force

echo 🧹 Limpando cache...
docker-compose exec api php artisan config:clear
docker-compose exec api php artisan cache:clear
docker-compose exec api php artisan route:clear
docker-compose exec api php artisan view:clear

echo.
echo ✅ Setup concluído com sucesso!
echo.
echo 🌐 Acesso às aplicações:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    PostgreSQL: localhost:5432
echo.
echo 📊 Credenciais do PostgreSQL:
echo    Host: localhost
echo    Port: 5432
echo    Database: fitway_db
echo    Username: fitway_user
echo    Password: fitway_password
echo.
echo 📝 Para visualizar logs: docker-compose logs -f
echo 🛑 Para parar: docker-compose down
echo 🔄 Para reiniciar: docker-compose restart
echo.
pause
