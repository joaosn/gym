#!/bin/bash

echo "🚀 Iniciando setup do ambiente Docker..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose não está instalado. Por favor, instale e tente novamente."
    exit 1
fi

# Copiar arquivo de ambiente se não existir
if [ ! -f "./api/.env" ]; then
    echo "📝 Copiando arquivo de ambiente para a API..."
    cp ./api/.env.docker ./api/.env
fi

if [ ! -f "./web/.env" ]; then
    echo "📝 Copiando arquivo de ambiente para o Frontend..."
    cp ./web/.env.docker ./web/.env
fi

# Gerar chave do Laravel
echo "🔑 Gerando chave da aplicação Laravel..."
docker-compose run --rm api php artisan key:generate

echo "🐳 Iniciando containers Docker..."
docker-compose up --build -d

echo "⏳ Aguardando banco de dados estar pronto..."
sleep 10

echo "📊 Executando migrations..."
docker-compose exec api php artisan migrate --force

echo "🌱 Executando seeders..."
docker-compose exec api php artisan db:seed --force

echo "🧹 Limpando cache..."
docker-compose exec api php artisan config:clear
docker-compose exec api php artisan cache:clear
docker-compose exec api php artisan route:clear
docker-compose exec api php artisan view:clear

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "🌐 Acesso às aplicações:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "📊 Credenciais do PostgreSQL:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: fitway_db"
echo "   Username: fitway_user"
echo "   Password: fitway_password"
echo ""
echo "📝 Para visualizar logs: docker-compose logs -f"
echo "🛑 Para parar: docker-compose down"
echo "🔄 Para reiniciar: docker-compose restart"
