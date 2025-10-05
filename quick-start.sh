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

echo "🧹 Limpando volumes antigos..."
docker-compose down -v

echo "🔧 Construindo e iniciando containers..."
docker-compose up --build -d

echo "⏳ Aguardando serviços ficarem prontos..."
# aguarda o DB ficar healthy (healthcheck definido no compose)
ATTEMPTS=30
SLEEP=2
for i in $(seq 1 $ATTEMPTS); do
    STATUS=$(docker inspect -f '{{.State.Health.Status}}' fitway-postgres 2>/dev/null || echo "")
    if [ "$STATUS" = "healthy" ]; then
        echo "✅ Banco saudável."
        break
    fi
    echo "⏳ Aguardando banco... ($i/$ATTEMPTS)"
    sleep $SLEEP
done

# checar se API subiu
if ! docker ps --format '{{.Names}}' | grep -q '^fitway-api$'; then
    echo "❌ Container da API não está rodando. Veja os logs:"
    docker-compose logs --no-color api | tail -n 100
    exit 1
fi

echo "🔑 Configurando aplicação Laravel..."
docker-compose exec -T api php artisan key:generate --force || true

echo "📊 Executando migrações..."
docker-compose exec -T api php artisan migrate --force || true

echo "🌱 Populando banco de dados..."
docker-compose exec -T api php artisan db:seed --force || true

echo ""
echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "🌐 URLs de Acesso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "📊 Banco PostgreSQL:"
echo "   Host: localhost:5432"
echo "   DB: fitway_db"
echo "   User: fitway_user"
echo "   Pass: fitway_password"
echo ""
echo "🔍 Comandos úteis:"
echo "   docker-compose logs -f     # Ver logs"
echo "   docker-compose restart     # Reiniciar"
echo "   docker-compose down        # Parar tudo"
echo ""
echo "👤 Usuários de teste (use no login):"
echo "   admin@fitway.com    # Administrador"
echo "   personal@fitway.com # Personal Trainer"
echo "   aluno@fitway.com    # Aluno"
echo "   (senha: password para todos)"
