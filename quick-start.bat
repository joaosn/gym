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

echo 🧹 Limpando volumes antigos (reset completo)...
docker-compose down -v

echo 🔧 Construindo e iniciando containers...
docker-compose up --build -d db api frontend-dev pgadmin

echo.
echo ⏳ Aguardando serviços ficarem prontos...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
timeout /t 5 /nobreak >nul

echo.
echo ℹ️  INICIALIZAÇÃO AUTOMÁTICA DA API
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo O container da API executa automaticamente (via start.sh):
echo   1. ✅ Aguardar PostgreSQL
echo   2. ✅ Instalar dependências Composer
echo   3. ✅ Gerar APP_KEY
echo   4. ✅ Executar DDL completo (cria TODAS as tabelas)
echo   5. ✅ Executar Seeders (popula dados)
echo   6. ❌ PULA Migrations (DDL já cria tudo)
echo   7. ✅ Iniciar Nginx + PHP-FPM
echo.
echo ⏳ Aguardando inicialização completa (30s)...
timeout /t 30 /nobreak >nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Sistema iniciado com sucesso!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 URLs de Acesso:
echo    API:          http://localhost:8000
echo    Frontend Dev: http://localhost:5173  (Vite HMR)
echo    Frontend:     http://localhost:3000  (Build prod)
echo    pgAdmin:      http://localhost:5050
echo.
echo 📊 PostgreSQL (se precisar conectar direto):
echo    Host: localhost:5432
echo    DB:   fitway_db
echo    User: fitway_user
echo    Pass: fitway_password
echo.
echo 🔧 pgAdmin (http://localhost:5050):
echo    Email: admin@fitway.com
echo    Senha: admin123
echo    💡 Servidor PostgreSQL já vem pré-configurado!
echo.
echo 👤 Usuários de teste (login no sistema):
echo    admin@fitway.com     / 123456  (Administrador)
echo    personal@fitway.com  / 123456  (Personal Trainer)
echo    aluno@fitway.com     / 123456  (Aluno)
echo.
echo � IMPORTANTE: Todos os usuários têm a senha: 123456
echo.
echo �🔍 Comandos úteis:
echo    docker-compose logs -f api        # Ver logs da API
echo    docker-compose ps                 # Status dos containers
echo    docker-compose restart api        # Reiniciar API
echo    docker-compose down               # Parar tudo
echo    docker-compose down -v            # Reset completo (apaga dados!)
echo.
echo 📚 Documentação:
echo    DOCKER_STARTUP_GUIDE.md  # Guia completo
echo    docs\FASE_*.md           # 13 fases documentadas
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 Pronto para usar! Acesse http://localhost:5173 e faça login!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
