#!/bin/sh

# Script de inicialização para o Render
echo "🚀 Iniciando Sistema de Romaneio..."

# Verificar se o .env existe, se não, criar um básico
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env básico..."
    cat > .env << EOF
APP_NAME="Sistema de Romaneio"
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
DB_CONNECTION=pgsql
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF
fi

# Gerar chave da aplicação (ignorar erro se já existir)
echo "🔑 Gerando chave da aplicação..."
php artisan key:generate --force || echo "⚠️  Chave já existe ou erro ignorado"

# Executar migrations
echo "🗄️  Executando migrations..."
php artisan migrate --force

# Executar seeders
echo "🌱 Executando seeders..."
php artisan db:seed --force

# Iniciar servidor
echo "🌐 Iniciando servidor na porta $PORT..."
php artisan serve --host=0.0.0.0 --port=$PORT
