#!/bin/bash
# =====================================================================
# SCRIPT DE INICIALIZAÇÃO AUTOMÁTICA DO BANCO DE DADOS
# =====================================================================
# Este script:
# 1. Verifica se o banco já foi inicializado
# 2. Roda migrations se necessário
# 3. Roda seeders se necessário (apenas uma vez)
#
# Criado em: 22/10/2025
# =====================================================================

set -e

echo "🚀 Iniciando verificação do banco de dados..."

# Flag para verificar se já rodou
SEED_FLAG="/var/www/storage/.seeders_executed"

# Aguardar banco estar disponível
echo "⏳ Aguardando PostgreSQL estar pronto..."
until pg_isready -h db -p 5432 -U fitway_user; do
  echo "⏳ PostgreSQL não está pronto - aguardando..."
  sleep 2
done

echo "✅ PostgreSQL está pronto!"

# Rodar migrations
echo "📦 Executando migrations..."
php artisan migrate --force

# Verificar se seeders já foram executados
if [ ! -f "$SEED_FLAG" ]; then
  echo "🌱 Executando seeders pela primeira vez..."
  
  # Rodar seeders na ordem correta
  php artisan db:seed --class=UsuarioSeeder --force
  php artisan db:seed --class=PlanoSeeder --force
  php artisan db:seed --class=QuadraSeeder --force
  php artisan db:seed --class=InstrutorSeeder --force
  php artisan db:seed --class=AulaSeeder --force
  php artisan db:seed --class=AssinaturaSeeder --force
  php artisan db:seed --class=SessaoPersonalSeeder --force
  
  # Criar flag indicando que seeders foram executados
  touch "$SEED_FLAG"
  echo "✅ Seeders executados com sucesso!"
else
  echo "✅ Seeders já foram executados anteriormente (flag encontrada)"
fi

echo "🎉 Banco de dados pronto para uso!"
