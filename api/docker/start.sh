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
# Nem todo projeto API tem views; só faça cache se a pasta existir
if [ -d "resources/views" ]; then
  php artisan view:cache
else
  echo "ℹ️ Sem resources/views, pulando view:cache."
fi

# Executar DDL completo no primeiro start, se existir o seeder e o arquivo ddl.sql
if [ -f "database/ddl.sql" ] && php -r "include 'vendor/autoload.php'; echo class_exists('Database\\\\Seeders\\\\RunDdlSeeder') ? '1' : '0';" | grep -q 1; then
  if [ ! -f "/var/www/html/storage/app/.ddl_ran" ]; then
    echo "🧱 Executando DDL inicial (RunDdlSeeder)..."
    php artisan db:seed --class=RunDdlSeeder --force || true
    mkdir -p /var/www/html/storage/app
    touch /var/www/html/storage/app/.ddl_ran
  else
    echo "ℹ️ DDL já executado anteriormente, pulando..."
  fi
else
  echo "ℹ️ DDL não encontrado ou seeder ausente, pulando etapa de DDL."
fi

# Executar migrações após DDL
echo "📊 Executando migrações..."
php artisan migrate --force

# Executar seeders padrão
echo "🌱 Executando seeders..."
php artisan db:seed --force

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
