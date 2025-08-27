# Dockerfile principal para o Render
FROM node:18-alpine AS frontend-builder

# Instalar dependências do frontend (incluindo devDependencies para o build)
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copiar código do frontend
COPY frontend/ ./
RUN npm run build

# Estágio do backend
FROM php:8.2-fpm-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    zip \
    mbstring \
    && docker-php-ext-enable \
    pdo_pgsql \
    pgsql

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos do backend
COPY backend/ ./

# Instalar dependências do PHP
RUN composer install --no-dev --optimize-autoloader

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# Copiar build do frontend
COPY --from=frontend-builder /app/frontend/dist /var/www/html/public/frontend

# Expor porta (Render usa variável PORT)
EXPOSE $PORT

# Comando para iniciar o servidor
CMD php artisan serve --host=0.0.0.0 --port=$PORT
