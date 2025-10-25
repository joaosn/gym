#!/bin/bash

set -e

echo "🚀 Iniciando container da API Laravel..."

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USERNAME; do
  echo "Banco de dados não está pronto, aguardando..."
  sleep 2
done

echo "✅ Banco de dados conectado!"

# Instalar/atualizar dependências do Composer apenas se necessário
echo "📦 Verificando dependências do Composer..."
if [ ! -f "vendor/autoload.php" ]; then
  echo "📦 Instalando dependências (primeira vez)..."
  composer install --no-dev --optimize-autoloader --no-interaction
else
  echo "🔁 Atualizando autoloader..."
  composer dump-autoload -o
fi

# Gerar chave da aplicação se não existir
if [ ! -f ".env" ]; then
  cp .env.docker .env
fi

# Garantir que há uma linha APP_KEY= no .env para evitar erro do artisan
if ! grep -q "^APP_KEY=" .env; then
  echo "APP_KEY=" >> .env
fi

# Verificar se a chave da aplicação precisa ser gerada
# Gera se placeholder, vazia, ou não estiver em formato base64:
if grep -q "APP_KEY=base64:GENERATE_YOUR_KEY_HERE" .env || grep -q "^APP_KEY=$" .env || ! grep -q "^APP_KEY=base64:" .env; then
  echo "🔑 Gerando chave da aplicação..."
  php artisan key:generate --force || true
fi

# Descobrir pacotes (em caso de --no-scripts no build)
php artisan package:discover --ansi || true

# Cache de configurações
echo "🧹 Configurando cache..."
php artisan config:cache
php artisan route:cache

# Cache de views
if [ -d "resources/views" ]; then
  php artisan view:cache
else
  echo "ℹ️ Sem resources/views, pulando view:cache."
fi

# ============================================================
# ETAPA 1: EXECUTAR DDL (APENAS UMA VEZ)
# ============================================================
DDL_FLAG="/var/www/html/storage/app/.ddl_executed"

if [ ! -f "$DDL_FLAG" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🗄️  PRIMEIRA EXECUÇÃO: Criando estrutura do banco"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ -f "database/ddl.sql" ]; then
    echo "📋 Executando DDL completo..."
    php artisan db:seed --class=RunDdlSeeder --force
    
    # Marcar DDL como executado
    mkdir -p /var/www/html/storage/app
    touch "$DDL_FLAG"
    echo "✅ DDL executado com sucesso!"
  else
    echo "❌ ERRO: database/ddl.sql não encontrado!"
    exit 1
  fi
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🌱 Executando seeders de dados iniciais"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  php artisan db:seed --force
  echo "✅ Seeders executados!"
  
else
  echo "ℹ️  DDL já foi executado anteriormente (pulando)"
  echo "💡 Para recriar o banco, delete o volume: docker-compose down -v"
fi

# ============================================================
# ⚠️  MIGRATIONS DESABILITADAS
# ============================================================
# Motivo: Todas as tabelas já estão no DDL completo
# Se precisar de migrations no futuro, descomente a linha abaixo:
# php artisan migrate --force

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Criar link simbólico para storage público (ignorar se já existir)
php artisan storage:link || true

# Ajustar permissões
echo "🔧 Ajustando permissões..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

echo "✅ Inicialização concluída! Iniciando servidor..."

# Garantir diretórios/arquivos para logs e pid do supervisor
mkdir -p /var/log/supervisor
touch /var/log/supervisor/supervisord.log
mkdir -p /var/run

# Iniciar supervisor (sobrepõe logfile para /dev/null)
exec /usr/bin/supervisord -l /dev/null -c /etc/supervisor/conf.d/supervisord.conf
