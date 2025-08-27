# Dockerfile para o backend Laravel
FROM php:8.2-fpm

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos de dependências
COPY composer.json ./

# Instalar dependências do PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copiar código da aplicação
COPY . .

# Definir permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Expor porta 9000 para PHP-FPM
EXPOSE 9000

# Comando para iniciar PHP-FPM
CMD ["php-fpm"] 