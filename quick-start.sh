#!/bin/bash

echo "🚀 Início Rápido - Fitway Development"
echo "======================================"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Iniciando Docker..."
    # No Windows com Docker Desktop
    if command -v "Docker Desktop.exe" > /dev/null 2>&1; then
        start "Docker Desktop.exe"
        echo "⏳ Aguardando Docker inicializar..."
        sleep 30
    else
        echo "❌ Por favor, inicie o Docker manualmente e execute este script novamente."
        exit 1
    fi
fi

echo "🐳 Parando containers existentes (se houver)..."
docker-compose down

echo "🧹 Limpando volumes antigos (reset completo)..."
docker-compose down -v

echo "🔧 Construindo e iniciando containers..."
docker-compose up --build -d db api frontend-dev pgadmin

echo ""
echo "⏳ Aguardando serviços ficarem prontos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# aguarda o DB ficar healthy (healthcheck definido no compose)
ATTEMPTS=30
SLEEP=2
for i in $(seq 1 $ATTEMPTS); do
    STATUS=$(docker inspect -f '{{.State.Health.Status}}' fitway-postgres 2>/dev/null || echo "")
    if [ "$STATUS" = "healthy" ]; then
        echo "✅ PostgreSQL está pronto e saudável!"
        break
    fi
    echo "⏳ Aguardando PostgreSQL... ($i/$ATTEMPTS)"
    sleep $SLEEP
done

# checar se API subiu
echo ""
echo "🔍 Verificando container da API..."
if ! docker ps --format '{{.Names}}' | grep -q '^fitway-api$'; then
    echo "❌ Container da API não está rodando. Veja os logs:"
    docker-compose logs --no-color api | tail -n 100
    exit 1
fi

echo "✅ API está rodando!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ℹ️  INICIALIZAÇÃO AUTOMÁTICA DA API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "O container da API executa automaticamente (via start.sh):"
echo "  1. ✅ Aguardar PostgreSQL"
echo "  2. ✅ Instalar dependências Composer"
echo "  3. ✅ Gerar APP_KEY"
echo "  4. ✅ Executar DDL completo (cria TODAS as tabelas)"
echo "  5. ✅ Executar Seeders (popula dados)"
echo "  6. ❌ PULA Migrations (DDL já cria tudo)"
echo "  7. ✅ Iniciar Nginx + PHP-FPM"
echo ""
echo "⏳ Aguardando inicialização completa (30s)..."
sleep 30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Sistema iniciado com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs de Acesso:"
echo "   API:          http://localhost:8000"
echo "   Frontend Dev: http://localhost:5173  (Vite HMR)"
echo "   Frontend:     http://localhost:3000  (Build prod)"
echo "   pgAdmin:      http://localhost:5050"
echo ""
echo "📊 PostgreSQL (se precisar conectar direto):"
echo "   Host: localhost:5432"
echo "   DB:   fitway_db"
echo "   User: fitway_user"
echo "   Pass: fitway_password"
echo ""
echo "🔧 pgAdmin (http://localhost:5050):"
echo "   Email: admin@fitway.com"
echo "   Senha: admin123"
echo "   💡 Servidor PostgreSQL já vem pré-configurado!"
echo ""
echo "👤 Usuários de teste (login no sistema):"
echo "   admin@fitway.com     / 123456  (Administrador)"
echo "   personal@fitway.com  / 123456  (Personal Trainer)"
echo "   aluno@fitway.com     / 123456  (Aluno)"
echo ""
echo "💡 IMPORTANTE: Todos os usuários têm a senha: 123456"
echo ""
echo "🔍 Comandos úteis:"
echo "   docker-compose logs -f api        # Ver logs da API"
echo "   docker-compose ps                 # Status dos containers"
echo "   docker-compose restart api        # Reiniciar API"
echo "   docker-compose down               # Parar tudo"
echo "   docker-compose down -v            # Reset completo (apaga dados!)"
echo ""
echo "📚 Documentação:"
echo "   DOCKER_STARTUP_GUIDE.md  # Guia completo"
echo "   docs/FASE_*.md           # 13 fases documentadas"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Pronto para usar! Acesse http://localhost:5173 e faça login!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
