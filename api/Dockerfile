# Dockerfile para Laravel API
FROM php:8.4-fpm-alpine

# Instalar dependências do sistema
RUN apk update && apk add --no-cache \
    git \
    curl \
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    postgresql-client \
    nginx \
    supervisor \
    bash

# Limpar cache
# Limpar cache de APK (somente limpeza de cache, sem remover pacotes instalados)
RUN rm -rf /var/cache/apk/*

# Instalar extensões PHP
# Configurar GD com suporte a freetype e jpeg e instalar extensões necessárias
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Obter Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Evitar avisos do Composer ao rodar como root
ENV COMPOSER_ALLOW_SUPERUSER=1

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos do composer
COPY composer.json composer.lock ./

# Instalar dependências do Composer
# Importante: evitar scripts (que tentam rodar "artisan") na fase de build
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários e definir permissões
RUN mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html

# Copiar configurações do Nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Copiar configuração do Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copiar script de inicialização
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expor porta
EXPOSE 80

# Comando para iniciar o script de setup
CMD ["/usr/local/bin/start.sh"]
